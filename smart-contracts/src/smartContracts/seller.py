class Seller: 
    quantityAvailable = 0
    quantityLeft = 0
    reservePrice = 0
    transaction=[]
    id=None
    timestamp=None
    isGrid=False
    totalSoldPrice=0
    avgSoldPrice=0
    utilityIndex=0
    ssi=0;mti=0
    # default constructor 
    def __init__(self,id,quantityAvailable,reservePrice,timestamp): 
        self.id=id
        self.quantityAvailable = quantityAvailable
        self.quantityLeft = quantityAvailable
        self.timestamp=timestamp
        self.ssi=0
        self.isGrid=False
        self.reservePrice = reservePrice
        self.transaction=[]
        self.totalSoldPrice=0
        self.avgSoldPrice=0
        self.utilityIndex=0
        self.mti=0

  
    # a method for printing data members 
    def print_seller(self): 
        print("id:",self.id,
        "\nquantity:",self.quantityAvailable,
        "\nreserve price:",self.reservePrice,
        "\nseller quantity left:",self.quantityLeft,
        "\nseller sold transaction:",self.transaction,
        "\nseller totalSoldPrice price:",self.totalSoldPrice, 
        "\nseller avgSoldPrice price:",self.avgSoldPrice, 
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
