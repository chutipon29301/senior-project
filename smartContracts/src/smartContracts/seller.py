class Seller: 
    quantityAvailable = 0
    quantityLeft = 0
    reservePrice = 0
    transaction=[]
    totalSoldPrice=0
    # default constructor 
    def __init__(self,quantityAvailable,reservePrice): 
        self.quantityAvailable = quantityAvailable
        self.quantityLeft = quantityAvailable
        self.reservePrice = reservePrice
        self.transaction=[]
        self.totalSoldPrice=0
  
    # a method for printing data members 
    def print_seller(self): 
        print("quantity:",self.quantityAvailable,
        "\nreserve price:",self.reservePrice,
        "\nseller quantity left:",self.quantityLeft,
        "\nseller sold transaction:",self.transaction,
        "\nseller totalSoldPrice price:",self.totalSoldPrice
        ) 
        # print("====")
        
    def to_dict(self):
      return {"transaction": self.transaction, "totalSoldPrice": self.totalSoldPrice}