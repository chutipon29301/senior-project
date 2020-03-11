class Response:
    def __init__(self,mti,buyers,sellers):
        self.mti=mti
        self.buyers=[ob.__dict__ for ob in buyers]
        self.sellers=[ob.__dict__ for ob in sellers]
    def __str__(self):
        return str(self.__dict__)