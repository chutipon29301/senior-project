import numpy as np
import matplotlib.pyplot as plt
from typing import List, Tuple
import itertools
from SmartContracts.model.buyer import Buyer
from SmartContracts.model.seller import Seller
import itertools
from datetime import datetime
from shapely.geometry import LineString,Point
from sympy import Segment

def getAvgPrice(buyers: List[Buyer]) -> float:
    totalWeight = sum([buyer.bidPrice*buyer.quantityWant for buyer in buyers])
    totalPower = sum([buyer.quantityWant for buyer in buyers])
    return round(totalWeight/totalPower, 2)


def getDisPrice(k: float, bidPrice: float, reservePrice: float) -> float:
    return k * bidPrice + (1 - k) * reservePrice


def getUniPrice(k: float, buyers: List[Buyer], sellers: List[Seller]) -> float:
    buyerPoints, sellerPoints = generatePoints(buyers, sellers)
    buyerIntersectPoints, sellerIntersectPoints, intercept = findIntersection(buyerPoints, sellerPoints)
    buyerPrice, sellerPrice = getIntersectPrices(buyerIntersectPoints, sellerIntersectPoints, intercept)
    return k * buyerPrice + (1-k) * sellerPrice
    

def generatePoints(buyers: List[Buyer], sellers: List[Seller]) -> Tuple[List[Point], List[Point]]:
    # Generate points for buyer
    buyerPoints = list()
    buyerAccuQuantity = 0
    for buyer in buyers:
        buyerPoints.append(Point(buyerAccuQuantity, buyer.bidPrice))
        buyerAccuQuantity += buyer.quantityWant
        buyerPoints.append(Point(buyerAccuQuantity, buyer.bidPrice))
    buyerPoints.append(Point(buyerAccuQuantity, 1.68))

    # Generate points for seller
    sellerPoints = list()
    sellerAccuQuantity = 0
    for seller in sellers:
        sellerPoints.append(Point(sellerAccuQuantity, seller.reservePrice))
        sellerAccuQuantity += seller.quantityAvailable
        sellerPoints.append(Point(sellerAccuQuantity, seller.reservePrice))
    sellerPoints.append(Point(sellerAccuQuantity, 5))
    ## Save figure for debugging
        # fig = plt.figure()
        # plt.axis((0,20,3,5))
        # plt.plot([buyerPoint.x for buyerPoint in buyerPoints], [buyerPoint.y for buyerPoint in buyerPoints], 'r', [
        #          sellerPoint.x for sellerPoint in sellerPoints], [sellerPoint.y for sellerPoint in sellerPoints], 'b')
        # plt.show()
        # fig.savefig('test.png')
    return buyerPoints, sellerPoints

def findIntersection(buyerPoints: List, sellerPoints: List) -> Tuple[List]:
    l1 = LineString([buyerPoint for buyerPoint in buyerPoints])
    l2 = LineString([sellerPoint for sellerPoint in sellerPoints])
    intercept = l1.intersection(l2)
    # print(list(intercept.coords))
    if(intercept.geom_type == 'Point'):
        coor_buyers = [buyerPoint for buyerPoint in buyerPoints if buyerPoint.x == intercept.x or buyerPoint.y == intercept.y]
        coor_sellers = [sellerPoint for sellerPoint in sellerPoints if sellerPoint.x == intercept.x or sellerPoint.y == intercept.y]
    else:
        coor_buyers = [buyerPoint for buyerPoint in buyerPoints if buyerPoint.x == intercept.coords[0].x or buyerPoint.y == intercept.coords[0].y]
        coor_sellers = [sellerPoint for sellerPoint in sellerPoints if sellerPoint.x == intercept.coords[0].x or sellerPoint.y == intercept.coords[0].y]
    return coor_buyers , coor_sellers, intercept

def getIntersectPrices(buyerPoints: List[Point], sellerPoints: List[Point], intercept: Point) -> Tuple[float]:
    if(len(buyerPoints) != 2):
        raise ValueError('Invalid buyerPoints length')
    if(len(sellerPoints) != 2):
        raise ValueError('Invalid sellerPoints length')
    isHorizontalBuyer= buyerPoints[0].y==buyerPoints[1].y
    isHorizontalSeller= sellerPoints[0].y==sellerPoints[1].y
    if(isHorizontalBuyer and isHorizontalSeller):
        return float(buyerPoints[0].y), float(sellerPoints[0].y)
    if(isHorizontalBuyer and not isHorizontalSeller):
        return float(intercept.y), float(sellerPoints[0].y)
    if(not isHorizontalBuyer and isHorizontalSeller):
        return float(buyerPoints[0].y), float(intercept.y)
    if(not isHorizontalBuyer and not isHorizontalSeller):
        return float(buyerPoints[0].y), float(max([p.y for p in intercept]))


