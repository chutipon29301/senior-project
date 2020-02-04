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
            columns = ['name', 'id', 'token', 'organization']
            self.userDataframe = pd.DataFrame(columns=columns)
        else:
            self.userDataframe = pd.read_csv(self.USER_STORAGE)

    def create(self, name, org):
        userInfo = asyncio.run(self.asyncCreateUserAndToken(name, org))
        self.userDataframe = self.userDataframe.append(
            userInfo, ignore_index=True)
        self.userDataframe.to_csv(self.USER_STORAGE, index=False)
        print('Successfully create user:')
        print(userInfo)

    def createAll(self):
        df = pd.read_csv(self.USER_LIST)
        bar = ChargingBar('Creating users', max=len(df.index),
                          suffix='%(percent)d%%; Elapsed: %(elapsed)ds; ETA: %(eta)ds')
        for index, row in df.iterrows():
            userInfo = asyncio.run(self.asyncCreateUserAndToken(row['name'], row['organization']))
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

    async def asyncCreateUserAndToken(self, username, organization):
        async with aiohttp.ClientSession() as session:
            userResponse = await self.asyncCreateUser(username, organization, session)
            tokenResponse = await self.asyncGetToken(userResponse['id'], session)
            return {
                'name': userResponse['name'],
                'id': userResponse['id'],
                'organization': userResponse['organization'],
                'token': tokenResponse['token']
            }

    async def asyncCreateUser(self, username, organization, session=None):
        async def createUser(session, username, organization):
            async with session.post(
                    urllib.parse.urljoin(self.BASE_URL, 'user'),
                    data={
                        "name": username,
                        "organizationName": organization
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

    # def refreshToken(self):
    #     usersInfo = pd.read_csv(self.TOKEN_PATH)
    #     print(usersInfo['token'])
    #     for index, row in usersInfo.iterrows():
    #         print(row['token'])
    #         token = self.userToken(row['id'])
    #         print(token)
    #         row.at['token'] = token
    #     print(usersInfo['token'])
    #     usersInfo.to_csv(self.TOKEN_PATH, index=False)

        # async def asyncCreateAllUsersAndTokens(self):
    #     async with aiohttp.ClientSession() as session:

    #         userList = pd.read_csv(os.getenv('USER_LIST'))
    #         createUserRequests = []
    #         # print(userList)
    #         userList.apply(lambda user: createUserRequests.append(self.asyncCreateUser(user['name'], user['organization'], session)), axis = 1)
    #         # userList.apply(lambda user: createUserRequests.append(asyncio.ensure_future(self.asyncCreateUser(user['name'], user['organization'], session))), axis = 1)
    #         results = await asyncio.gather(*createUserRequests)
    #         for result in results:
    #             print(result)
    #             print(result.get('id'))

            # task = asyncio.create_task(coro())
            # result = asyncio.ensure_future(asyncio.gather(*createUserRequests))
            # print(result)
            # loop = asyncio.get_event_loop()
            # print(loop.run_until_complete(asyncio.gather(*createUserRequests)))
            # loop.close()

            # loop = asyncio.get_event_loop()
            # createUserResponses = loop.run_until_complete(asyncio.gather(*createUserRequests))
            # loop.close()

            # print(createUserResponses)
            # createUserResponses = await asyncio.gather(*createUserRequests)
            # print(createUserResponses)

            # # # print(createUserResponses)
            # for user in createUserResponses:
            #     print(user)

            # # map(lambda ,createUserRequests)
            # createTokenRequests=[]
            # loop = asyncio.get_event_loop()
            # task = asyncio.wait([print(await (r['id'])) for r in createUserRequests])
            # loop.run_until_complete(task)
            # for response in createUserRequests :
            #     print(await response)
            # createTokenRequests.append(self.asyncGetToken(response['id'], session))
            # print(createTokenRequests)
            # createTokenResponses = await asyncio.gather(*createTokenRequests)
            # print(createUserResponses)
            # print(createTokenResponses)
