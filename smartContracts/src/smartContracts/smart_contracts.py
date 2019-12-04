from smartContracts.buyer import Buyer
from smartContracts.seller import Seller
from smartContracts.transaction import Transaction
from smartContracts.calculate_unit_price import *

# from seller import Seller
import random
def discriminatory_kda(buyers,sellers):
    k=1
    return dis_kda(k,buyers,sellers)

def uniform_kda(buyers,sellers):
    k=1
    return uni_kda(k,buyers,sellers)

def dis_kda(k,buyers,sellers):
    # print("buyers:",buyers,'\nseller:',sellers)
    print("DisKDA\nk:",k)
    buyers_sorted,sellers_sorted=natural_sorting(buyers,sellers)
    listing=[]
    i=0
    for buyer in buyers_sorted:
        for seller in sellers_sorted:
            if(seller.quantityLeft==0): continue
            elif(seller.quantityLeft<=buyer.quantityLeft):
                print("seller<buyer")
                boughtQuantity = seller.quantityLeft
                buyer.quantityLeft-=seller.quantityLeft
                seller.quantityLeft=0
            else:
                print("seller>buyer")
                boughtQuantity = buyer.quantityLeft
                seller.quantityLeft-=buyer.quantityLeft
                buyer.quantityLeft=0
            price=calculateDisPrice(k,buyer.bidPrice,seller.reservePrice)
            buyer.transaction.append(Transaction(boughtQuantity,price))
            buyer.totalBoughtPrice+=price*boughtQuantity
            seller.transaction.append(Transaction(boughtQuantity,price))
            seller.totalSoldPrice+=price*boughtQuantity
            i+=1
            print("=======round ",i,"=========")
            seller.print_seller()
            print("*")
            buyer.print_buyer()
            listing.append([seller,buyer])
    return buyers_sorted,sellers_sorted

def uni_kda(k,buyers,sellers):
    buyers_sorted,sellers_sorted=natural_sorting(buyers,sellers)
    price=calculateUniPrice(k,buyers_sorted,sellers_sorted)
    print("UniKDA\nk:",k,"\nprice:",price)
    return trading_iterate(price,buyers_sorted,sellers_sorted) # return listing, buyers, sellers 

def weighted_avg(buyers,sellers):
    buyers_sorted,sellers_sorted=natural_sorting(buyers,sellers)
    price=calculateAvgPrice(buyers_sorted)
    print(price)
    return trading_iterate(price,buyers_sorted,sellers_sorted) # return listing, buyers, sellers 

def natural_sorting(buyers,sellers):
    return sorted(buyers,key=lambda buyer: buyer.bidPrice, reverse=True),sorted(sellers,key=lambda seller: seller.reservePrice, reverse=False)

def trading_iterate(price,buyers,sellers):
    listing=[]
    i=0
    for buyer in buyers:
        for seller in sellers:
            seller.print_seller()
            if(seller.quantityLeft==0): continue
            elif(seller.quantityLeft<=buyer.quantityLeft):
                print("seller<buyer")
                boughtQuantity = seller.quantityLeft
                buyer.quantityLeft-=seller.quantityLeft
                seller.quantityLeft=0
            else:
                print("seller>buyer")
                boughtQuantity = buyer.quantityLeft
                seller.quantityLeft-=buyer.quantityLeft
                buyer.quantityLeft=0
            buyer.transaction.append(Transaction(boughtQuantity,price))
            buyer.totalBoughtPrice+=price*boughtQuantity
            seller.transaction.append(Transaction(boughtQuantity,price))
            seller.totalSoldPrice+=price*boughtQuantity
            i+=1
            print("=======round ",i,"=========")
            seller.print_seller()
            print("*")
            buyer.print_buyer()
            listing.append([seller,buyer])
    return buyers, sellers


    


