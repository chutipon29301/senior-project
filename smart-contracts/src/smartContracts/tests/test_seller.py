from smartContracts.seller import * 
import pandas as pd
import random
df=pd.read_csv('data.csv')
t=8
k=1
sellers=[]
seller_name=['CHAM1-PV','CHAM2-PV','CHAM3-PV','CHAM4-PV','CHAM5-PV']
def test_seller():
    for seller in seller_name:
        quantityAvailable = df.iloc()[t][seller]
        reservePrice = round(random.uniform(1,5), 1)
        seller_obj=Seller(quantityAvailable,reservePrice)
        sellers.append(seller_obj)
        print(seller)
        seller_obj.print_seller()
        assert seller_obj.quantityAvailable == quantityAvailable
        assert seller_obj.reservePrice == reservePrice