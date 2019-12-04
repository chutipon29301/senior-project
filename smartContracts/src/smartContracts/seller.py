class Seller: 
    quantityAvailable = 0
    quantityLeft = 0
    reservePrice = 0
    transaction=[]
    totalSoldPrice=0
    utilityIndex=0
    ssi=0;mti=0
    # default constructor 
    def __init__(self,quantityAvailable,reservePrice,quantityLeft=quantityAvailable): 
        self.quantityAvailable = quantityAvailable
        self.quantityLeft = quantityLeft
        self.reservePrice = reservePrice
        self.transaction=[]
        self.totalSoldPrice=0
        self.utilityIndex=0
        self.ssi=0;self.mti=0
  
    # a method for printing data members 
    def print_seller(self): 
        print("quantity:",self.quantityAvailable,
        "\nreserve price:",self.reservePrice,
        "\nseller quantity left:",self.quantityLeft,
        "\nseller sold transaction:",self.transaction,
        "\nseller totalSoldPrice price:",self.totalSoldPrice, 
        "\nssi:",self.ssi,
        "\nmti:",self.mti,
        ) 
        # print("====")
        
    def toDict(self):
      return {"transaction": self.transaction, "totalSoldPrice": self.totalSoldPrice}