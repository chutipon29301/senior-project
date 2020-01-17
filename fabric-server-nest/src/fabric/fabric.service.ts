import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { WINSTON } from '../constant';
import { Logger } from 'winston';
import * as Client from 'fabric-client';
import { ConfigService } from '../config/config.service';
import { readFileSync } from 'fs';
import { ChannelRequest, Channel, ProposalResponse } from 'fabric-client';
import { Organization } from '../entity/User.entity';

@Injectable()
export class FabricService {

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

    public async getChannel(channelName: string, organization: Organization): Promise<Channel | null> {
        this.logger.info('================= Get channel =================');
        const client = await this.getClientForOrganization(organization);
        try {
            return client.getChannel(channelName);
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

    public async createChannel(channelName: string, organization: Organization) {
        this.logger.info('================= Create channel =================');
        const client = await this.getClientForOrganization(organization);
        const channel = await this.getChannel(channelName, organization);
        if (!channel) {
            throw new BadRequestException('Channel not exist');
        }
        const envelope = readFileSync(`/home/server/artifacts/channel/${channelName}.tx`);
        const channelConfig = client.extractChannelConfig(envelope);
        const signature = client.signChannelConfig(channelConfig);
        const request = {
            config: channelConfig,
            signatures: [signature],
            name: channelName,
            txId: client.newTransactionID(true),
        };
        const result = await client.createChannel(request as ChannelRequest);
        if (!(result && result.status === 'SUCCESS')) {
            this.logger.error(`${result ? 'result is undefined' : result.info}`);
            throw new BadRequestException('Cannot create channel');
        }
    }

    public async joinChannel(channelName: string, organization: Organization) {
        this.logger.info('================= Join channel =================');
        const client = await this.getClientForOrganization(organization);
        const channel = await this.getChannel(channelName, organization);
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
            chaincodeId: 'mycc',
            chaincodeVersion: 'v0',
            chaincodeType: 'node',
        });
        const errorIndex = response.findIndex((o) => o instanceof Error);
        if (errorIndex > -1) {
            throw new BadRequestException('Some peer has already installed chaincode');
        }
    }

    public async instantiateChaincode(
        channelName: string,
        organizationName: string,
    ) {
        this.logger.info('================= Instantiate chaincode =================');
        const client = await this.getClientForOrganization(organizationName);
        const channel = client.getChannel(channelName);
        const txId = client.newTransactionID(true);
        const [proposalResponses, proposal] = await channel.sendInstantiateProposal({
            'chaincodeId': 'mycc',
            'chaincodeType': 'node',
            'chaincodeVersion': 'v0',
            txId,
            'endorsement-policy': {
                identities: [
                    { role: { name: 'member', mspId: 'Org1MSP' } },
                    { role: { name: 'member', mspId: 'Org2MSP' } },
                ],
                policy: {
                    '2-of': [{ 'signed-by': 0 }, { 'signed-by': 1 }],
                },
            },
        });

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
        peers: string[],
        channelName: string,
        fcn: string,
        args: string[],
        organizationName: string,
    ) {
        this.logger.info('================= Invoke chaincode =================');
        const client = await this.getClientForOrganization(organizationName);
        const channel = client.getChannel(channelName);
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

    public async queryChaincode(
        peer: string,
        channelName: string,
        chaincodeName: string,
        args: string[],
        fcn: string,
        organizationName: string,
        username: string,
    ): Promise<string> {
        const client = await this.getClientForOrganization(organizationName);
        await client.setUserContext({ username });
        const channel = client.getChannel(channelName);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        const responsePayloads = await channel.queryByChaincode({
            targets: [peer],
            chaincodeId: chaincodeName,
            fcn,
            args,
        }, true);
        this.logger.info(responsePayloads.map(o => o.toString()));
        return responsePayloads.toString();
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
