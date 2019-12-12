class Transaction: 
    quantity= 0
    price = 0
    # default constructor 
    def __init__(self,quantity,price): 
        self.quantity = quantity
        self.price = price
  
    # a method for printing data members 
    def print_transaction(self): 
        print("quantity:",self.quantity,
        "\nprice:",self.price
        ) 
        # print("====")
        