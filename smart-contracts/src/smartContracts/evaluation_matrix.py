def updateEvalutaionIndex(buyers,sellers):
    GRID_SOLD_PRICE=5
    GRID_BOUGHT_PRICE=1.68
    K=len(buyers)
    L=len(sellers)
    for buyer in buyers:
        buyer.utilityIndex=round((GRID_SOLD_PRICE*buyer.quantityWant)-buyer.totalBoughtPrice,2)
        try:
            buyer.bsi=round((buyer.bidPrice*buyer.quantityWant)/buyer.totalBoughtPrice,2)
        except ZeroDivisionError:
            buyer.bsi= 0
    for seller in sellers:
        seller.utilityIndex=round(seller.totalSoldPrice-(GRID_BOUGHT_PRICE*seller.quantityAvailable),2)
        try:
            seller.ssi=round(seller.totalSoldPrice/(seller.quantityAvailable*seller.reservePrice),2)
        except ZeroDivisionError:
            seller.ssi = 0
    totalBsi=sum([(buyer.bsi*buyer.quantityWant)/K for buyer in buyers])
    totalSsi=sum([(seller.ssi*seller.quantityAvailable)/L for seller in sellers])
    try:
        mti=round(totalBsi/totalSsi,2)
    except ZeroDivisionError:
        mti = 0
    for buyer in buyers: buyer.mti=mti
    for seller in sellers: seller.mti=mti
    return buyers,sellers