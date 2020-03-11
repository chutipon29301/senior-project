from SmartContracts.model.buyer import Buyer
from SmartContracts.model.seller import Seller
from typing import List, Tuple


def updateEvalutaionIndex(buyers: List[Buyer], sellers: List[Seller]) -> Tuple[List[Buyer], List[Seller]]:
    GRID_SOLD_PRICE = 5
    GRID_BOUGHT_PRICE = 1.68
    buyersNoGrid = [b for b in buyers if not b.isGrid]
    sellersNoGrid = [s for s in sellers if not s.isGrid]
    for buyer in buyersNoGrid:
        buyer.utilityIndex = round(
            (GRID_SOLD_PRICE * buyer.quantityWant) - buyer.totalBoughtPrice, 2)
        try:
            buyer.bsi = round(
                (buyer.bidPrice * buyer.quantityWant) / buyer.totalBoughtPrice, 2)
        except ZeroDivisionError:
            buyer.bsi = 0
    for seller in sellersNoGrid:
        seller.utilityIndex = round(
            seller.totalSoldPrice - (GRID_BOUGHT_PRICE * seller.quantityAvailable), 2)
        try:
            seller.ssi = round(seller.totalSoldPrice /
                               (seller.quantityAvailable * seller.reservePrice), 2)
        except ZeroDivisionError:
            seller.ssi = 0
    return buyers, sellers


def getMTI(buyers: List[Buyer], sellers: List[Seller]) -> float:
    totalBsi = sum([(buyer.bsi * buyer.quantityWant) / len(buyers)
                    for buyer in buyers])
    totalSsi = sum([(seller.ssi * seller.quantityAvailable) /
                    len(sellers) for seller in sellers])
    try:
        mti = round(totalBsi / totalSsi, 2)
    except ZeroDivisionError:
        mti = 0
    return mti
