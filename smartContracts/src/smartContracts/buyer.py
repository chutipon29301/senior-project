class Buyer: 
    quantityWant = 0
    quantityLeft = 0
    bidPrice = 0
    boughtPrice = 0
    # default constructor 
    def __init__(self,quantityWant,bidPrice): 
        self.quantityWant = quantityWant
        self.bidPrice = bidPrice
  
    # a method for printing data members 
    def print_buyer(self): 
        print("quantity:",self.quantityWant,'\nbidPrice:',self.bidPrice) 
        print("====")
