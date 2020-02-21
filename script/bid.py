import random
import faker
import requests
import urllib.parse
import os 
import pandas as pd 
from datetime import datetime,timedelta
class Bid():

    def __init__(self):
        self.USER_STORAGE = os.getenv('USER_STORAGE')
    # def ping(self):
    #     return 'pong'
    # def createOffer(self,token):
    #     token="53b0d964-f57f-4432-a86f-7fc067438f4a,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUzYjBkOTY0LWY1N2YtNDQzMi1hODZmLTdmYzA2NzQzOGY0YSIsIm5hbWUiOiJDaGFtMSIsIm9yZ2FuaXphdGlvbiI6IkJ1aWxkaW5nIiwiaWF0IjoxNTgwNDA1Mjg2LCJleHAiOjE1ODEwMTAwODZ9.ARVr_46aHemkp-3-QVw2T2-6rrLiK8R9yCDz_2P1BUA"
    #     fake = faker.Faker()
    #     rand_date = fake.date_time()  # datetime(2006, 4, 30, 3, 1, 38)
    #     rand_date_iso = rand_date.isoformat()  # '2006-04-30T03:01:38'
    #     # res = requests.post(
    #     #     urllib.parse.urljoin(os.getenv('FABRIC_URL'),
    #     #                          '/offer/createOffer'),
    #     #     data={
    #     #         'price': random.uniform(0,5),
    #     #         'date': rand_date_iso
    #     #     },
    #     #     headers={
    #     #         'authorization': "Bearer "+ token
    #     #     }
    #     # )
    #     return 'res'

        # self.USER_PATH = os.path.join(os.getenv('STORAGE_DIR'), 'user.csv')
    def createOfferFrom(self,step=10):
        timestamp=datetime.now()
        for i in range(step):
            timestamp=timestamp+timedelta(hours=1)
        self.createAllOffer(timestamp)

    def createAllOffer(self,timestamp):
        df = pd.read_csv(self.USER_STORAGE)
        tokens = df['token'].to_list()
        for token in tokens:
            self.createOffer(token,timestamp)
        

    def createOffer(self,token,timestamp):
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
        print(res.status_code)
        