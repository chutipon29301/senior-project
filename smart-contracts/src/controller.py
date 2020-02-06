from flask import json
from SmartContracts.model.buyer import Buyer
from SmartContracts.model.seller import Seller
from SmartContracts.model.response import Response
from SmartContracts.service.evaluate import *

def getUsers(data):
    raw_buyers = data['buyers']
    raw_sellers = data['sellers']
    utilities = data['utilities']
    
    buyers=[(Buyer(**buyer)) for buyer in raw_buyers]
    sellers=[(Seller(**seller)) for seller in raw_sellers]
    
    return buyers,sellers,utilities

def getResult(buyers_result,sellers_result):
    for buyer in buyers_result:
        buyer.transaction=[ob.__dict__ for ob in buyer.transaction]
    for seller in sellers_result:
        seller.transaction=[ob.__dict__ for ob in seller.transaction]
    mti = getMTI(buyers_result,sellers_result)
    res=Response(mti,buyers_result,sellers_result)
    return json.dumps(res.__dict__)
