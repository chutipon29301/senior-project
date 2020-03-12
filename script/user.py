import requests
import urllib.parse
import os
import pandas as pd
from progress.bar import ChargingBar
import csv
import asyncio
import aiohttp
from pathlib import Path


class User():
    def __init__(self):
        self.BASE_URL = os.getenv('FABRIC_URL')
        self.USER_LIST = os.getenv('USER_LIST')
        self.USER_STORAGE = os.getenv('USER_STORAGE')
        if not os.path.isfile(self.USER_STORAGE):
            columns = ['name', 'organization', 'id', 'smartMeterId', 'token']
            self.userDataframe = pd.DataFrame(columns=columns)
        else:
            self.userDataframe = pd.read_csv(self.USER_STORAGE)

    def create(self, name, org, smartMeterId):
        userInfo = asyncio.run(self.asyncCreateUserAndToken(name, org, smartMeterId))
        self.userDataframe = self.userDataframe.append(
            userInfo, ignore_index=True)
        self.userDataframe.to_csv(self.USER_STORAGE, index=False)
        print('Successfully create user:')
        print(userInfo)

    def createAll(self):
        df = pd.read_csv(self.USER_LIST).fillna('')
        bar = ChargingBar('Creating users', max=len(df.index),
                          suffix='%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds')
        for index, row in df.iterrows():
            userInfo = asyncio.run(self.asyncCreateUserAndToken(row['name'], row['organization'], row['smartMeterId']))
            self.userDataframe = self.userDataframe.append(
                userInfo, ignore_index=True)
            bar.next()
        self.userDataframe.to_csv(self.USER_STORAGE, index=False)
        bar.finish()

    def listToken(self):
        print(self.userDataframe)

    def getUserToken(self, id):
        if self.userDataframe.loc[self.userDataframe['id'] == id].empty:
            raise Exception('user not found')
        response = asyncio.run(self.asyncGetToken(id))
        self.userDataframe.loc[self.userDataframe['id']
                               == id, 'token'] = response['token']
        self.userDataframe.to_csv(self.USER_STORAGE, index=False)
        print('Update user token successful')

    def updateToken(self):
        df = pd.read_csv(self.USER_STORAGE)
        bar = ChargingBar('Updating token', max=len(df.index),
                          suffix='%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds')
        for index, row in df.iterrows():
            id = row['id']
            response = asyncio.run(self.asyncGetToken(id))
            self.userDataframe.loc[self.userDataframe['id']
                               == id, 'token'] = response['token']
            bar.next()
        self.userDataframe.to_csv(self.USER_STORAGE, index=False)
        bar.finish()

    async def asyncCreateUserAndToken(self, username, organization, smartMeterId):
        async with aiohttp.ClientSession() as session:
            userResponse = await self.asyncCreateUser(username, organization, smartMeterId, session)
            tokenResponse = await self.asyncGetToken(userResponse['id'], session)
            return {
                'name': userResponse['name'],
                'id': userResponse['id'],
                'organization': userResponse['organization'],
                'token': tokenResponse['token'],
                'smartMeterId': smartMeterId,
            }

    async def asyncCreateUser(self, username, organization, smartMeterId, session=None):
        async def createUser(session, username, organization):
            if (smartMeterId != ""):
                async with session.post(
                        urllib.parse.urljoin(self.BASE_URL, 'user'),
                            data={
                                "name": username,
                                "organizationName": organization,
                                "smartMeterId": smartMeterId
                            }) as response:
                    return await response.json()
            else:
                async with session.post(
                        urllib.parse.urljoin(self.BASE_URL, 'user'),
                            data={
                                "name": username,
                                "organizationName": organization,
                            }) as response:
                    return await response.json()

        if session == None:
            async with aiohttp.ClientSession() as session:
                return await createUser(session, username, organization)
        else:
            return await createUser(session, username, organization)

    async def asyncGetToken(self, userId, session=None):
        async def getToken(session, userId):
            async with session.post(
                    urllib.parse.urljoin(self.BASE_URL, 'auth/token'),
                    data={
                        "id": userId
                    }) as response:
                return await response.json()
        if session == None:
            async with aiohttp.ClientSession() as session:
                return await getToken(session, userId)
        else:
            return await getToken(session, userId)
