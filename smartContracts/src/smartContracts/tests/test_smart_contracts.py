from smartContracts.smart_contracts import * 
import pandas as pd

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
    print(buyer)
    buyer_obj.print_buyer()

for seller in seller_name:
    quantityAvailable = df.iloc()[t][seller]
    reservePrice = round(random.uniform(1,5), 1)
    seller_obj=Seller(quantityAvailable,reservePrice)
    sellers.append(seller_obj)
    print(seller)
    seller_obj.print_seller()

def test_dis_kda():
    assert dis_kda(k,buyers,sellers) == k

def test_uni_kda():
    assert uni_kda(k,buyers,sellers) == k

def test_weighted_avg():
    assert weighted_avg(buyers,sellers) == buyers