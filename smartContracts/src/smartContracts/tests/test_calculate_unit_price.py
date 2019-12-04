from smartContracts.calculate_unit_price import *
from smartContracts.smart_contracts import *
import pandas as pd
import random
def generate_test_set():
    df=pd.read_csv('data.csv')
    t=8
    k=1
    buyer_name=['CHAM1','CHAM2','CHAM3','CHAM4','CHAM5']
    seller_name=['CHAM1-PV','CHAM2-PV','CHAM3-PV','CHAM4-PV','CHAM5-PV']
    buyers=[]
    sellers=[]
    for buyer in buyer_name:
        quantityWant = df.iloc()[t][buyer]
        bidPrice = round(random.uniform(1,5), 1)
        buyer_obj=Buyer(quantityWant,bidPrice)
        buyers.append(buyer_obj)
        # print(buyer)
        # buyer_obj.print_buyer()

    for seller in seller_name:
        quantityAvailable = df.iloc()[t][seller]
        reservePrice = round(random.uniform(1,5), 1)
        seller_obj=Seller(quantityAvailable,reservePrice)
        sellers.append(seller_obj)
        # print(seller)
        # seller_obj.print_seller()
    return buyers,sellers

def test_calculate_avg_price():
    buyers,sellers=generate_test_set()
    buyers_sorted,sellers_sorted=natural_sorting(buyers,sellers)
    assert calculateAvgPrice(buyers_sorted) != 0

def test_calculate_dis_price():
    k1=1;k0=0
    bidPrice=4
    reservePrice=5
    assert calculateDisPrice(k1,bidPrice,reservePrice) == 4 and calculateDisPrice(k0,bidPrice,reservePrice) == 5 

def test_calculate_uni_price():
    k=0
    buyers,sellers=generate_test_set()
    buyers_sorted,sellers_sorted=natural_sorting(buyers,sellers)
    assert calculateUniPrice(k,buyers_sorted,sellers_sorted) != 0