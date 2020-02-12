import datetime
from typing import List
from .transaction import Transaction
class Buyer:
    def __init__(self, id: str, quantity: float, bidPrice: float, timestamp: datetime, isGrid: bool = False):
        self.id: str = id
        self.bidPrice: float = bidPrice
        self.isGrid: bool = isGrid
        if(isGrid):
            self.bsi: float =1
            self.quantityLeft: float = 0
        else:
            self.bsi: float = 0
            self.quantityLeft: float = quantity

        self.quantityWant: float = quantity
        self.timestamp: datetime = timestamp
        self.totalBoughtPrice: float = 0
        self.avgBoughtPrice: float = 0
        self.transaction: List[Transaction] = []
        self.utilityIndex: float = 0