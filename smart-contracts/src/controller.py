from flask import json
from SmartContracts.model.buyer import Buyer
from SmartContracts.model.seller import Seller
from SmartContracts.model.response import Response
from SmartContracts.service.evaluate import *
from typing import List, Tuple


def getUsers(buyers: List[Buyer], sellers: List[Seller], utilities: List[str]) -> Tuple[List[Buyer], List[Seller], List[str]]:
    buyers = [(Buyer(**buyer)) for buyer in buyers]
    sellers = [(Seller(**seller)) for seller in sellers]
    return buyers, sellers, utilities


def getResult(buyers_result: List[Buyer], sellers_result: List[Seller]) -> Response:
    for buyer in buyers_result:
        buyer.transaction = [ob.__dict__ for ob in buyer.transaction]
    for seller in sellers_result:
        seller.transaction = [ob.__dict__ for ob in seller.transaction]
    mti = getMTI(buyers_result, sellers_result)
    return Response(mti, buyers_result, sellers_result)
