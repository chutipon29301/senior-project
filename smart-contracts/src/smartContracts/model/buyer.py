class Buyer:
    # def __init__(*args):
        # [self,id,quantityWant,bidPrice,timestamp,isGrid] = args
    def __init__(self,id,quantity,bidPrice,timestamp,isGrid=False):
        self.id=id
        self.bidPrice = bidPrice
        
        if(isGrid):
            self.bsi=1
            self.quantityLeft = 0
        else:
            self.bsi = 0
            self.quantityLeft = quantity

        self.quantityWant = quantity
        self.timestamp=timestamp
        self.isGrid=isGrid
        self.totalBoughtPrice = 0
        self.avgBoughtPrice = 0
        self.transaction=[]
        self.utilityIndex=0