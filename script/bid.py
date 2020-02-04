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
            result=createOffer(token,timestamp)
            print(result)
        

    def createOffer(self,token,timestamp):
        # token="299b50c0-6f7d-4f91-9947-cf84030a4780,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI5OWI1MGMwLTZmN2QtNGY5MS05OTQ3LWNmODQwMzBhNDc4MCIsIm5hbWUiOiJDaGFtNSIsIm9yZ2FuaXphdGlvbiI6IlBWIiwiaWF0IjoxNTgwNDA1MzAxLCJleHAiOjE1ODEwMTAxMDF9.f9FZEFQqPuEwICjm3rXjBVjC4Q1gAryES-BHGnmknOg"
        # fake = faker.Faker()
        # rand_date = fake.date_time()  # datetime(2006, 4, 30, 3, 1, 38)
        date_iso = timestamp.isoformat()  # '2006-04-30T03:01:38'
        res = requests.post(
            urllib.parse.urljoin(os.getenv('FABRIC_URL'),
                                 '/offer/createOffer'),
            headers={
                'authorization': "Bearer "+ token
            },
            data={
                'price': random.uniform(0,5),
                'date': date_iso
            }
        )
        return res.json()
        
        
"""
name,organization,id,token
Cham1,Building,53b0d964-f57f-4432-a86f-7fc067438f4a,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUzYjBkOTY0LWY1N2YtNDQzMi1hODZmLTdmYzA2NzQzOGY0YSIsIm5hbWUiOiJDaGFtMSIsIm9yZ2FuaXphdGlvbiI6IkJ1aWxkaW5nIiwiaWF0IjoxNTgwNDA1Mjg2LCJleHAiOjE1ODEwMTAwODZ9.ARVr_46aHemkp-3-QVw2T2-6rrLiK8R9yCDz_2P1BUA
Cham2,Building,7747d222-08e9-4774-a030-3105b4ca0c82,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3NDdkMjIyLTA4ZTktNDc3NC1hMDMwLTMxMDViNGNhMGM4MiIsIm5hbWUiOiJDaGFtMiIsIm9yZ2FuaXphdGlvbiI6IkJ1aWxkaW5nIiwiaWF0IjoxNTgwNDA1Mjg3LCJleHAiOjE1ODEwMTAwODd9.BlUoQG1SzKtdRwDEu5QDysPCLqyfWaHyfQ7k8dbugYI
Cham3,Building,59be4a3e-813f-477f-81f5-9a5cc9437c9a,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5YmU0YTNlLTgxM2YtNDc3Zi04MWY1LTlhNWNjOTQzN2M5YSIsIm5hbWUiOiJDaGFtMyIsIm9yZ2FuaXphdGlvbiI6IkJ1aWxkaW5nIiwiaWF0IjoxNTgwNDA1Mjg5LCJleHAiOjE1ODEwMTAwODl9.NP5FNbPY8QFdAbj8TqlrRzr43syK9MON9AMRJls0pn4
Cham4,Building,8c221408-4f3a-4e10-b181-a6ea2cecf59e,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjMjIxNDA4LTRmM2EtNGUxMC1iMTgxLWE2ZWEyY2VjZjU5ZSIsIm5hbWUiOiJDaGFtNCIsIm9yZ2FuaXphdGlvbiI6IkJ1aWxkaW5nIiwiaWF0IjoxNTgwNDA1MjkxLCJleHAiOjE1ODEwMTAwOTF9.OCwBHQV4P8ExEsYS2NIhJwHsPWYlC_mPhNz1k5NOHlM
Cham5,Building,ed0ebe05-53f8-48b3-8c3a-d587948d1993,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVkMGViZTA1LTUzZjgtNDhiMy04YzNhLWQ1ODc5NDhkMTk5MyIsIm5hbWUiOiJDaGFtNSIsIm9yZ2FuaXphdGlvbiI6IkJ1aWxkaW5nIiwiaWF0IjoxNTgwNDA1Mjk0LCJleHAiOjE1ODEwMTAwOTR9.1OlT34gq5FE0cgqKGBE5BDc7JpaDgvsL1YAJFzUdzPo
Cham1,PV,f4177494-48ee-45df-a318-a834c781b180,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY0MTc3NDk0LTQ4ZWUtNDVkZi1hMzE4LWE4MzRjNzgxYjE4MCIsIm5hbWUiOiJDaGFtMSIsIm9yZ2FuaXphdGlvbiI6IlBWIiwiaWF0IjoxNTgwNDA1Mjk2LCJleHAiOjE1ODEwMTAwOTZ9.EhjfgCrfHu9R2G_hS91_OU4YFDVNO7H4P_kAXjEvpKk
Cham2,PV,f738b04e-639c-4139-a8cd-506268f1e47f,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY3MzhiMDRlLTYzOWMtNDEzOS1hOGNkLTUwNjI2OGYxZTQ3ZiIsIm5hbWUiOiJDaGFtMiIsIm9yZ2FuaXphdGlvbiI6IlBWIiwiaWF0IjoxNTgwNDA1Mjk3LCJleHAiOjE1ODEwMTAwOTd9.ik-d0gqr7yHVi7P4awt0HNcnRrwYgUK5GRiRlmvuDvY
Cham3,PV,e733cf91-615c-4fb4-a933-acf5529a2b96,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU3MzNjZjkxLTYxNWMtNGZiNC1hOTMzLWFjZjU1MjlhMmI5NiIsIm5hbWUiOiJDaGFtMyIsIm9yZ2FuaXphdGlvbiI6IlBWIiwiaWF0IjoxNTgwNDA1Mjk5LCJleHAiOjE1ODEwMTAwOTl9.a-ENPClojTXQ2FQ9D3i0guGaw2Y7aSU61We3VRxbs3c
Cham4,PV,f0dcb747-b42e-400b-9c30-0067bb038ebb,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwZGNiNzQ3LWI0MmUtNDAwYi05YzMwLTAwNjdiYjAzOGViYiIsIm5hbWUiOiJDaGFtNCIsIm9yZ2FuaXphdGlvbiI6IlBWIiwiaWF0IjoxNTgwNDA1MzAwLCJleHAiOjE1ODEwMTAxMDB9.pCXRxPDp8NRO7mmPpjJ-GV09Mdq5XxemvGTyzQ-qaA8
Cham5,PV,299b50c0-6f7d-4f91-9947-cf84030a4780,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI5OWI1MGMwLTZmN2QtNGY5MS05OTQ3LWNmODQwMzBhNDc4MCIsIm5hbWUiOiJDaGFtNSIsIm9yZ2FuaXphdGlvbiI6IlBWIiwiaWF0IjoxNTgwNDA1MzAxLCJleHAiOjE1ODEwMTAxMDF9.f9FZEFQqPuEwICjm3rXjBVjC4Q1gAryES-BHGnmknOg
Utility,Utility,3987b3eb-5ef0-4824-8b6e-a37abd63f6f9,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5ODdiM2ViLTVlZjAtNDgyNC04YjZlLWEzN2FiZDYzZjZmOSIsIm5hbWUiOiJVdGlsaXR5Iiwib3JnYW5pemF0aW9uIjoiVXRpbGl0eSIsImlhdCI6MTU4MDQwNTMwNCwiZXhwIjoxNTgxMDEwMTA0fQ.J6RYZH8vJaETokmywD8BfLFktvNB1fMVOH0u7E_6zB4
"""