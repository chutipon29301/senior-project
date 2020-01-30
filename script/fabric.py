import requests
import urllib.parse
import os
import pandas as pd
import random

class Fabric(object):

    def setup(self):
        tokenPath = os.path.join(
            os.getenv('STORAGE_DIR'), 'token.csv')
        if not os.path.exists(tokenPath):
            raise Exception('bld has not been created')
        df = pd.read_csv(tokenPath)
        bld = (df.loc[df['organization'] == 'Building']).iloc()[0]
        pv = (df.loc[df['organization'] == 'PV']).iloc()[0]
        utility = (df.loc[df['organization'] == 'Utility']).iloc()[0]
        orgs = [bld, pv, utility]

        print('Creating channel...')
        self.createChannel(bld['token'])
        print('Channel created')

        for org in orgs:
            print('Joining channel - organization: %s' % org['name'])
            self.joinChannel(org['token'])
        for org in orgs:
            print('Installing chaincode - organization: %s' % org['name'])
            self.installChaincode(org['token'])

        print('Instantiating chaincode...')
        self.instantiateChaincode(bld['token'])
        print('Chaincode instantiated')

        print('=============== Setup finished =================')
        
    
    def createChannel(self, token):
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'), 'fabric/channel'),
            headers={
                'authorization': "Bearer " + token
            }
        )
        return res

    def joinChannel(self, token):
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'),
                                 'fabric/channel/join'),
            headers={
                'authorization': "Bearer "+ token
            }
        )
        return res

    def installChaincode(self, token):
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'),
                                 '/fabric/chaincode/install'),
            headers={
                'authorization': "Bearer "+ token
            }
        )
        return res

    def instantiateChaincode(self, token):
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'),
                                 '/fabric/chaincode/instantiate'),
            headers={
                'authorization': "Bearer "+ token
            }
        )
        return res

