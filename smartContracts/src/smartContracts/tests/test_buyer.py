from smartContracts.buyer import * 
import pandas as pd
import random
df=pd.read_csv('data.csv')
t=8
k=1
buyer_name=['CHAM1','CHAM2','CHAM3','CHAM4','CHAM5']
buyers=[]
def test_buyer():
    for buyer in buyer_name:
        quantityWant = df.iloc()[t][buyer]
        bidPrice = round(random.uniform(1,5), 1)
        buyer_obj=Buyer(quantityWant,bidPrice)
        buyers.append(buyer_obj)
        print(buyer)
        buyer_obj.print_buyer()
