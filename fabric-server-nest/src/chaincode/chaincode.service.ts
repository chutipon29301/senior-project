import { Injectable } from '@nestjs/common';
import { ClientService } from '../client/client.service';
import { ChaincodeInstallRequest } from 'fabric-client';

@Injectable()
export class ChaincodeService {

    constructor(private readonly clientService: ClientService) { }

    public async installChaincode(peers: string[], username: string, orgName: string) {
        console.log('\n\n============ Install chaincode on organizations ============\n');
        let errorMessage = null;
        try {
            console.log(`Calling peers in organization ${orgName} to join the channel`);

            // first setup the client for this org
            const client = await this.clientService.getClientForOrg( orgName, username);
            console.log('Successfully got the fabric client for the organization "%s"', orgName);

            const request = {
                targets: peers,
                chaincodePath: `github.com/example_cc/go`,
                chaincodeId: 'mycc',
                chaincodeVersion: 'v0',
                chaincodeType: 'golang',
            };
            const results = await client.installChaincode(request as ChaincodeInstallRequest);
            // the returned object has both the endorsement results
            // and the actual proposal, the proposal will be needed
            // later when we send a transaction to the orederer
            const proposalResponses = results[0];
            const proposal = results[1];

            // lets have a look at the responses to see if they are
            // all good, if good they will also include signatures
            // required to be committed
            for (const i in proposalResponses as any) {
                if (proposalResponses[i] instanceof Error) {
                    errorMessage = `install proposal resulted in an error :: ${proposalResponses[i].toString()}`;
                    console.log(errorMessage);
                } else if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
                    console.log('install proposal was good');
                } else {
                    //allGood = false;
                    errorMessage = `install proposal was bad for an unknown reason ${proposalResponses[i]}`;
                    console.log(errorMessage);
                }
            }
        } catch (error) {
            console.error(`Failed to install due to error: ${error.stack ? error.stack : error}`);
            errorMessage = error.toString();
        }

        if (!errorMessage) {
            const message = `Successfully installed chaincode`;
            console.log(message);
            // build a response to send back to the REST caller
            const response = {
                success: true,
                message,
            };
            return response;
        } else {
            const message = `Failed to install due to:${errorMessage}`;
            console.log(message);
            const response = {
                success: false,
                message,
            };
            return response;
        }
    }
}
