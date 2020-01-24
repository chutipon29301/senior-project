class Buyer: 
    quantityWant = 0
    quantityLeft = 0
    bidPrice = 0
    isGrid=False
    transaction =[]
    timestamp=None
    totalBoughtPrice = 0
    avgBoughtPrice = 0
    bsi=0;mti=0
    utilityIndex=0
    # default constructor 
    def __init__(self,id,quantityWant,bidPrice,timestamp): 
        self.id=id
        self.quantityWant = quantityWant
        self.quantityLeft = quantityWant
        self.timestamp=timestamp
        self.bsi = 0
        self.isGrid=False
        self.bidPrice = bidPrice
        self.totalBoughtPrice = 0
        self.avgBoughtPrice = 0
        self.mti=0
        self.utilityIndex=0
        self.transaction=[]
  
    # a method for printing data members 
    def print_buyer(self): 
        print(
        "id:",self.id,
        "\nquantity:",self.quantityWant,
        '\nbidPrice:',self.bidPrice,
        "\nbuyer q left:",self.quantityLeft,
        "\nbuyer bought transaction:",self.transaction,
        "\nbuyer totalBoughtPrice price:",self.totalBoughtPrice,
        "\nbuyer avgBoughtPrice price:",self.avgBoughtPrice,
         "\nbsi:",self.bsi,
         "\nmti:",self.mti,
        "\nisGrid:",self.isGrid
        ) 
        

    def toDict(self):
      return {"transaction": self.transaction, "totalBoughtPrice": self.totalBoughtPrice}

    def toGrid(self):
        self.isGrid=True
        self.bsi=1
        self.quantityLeft = 0
        return self