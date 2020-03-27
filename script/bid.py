import random
import faker
import requests
import urllib.parse
import os 
import pandas as pd 
from datetime import datetime, timedelta
from progress.bar import ChargingBar
import asyncio
import aiohttp
import itertools
import random
import time

class Bid():
    def __init__(self):
        self.USER_STORAGE = os.getenv('USER_STORAGE')
        self.BASE_URL = os.getenv('FABRIC_URL')
        self.userStorage = pd.read_csv(self.USER_STORAGE)

    def createOfferFromNow(self, round = 10):
        timestamp = datetime.utcnow()
        self.userStorage = self.userStorage[self.userStorage.organization != 'Utility']
        userTokens = self.userStorage['token'].to_list()
        timestamps = [timestamp + timedelta(hours = i + 1) for i in range(round)] 
        initOffer = list(itertools.product(timestamps, [userTokens[0]]))
        offers = list(itertools.product(timestamps, userTokens[1:]))
        bar = ChargingBar(
            'Creating offers',
            max = len(timestamps) * len(userTokens),
            suffix = '%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds'
        )
        asyncio.run(self.asyncCreateAllOffer(initOffer, bar))
        asyncio.run(self.asyncCreateAllOffer(offers, bar))
        bar.finish()

    def clearMarket(self):
        token = self.userStorage[self.userStorage['organization'] != 'Utility']['token'].to_list()[0]
        responses = asyncio.run(self.asyncClearAllMarket(token))
        
        
    async def asyncCreateAllOffer(self, offers, loadingBar = None):
        async with aiohttp.ClientSession() as session:
            createAllOffers = [self.asyncCreateOffer(token , timestamp, random.uniform(0, 5), session, loadingBar) for timestamp, token in offers]
            responses = await asyncio.gather(*createAllOffers)
            return responses
            
    async def asyncCreateOffer(self, token, timestamp, price, session = None, loadingBar = None):
        async def createOffer(session):
            async with session.post(
                urllib.parse.urljoin(self.BASE_URL, "offer"),
                    headers = {
                    "authorization": "Bearer " + token
                    },
                    json = {
                        "price": price,
                        "date": timestamp.isoformat()
                    }) as response:
                return await response.text()
        if session == None:
            async with aiohttp.ClientSession() as session:
                result = await createOffer(session)
                if loadingBar != None:
                    loadingBar.next()
                return result
        else:
            result = await createOffer(session)
            if loadingBar != None:
                loadingBar.next()
            return result

    async def asyncListRound(self, token, session = None):
        async def listRound(session):
            async with session.get(
                urllib.parse.urljoin(self.BASE_URL, "round"),
                headers = {
                    "authorization": "Bearer " + token
                }) as response:
                return await response.json()
        if session == None:
            async with aiohttp.ClientSession() as session:
                return await listRound(session)
        else:
            return await listRound(session)

    async def asyncClearMarket(self, roundId, token, session = None, loadingBar = None):
        async def clearMarket(session):
            async with session.post(
                urllib.parse.urljoin(self.BASE_URL, "round/clearMarket"),
                headers = {
                    "authorization": "Bearer " + token
                },
                data = {
                    "roundId": roundId
                }) as response:
                return await response.text()
        if session == None:
            async with aiohttp.ClientSession() as session:
                result = await clearMarket(session)
                if loadingBar != None:
                    loadingBar.next()
                return result
        else:
            result = await clearMarket(session)
            if loadingBar != None:
                loadingBar.next()
            return result
        
    async def asyncClearAllMarket(self, token, loadingBar = None):
        async with aiohttp.ClientSession() as session:
            rounds = await self.asyncListRound(token, session)
            bar = ChargingBar(
                'Clearing Market',
                max = len(rounds),
                suffix = '%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds'
            )
            clearAllMarket = [self.asyncClearMarket(round['id'], token, session, bar) for round in rounds]
            responses = await asyncio.gather(*clearAllMarket)
            bar.finish()
            return responses
