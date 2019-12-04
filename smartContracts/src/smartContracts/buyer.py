class Buyer: 
    quantityWant = 0
    quantityLeft = 0
    bidPrice = 0
    transaction =[]
    totalBoughtPrice = 0
    # default constructor 
    def __init__(self,quantityWant,bidPrice): 
        self.quantityWant = quantityWant
        self.quantityLeft = quantityWant
        self.bidPrice = bidPrice
        self.totalBoughtPrice = 0
        self.transaction=[]
  
    # a method for printing data members 
    def print_buyer(self): 
        print("quantity:",self.quantityWant,
        '\nbidPrice:',self.bidPrice,
        "\nbuyer q left:",self.quantityLeft,
        "\nbuyer bought transaction:",self.transaction,
        "\nbuyer totalBoughtPrice price:",self.totalBoughtPrice
        ) 
        # print("====")
    def to_dict(self):
      return {"transaction": self.transaction, "totalBoughtPrice": self.totalBoughtPrice}
