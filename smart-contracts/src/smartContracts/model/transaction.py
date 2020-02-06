class Transaction:
    def __init__(self, id, quantity, price): 
        self.id=id
        self.quantity = round(quantity,3)
        self.price = round(price,2)