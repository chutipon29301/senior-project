def updateEvalutaionIndex(buyers,sellers):
    GRID_SOLD_PRICE=5
    GRID_BOUGHT_PRICE=1.68
    K=len(buyers)
    L=len(sellers)
    totalBsi=sum([(buyer.bsi*(buyer.quantityWant-buyer.quantityLeft))/K for buyer in buyers])
    totalSsi=sum([(seller.ssi*(seller.quantityAvailable-seller.quantityLeft))/L for seller in sellers])
    for buyer in buyers:
        buyer.utilityIndex=(GRID_SOLD_PRICE*buyer.quantityWant)-buyer.totalBoughtPrice
        buyer.bsi=round((buyer.bidPrice*buyer.quantityWant)/buyer.totalBoughtPrice,2)
        buyer.mti=round(totalBsi/totalSsi,2)
    for seller in sellers:
        seller.utilityIndex=(GRID_BOUGHT_PRICE*seller.quantityAvailable)-seller.totalSoldPrice
        seller.ssi=round(seller.totalSoldPrice/(seller.quantityAvailable*seller.reservePrice),2)
        seller.mti=round(totalBsi/totalSsi,2)
    return buyers,sellers