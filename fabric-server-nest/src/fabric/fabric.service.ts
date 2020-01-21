import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { WINSTON } from '../constant';
import { Logger } from 'winston';
import * as Client from 'fabric-client';
import { ConfigService } from '../config/config.service';
import { readFileSync } from 'fs';
import { ChannelRequest, Channel, ProposalResponse } from 'fabric-client';
import { Organization } from '../entity/User.entity';
import { ChaincodeRoundDto } from './fabric.dto';

@Injectable()
export class FabricService {

    private readonly channelName = 'mychannel';
    private readonly chaincodeName = 'mycc';

    constructor(
        @Inject(WINSTON) private readonly logger: Logger,
        private readonly configService: ConfigService,
    ) { }

    /**
     * User Management
     */

    public async checkExistUser(username: string, organization: Organization): Promise<boolean> {
        this.logger.info('================== Find user ==================');
        const client = await this.getClientForOrganization(organization);
        const user = await client.getUserContext(username, true);
        return user && user.isEnrolled();
    }

    public async createUser(username: string, organization: Organization) {
        this.logger.info('================= Create user =================');
        const isEnrolled = await this.checkExistUser(username, organization);
        if (isEnrolled) {
            throw new BadRequestException(`User with username "${username}" already exist`);
        }
        try {
            const client = await this.getClientForOrganization(organization);
            const adminUser = await client.setUserContext(this.configService.getFabricAdminContextForOrg(organization));
            const caClient = client.getCertificateAuthority();
            const password = await caClient.register({
                enrollmentID: username,
                affiliation: `${organization.toLowerCase()}.department1`,
            }, adminUser);
            client.setUserContext({ username, password });
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
    }

    /**
     * Channel Management
     */

    public async getPeersNameInOrg(organization: Organization): Promise<string[]> {
        this.logger.info('================= Get peers in org =================');
        const client = await this.getClientForOrganization(organization);
        if (!client) {
            throw new BadRequestException('Organization not found');
        }
        const peers = client.getPeersForOrg(`${organization}MSP`);
        return peers.map(peer => peer.getName());
    }

    /**
     * Channel Management
     */

    public async getChannel(organization: Organization): Promise<Channel | null> {
        this.logger.info('================= Get channel =================');
        const client = await this.getClientForOrganization(organization);
        try {
            return client.getChannel(this.channelName);
        } catch (error) {
            return null;
        }
    }

    public async listChannelNameInPeer(peer: string, organization: Organization, username: string): Promise<string[]> {
        this.logger.info('================= List channel name in peer =================');
        const client = await this.getClientForOrganization(organization);
        if (!client) {
            throw new BadRequestException('Organization not found');
        }
        try {
            await client.setUserContext({ username });
            const response = await client.queryChannels(peer);
            return response.channels.map(o => o.channel_id);
        } catch (error) {
            throw new BadRequestException(error.toString());
        }
    }

    public async createChannel(organization: Organization) {
        this.logger.info('================= Create channel =================');
        const client = await this.getClientForOrganization(organization);
        const channel = await this.getChannel(organization);
        if (!channel) {
            throw new BadRequestException('Channel not exist');
        }
        const envelope = readFileSync(`/home/server/artifacts/channel/${this.channelName}.tx`);
        const channelConfig = client.extractChannelConfig(envelope);
        const signature = client.signChannelConfig(channelConfig);
        const request = {
            config: channelConfig,
            signatures: [signature],
            name: this.channelName,
            txId: client.newTransactionID(true),
        };
        const result = await client.createChannel(request as ChannelRequest);
        if (!(result && result.status === 'SUCCESS')) {
            this.logger.error(`${result ? 'result is undefined' : result.info}`);
            throw new BadRequestException('Cannot create channel');
        }
    }

    public async joinChannel(organization: Organization) {
        this.logger.info('================= Join channel =================');
        const client = await this.getClientForOrganization(organization);
        const channel = await this.getChannel(organization);
        const peers = await this.getPeersNameInOrg(organization);
        const transactionId = client.newTransactionID(true);
        const block = await channel.getGenesisBlock({
            txId: transactionId,
        });
        const result = await channel.joinChannel({
            targets: peers,
            txId: client.newTransactionID(true),
            block,
        });
        const errorIndex = result.findIndex((o) => o instanceof Error);
        if (errorIndex > -1) {
            throw new BadRequestException('Some peer has already join channel');
        }
    }

    /**
     * Chaincode Management
     */

    public async installChaincode(organization: Organization) {
        this.logger.info('================= Install chaincode =================');
        const client = await this.getClientForOrganization(organization);
        const peers = await this.getPeersNameInOrg(organization);
        const [response] = await client.installChaincode({
            targets: peers,
            chaincodePath: `/home/server/artifacts/src/github.com/example_cc/node`,
            chaincodeId: this.chaincodeName,
            chaincodeVersion: 'v0',
            chaincodeType: 'node',
        });
        const errorIndex = response.findIndex((o) => o instanceof Error);
        if (errorIndex > -1) {
            throw new BadRequestException('Some peer has already installed chaincode');
        }
    }

    public async instantiateChaincode(
        organizationName: string,
    ) {
        this.logger.info('================= Instantiate chaincode =================');
        const client = await this.getClientForOrganization(organizationName);
        const channel = client.getChannel(this.channelName);
        const txId = client.newTransactionID(true);
        const [proposalResponses, proposal] = await channel.sendInstantiateProposal({
            'chaincodeId': this.chaincodeName,
            'chaincodeType': 'node',
            'chaincodeVersion': 'v0',
            txId,
            'endorsement-policy': {
                identities: [
                    { role: { name: 'member', mspId: 'BuildingMSP' } },
                    { role: { name: 'member', mspId: 'PVMSP' } },
                    { role: { name: 'member', mspId: 'UtilityMSP' } },
                ],
                policy: {
                    '1-of': [
                        { 'signed-by': 0 },
                        { 'signed-by': 1 },
                    ],
                },
            },
        }, 360000);

        const allGood = proposalResponses.reduce((previous, current) =>
            (previous &&
                !(current instanceof Error) &&
                current.response && current.response.status === 200
            ), true);
        if (allGood) {
            const eventHubs = channel.getChannelEventHubsForOrg();
            await Promise.all([
                ...eventHubs.map(eventHub => {
                    const eventTimeout = setTimeout(() => {
                        eventHub.disconnect();
                    }, 60000);
                    return new Promise((resolve, reject) => {
                        eventHub.registerTxEvent(txId.getTransactionID(), (transactionId: string, code: string, blockNumber: number) => {
                            clearTimeout(eventTimeout);
                            if (code !== 'VALID') {
                                reject(new Error());
                            } else {
                                resolve();
                            }
                        }, (error) => {
                            clearTimeout(eventTimeout);
                            reject(error);
                        }, {
                            unregister: true, disconnect: true,
                        });
                        eventHub.connect();
                    });
                }),
                channel.sendTransaction({
                    txId,
                    proposalResponses: proposalResponses as ProposalResponse[],
                    proposal,
                }),
            ]);
        }
    }

    public async invokeChaincode(
        fcn: string,
        args: string[],
        organization: Organization,
        username: string,
    ) {
        this.logger.info('================= Invoke chaincode =================');
        const client = await this.getClientForOrganization(organization);
        await client.setUserContext({ username });
        const channel = client.getChannel(this.channelName);
        const peers = await this.getPeersNameInOrg(organization);
        const txId = client.newTransactionID(true);
        const [proposalResponses, proposal] = await channel.sendTransactionProposal({
            targets: peers,
            chaincodeId: 'mycc',
            fcn,
            args,
            txId,
        });
        const allGood = proposalResponses.reduce((previous, current) =>
            (previous &&
                !(current instanceof Error) &&
                current.response && current.response.status === 200
            ), true);
        if (allGood) {
            const eventHubs = channel.getChannelEventHubsForOrg();
            try {
                await Promise.all([
                    ...eventHubs.map(eventHub => {
                        const eventTimeout = setTimeout(() => {
                            eventHub.disconnect();
                        }, 60000);
                        return new Promise((resolve, reject) => {
                            eventHub.registerTxEvent(txId.getTransactionID(), (transactionId: string, code: string, blockNumber: number) => {
                                clearTimeout(eventTimeout);
                                if (code !== 'VALID') {
                                    reject(new Error());
                                } else {
                                    resolve();
                                }
                            }, (error) => {
                                clearTimeout(eventTimeout);
                                reject(error);
                            }, {
                                unregister: true, disconnect: true,
                            });
                            eventHub.connect();
                        });
                    }),
                    channel.sendTransaction({
                        txId,
                        proposalResponses: proposalResponses as ProposalResponse[],
                        proposal,
                    }),
                ]);
            } catch (error) {
                console.log(error);
            }
        }
    }

    public async queryChaincode(
        args: string[],
        fcn: string,
        organization: Organization,
        username: string,
    ): Promise<string> {
        this.logger.info('================= Query chaincode =================');
        const client = await this.getClientForOrganization(organization);
        await client.setUserContext({ username });
        const targets = await this.getPeersNameInOrg(organization);
        const channel = client.getChannel(this.channelName);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        const responsePayloads = await channel.queryByChaincode({
            targets,
            chaincodeId: this.chaincodeName,
            fcn,
            args,
        }, true);
        this.logger.info(responsePayloads.map(o => o.toString()));
        return responsePayloads.toString();
    }

    /**
     * Chaincode function
     */

    public async createRound(id: string, organization: Organization, username: string) {
        await this.invokeChaincode('createRound', [id, (new Date()).toISOString()], organization, username);
    }

    public async addSellerBid(roundId: string, price: number, organization: Organization, username: string) {
        await this.invokeChaincode('addSellerBid', [roundId, username, `${price}`, (new Date()).toISOString()], organization, username);
    }

    public async addBuyerBid(roundId: string, price: number, organization: Organization, username: string) {
        await this.invokeChaincode('addSellerBid', [roundId, username, `${price}`, (new Date()).toISOString()], organization, username);
    }

    public async getChaincode(id: string, organization: Organization, username: string): Promise<ChaincodeRoundDto> {
        const result = await this.queryChaincode([id], 'getRound', organization, username);
        const resultObject = JSON.parse(result) as ChaincodeRoundDto;
        return resultObject;
    }

    /**
     * Private functions
     */

    private async getClientForOrganization(
        organizationName: string,
    ): Promise<Client> {
        const client = Client.loadFromConfig('/home/server/artifacts/network-config.yaml');
        client.loadFromConfig(`/home/server/artifacts/${organizationName.toLowerCase()}.yaml`);
        await client.initCredentialStores();
        return client;
    }
}
