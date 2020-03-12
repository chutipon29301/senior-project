import random
import faker
import requests
import urllib.parse
import os 
import pandas as pd 
from datetime import datetime, timedelta
from progress.bar import ChargingBar
class Bid():

    def __init__(self):
        self.USER_STORAGE = os.getenv('USER_STORAGE')

    def createOfferFromNow(self, round = 10):
        timestamp=datetime.utcnow()
        bar = ChargingBar('Creating offers', max=round, suffix='%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds')
        for i in range(round):
            timestamp=timestamp+timedelta(hours = 1)
            self.createAllOffer(timestamp)
            bar.next()
        bar.finish()

    def createAllOffer(self, timestamp):
        df = pd.read_csv(self.USER_STORAGE)
        df=df[df.organization != 'Utility']
        tokens = df['token'].to_list()
        for token in tokens:
            self.createOffer(token,timestamp)

    def clearMarket(self):
        df = pd.read_csv(self.USER_STORAGE)
        token = df[df['organization'] != 'Utility']['token'].to_list()[0]
        rounds = requests.get(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'), '/round'),
            headers = {
                'authorization': "Bearer "+ token
            }
        )
        bar = ChargingBar('Clearing Market', max=len(rounds.json()), suffix='%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds')
        for round in rounds.json():
            response = requests.post(
                urllib.parse.urljoin(os.getenv('FABRIC_URL'), '/round/clearMarket'),
                headers = {
                    'authorization': "Bearer "+ token
                },
                json = {
                    'roundId': round['id']
                }
            )
            bar.next()
        bar.finish()

    def createOffer(self, token, timestamp):
        body = {
            'price': random.uniform(0, 5),
            'date': timestamp.isoformat()
        }
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'), '/offer'),
            headers = {
                'authorization': "Bearer "+ token
            },
            json = body
        )
