import requests
import urllib.parse
import os
import pandas as pd
from progress.bar import ChargingBar
import csv


class User():

    collection = []

    def __init__(self):
        self.TOKEN_PATH = os.path.join(os.getenv('STORAGE_DIR'), 'token.csv')

    def createAll(self):
        df = pd.read_csv(os.getenv('USER_LIST'))
        bar = ChargingBar('Creating user', max = len(df.index),
                          suffix='%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds')
        for index, row in df.iterrows():
            tokens = self.create(row['name'], row['organization'])
            bar.next()
        bar.finish()

    def create(self, name, org):
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'), 'user'),
            data = {
                "name": name,
                "organizationName": org
            }
        )

        json_response = res.json()
        id = json_response['id']
        token = self.userToken(id)
        row = [name, org, id, token]
        self.collection.append(row)

        if os.path.exists(self.TOKEN_PATH):
            with open(self.TOKEN_PATH, 'a') as f:
                writer = csv.writer(f)
                writer.writerow(row)
        else:
            token_collection = pd.DataFrame(self.collection,
                                            columns = ['name', 'organization', 'id','token'])
            token_collection.to_csv(self.TOKEN_PATH, sep = ',', index = False)

        return json_response['id']

    def userToken(self, id):
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'), 'auth/token'),
            data = {
                "id": id
            }
        )
        json_response = res.json()
        return json_response['token']
