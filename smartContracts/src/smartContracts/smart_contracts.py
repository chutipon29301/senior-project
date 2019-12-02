from smartContracts.buyer import Buyer
from smartContracts.seller import Seller
from smartContracts.calculate_unit_price import *

# from seller import Seller
import random
def dis_kda(k,buyers,sellers):
    price=calculateAvgPrice()
    print("buyers:",buyers,'\nseller:',sellers)
    print("DisKDA\nk:",k,"\nprice:",price)
    return k

def uni_kda(k,buyers,sellers):
    price=calculateUniPrice()
    print("UniKDA\nk:",k,"\nprice:",price)
    return k

def weighted_avg(buyers,sellers):
    price=calculateDisPrice()
    print(price)
    return buyers

    


