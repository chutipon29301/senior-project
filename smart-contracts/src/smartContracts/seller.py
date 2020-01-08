class Seller: 
    quantityAvailable = 0
    quantityLeft = 0
    reservePrice = 0
    transaction=[]
    timestamp=None
    isGrid=False
    totalSoldPrice=0
    utilityIndex=0
    ssi=0;mti=0
    # default constructor 
    def __init__(self,quantityAvailable,reservePrice,timestamp): 
        self.quantityAvailable = quantityAvailable
        self.quantityLeft = quantityAvailable
        self.timestamp=timestamp
        self.ssi=0
        self.isGrid=False
        self.reservePrice = reservePrice
        self.transaction=[]
        self.totalSoldPrice=0
        self.utilityIndex=0
        self.mti=0
  
    # a method for printing data members 
    def print_seller(self): 
        print("quantity:",self.quantityAvailable,
        "\nreserve price:",self.reservePrice,
        "\nseller quantity left:",self.quantityLeft,
        "\nseller sold transaction:",self.transaction,
        "\nseller totalSoldPrice price:",self.totalSoldPrice, 
        "\nssi:",self.ssi,
        "\nmti:",self.mti,
        "\nisGrid:",self.isGrid
        ) 
        # print("====")
        
    def toDict(self):
      return {"transaction": self.transaction, "totalSoldPrice": self.totalSoldPrice}
    def toGrid(self):
        self.isGrid=True
        self.quantityLeft = 0
        self.ssi=1
        return self
