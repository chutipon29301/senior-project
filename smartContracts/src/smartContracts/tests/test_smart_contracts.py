from smartContracts.smart_contracts import * 
import pandas as pd
def generate_test_set():
    df=pd.read_csv('data.csv')
    t=8
    k=1
    print(df.iloc()[t]['Time'],'k=',k)
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

def test_dis_kda():
    buyers,sellers=generate_test_set()
    buyers_traded, sellers_traded=discriminatory_kda(buyers,sellers)
     #[buyer.print_buyer() for buyer in buyers_traded]
    assert sum([buyer.quantityLeft for buyer in buyers_traded]) == 0 and sum([seller.quantityLeft for seller in sellers_traded])==0

def test_uni_kda():
    buyers,sellers=generate_test_set()
    buyers_traded, sellers_traded= uniform_kda(buyers,sellers) 
    assert sum([buyer.quantityLeft for buyer in buyers_traded]) == 0 and sum([seller.quantityLeft for seller in sellers_traded])==0


def test_weighted_avg():
    buyers,sellers=generate_test_set()
    buyers_traded, sellers_traded=weighted_avg(buyers,sellers)
    # assert len(listing)!=0 and len(buyers_traded) == len(buyers) and len(sellers_traded) == len(sellers)
    assert sum([buyer.quantityLeft for buyer in buyers_traded]) == 0 and sum([seller.quantityLeft for seller in sellers_traded])==0
