from smartContracts.buyer import Buyer
from smartContracts.seller import Seller
from smartContracts.transaction import Transaction
from smartContracts.calculate_unit_price import *
from smartContracts.evaluation_matrix import updateEvalutaionIndex
import datetime
# from seller import Seller
import random
def weighted_avg(buyers,sellers):
    buyers_sorted,sellers_sorted=natural_sorting(buyers,sellers)
    price=calculateAvgPrice(buyers_sorted)
    return trading_iterate(price,buyers_sorted,sellers_sorted) # return buyers, sellers 

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
    # [seller.print_seller() for seller in sellers_sorted]
    i=0
    for buyer in buyers_sorted:
        if(buyer.quantityLeft==0):continue
        for seller in sellers_sorted:
            if(seller.quantityLeft==0 or buyer.quantityLeft==0): continue
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
    print("adding grid dis-kda")
    buyersComplete,sellersComplete=addingGrid(buyers_sorted,sellers_sorted)
    buyersResult,sellersResult=updateEvalutaionIndex(buyersComplete,sellersComplete)
    return buyersResult,sellersResult

def uni_kda(k,buyers,sellers):
    buyers_sorted,sellers_sorted=natural_sorting(buyers,sellers)
    price=calculateUniPrice(k,buyers_sorted,sellers_sorted)
    # print("UniKDA\nk:",k,"\nprice:",price)
    return trading_iterate(price,buyers_sorted,sellers_sorted) # return buyers, sellers 

def natural_sorting(buyers,sellers):
    buyersSortedTime=sorted(buyers,key=lambda buyer: buyer.timestamp, reverse=True)
    sellerSortedTime=sorted(sellers,key=lambda seller: seller.timestamp, reverse=False)
    return sorted(buyersSortedTime,key=lambda buyer: buyer.bidPrice, reverse=True),sorted(sellerSortedTime,key=lambda seller: seller.reservePrice, reverse=False)

def trading_iterate(price,buyers,sellers):
    listing=[]
    i=0
    for buyer in buyers:
        if(buyer.quantityLeft==0):continue
        for seller in sellers:
            if(seller.quantityLeft==0 or buyer.quantityLeft==0): continue
            elif(seller.quantityLeft<=buyer.quantityLeft):
                # print("seller<buyer")
                boughtQuantity = seller.quantityLeft
                buyer.quantityLeft-=seller.quantityLeft
                seller.quantityLeft=0
            else:
                # print("seller>buyer")
                boughtQuantity = buyer.quantityLeft
                seller.quantityLeft-=buyer.quantityLeft
                buyer.quantityLeft=0
            buyer.transaction.append(Transaction(boughtQuantity,price))
            buyer.totalBoughtPrice+=price*boughtQuantity
            seller.transaction.append(Transaction(boughtQuantity,price))
            seller.totalSoldPrice+=price*boughtQuantity
            i+=1
            # print("=======round ",i,"=========")
            # seller.print_seller()
            # print("*")
            # buyer.print_buyer()
            listing.append([seller,buyer])
    buyersComplete,sellersComplete=addingGrid(buyers,sellers)
    buyersResult,sellersResult=updateEvalutaionIndex(buyersComplete,sellersComplete)
    return buyersResult,sellersResult

def addingGrid(buyers,sellers):
    totalQuantityWantLeft=sum([buyer.quantityWant for buyer in buyers])
    totalQuantityAvailableLeft=sum([seller.quantityAvailable for seller in sellers])
    print("in")
    print(totalQuantityWantLeft,totalQuantityAvailableLeft)
    if(totalQuantityWantLeft>totalQuantityAvailableLeft):
        grid=Seller(totalQuantityWantLeft-totalQuantityAvailableLeft,5, datetime.datetime.now().isoformat()).toGrid()
        for buyer in buyers:
            if(buyer.quantityLeft>0):
                buyer.totalBoughtPrice+=buyer.quantityLeft*grid.reservePrice
                buyer.transaction.append(Transaction(buyer.quantityLeft,grid.reservePrice))
                grid.transaction.append(Transaction(buyer.quantityLeft,grid.reservePrice))
                buyer.quantityLeft=0
        sellers.append(grid)
        [seller.print_seller() for seller in sellers]
    if(totalQuantityAvailableLeft>totalQuantityWantLeft):
        grid=Buyer(totalQuantityAvailableLeft-totalQuantityWantLeft,1.68,datetime.datetime.now().isoformat()).toGrid()
        grid.totalSoldPrice=1.68*totalQuantityAvailableLeft-totalQuantityWantLeft
        for seller in sellers:
            if(seller.quantityLeft>0):
                seller.totalSoldPrice+=seller.quantityLeft*grid.bidPrice
                seller.transaction.append(Transaction(seller.quantityLeft,grid.bidPrice))
                grid.transaction.append(Transaction(seller.quantityLeft,grid.bidPrice))
                seller.quantityLeft=0
        buyers.append(grid)
        [buyer.print_buyer() for buyer in buyers]
    return buyers,sellers

