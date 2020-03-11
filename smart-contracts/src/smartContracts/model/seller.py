import datetime
from typing import List
from .transaction import Transaction
class Seller:
    def __init__(self, id: str, quantity: float, bidPrice: float, timestamp: datetime, isGrid: bool = False):
        self.id: str = id
        self.isGrid: bool = isGrid
        
        if(isGrid):
            self.quantityLeft: float = 0
            self.ssi: float = 1
        else: 
            self.quantityLeft: float = round(quantity,2)
            self.ssi: float = 0

        self.quantityAvailable: float = round(quantity,2)
        self.timestamp: datetime = timestamp
        self.reservePrice: float = bidPrice
        self.transaction: List[Transaction] = []
        self.totalSoldPrice: float = 0
        self.avgSoldPrice: float = 0
        self.utilityIndex: float = 0
    def __str__(self):
        return str(self.__dict__)
