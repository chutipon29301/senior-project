class Seller:
    def __init__(self,id,quantity,bidPrice,timestamp,isGrid=False):
        self.id=id
        self.isGrid=isGrid
        
        if(isGrid):
            self.quantityLeft = 0
            self.ssi=1
        else: 
            self.quantityLeft = round(quantity,2)
            self.ssi=0

        self.quantityAvailable = round(quantity,2)
        self.timestamp=timestamp
        self.reservePrice = bidPrice
        self.transaction=[]
        self.totalSoldPrice=0
        self.avgSoldPrice=0
        self.utilityIndex=0
