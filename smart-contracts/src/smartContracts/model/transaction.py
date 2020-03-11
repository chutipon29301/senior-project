class Transaction:
    def __init__(self, id: str, quantity: float, price: float): 
        self.id: str = id
        self.quantity: float = round(quantity,3)
        self.price: float = round(price,2)
    def __str__(self):
        return str(self.__dict__)