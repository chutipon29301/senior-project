class Seller: 
    quantityAvailable = 0
    quantityLeft = 0
    reservePrice = 0
    soldPrice = 0
    # default constructor 
    def __init__(self,quantityAvailable,reservePrice): 
        self.quantityAvailable = quantityAvailable
        self.reservePrice = reservePrice
  
    # a method for printing data members 
    def print_seller(self): 
        print("quantity:",self.quantityAvailable,"\nreserve price:",self.reservePrice) 
        print("====")
         