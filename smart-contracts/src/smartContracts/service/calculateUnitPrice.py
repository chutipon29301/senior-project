from sympy import Point, Line, Segment, Ray
import numpy as np
import matplotlib.pyplot as plt
from typing import List, Tuple
import itertools
from SmartContracts.model.buyer import Buyer
from SmartContracts.model.seller import Seller
import itertools
from datetime import datetime


def getAvgPrice(buyers: List[Buyer]) -> float:
    totalWeight = sum([buyer.bidPrice*buyer.quantityWant for buyer in buyers])
    totalPower = sum([buyer.quantityWant for buyer in buyers])
    return round(totalWeight/totalPower, 2)


def getDisPrice(k: float, bidPrice: float, reservePrice: float) -> float:
    return k * bidPrice + (1 - k) * reservePrice


def getUniPrice(k: float, buyers: List[Buyer], sellers: List[Seller]) -> float:
    buyerPoints, sellerPoints = generatePoints(buyers, sellers)
    buyerIntersectPoints, sellerIntersectPoints = findIntersection(buyerPoints, sellerPoints)
    buyerPrice, sellerPrice = getIntersectPrices(buyerIntersectPoints, sellerIntersectPoints)
    # print(buyerPrice, sellerPrice)
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

    # Save figure for debugging
    fig = plt.figure()
    # plt.axis((0,20,3,5))
    plt.plot([buyerPoint.x for buyerPoint in buyerPoints], [buyerPoint.y for buyerPoint in buyerPoints], 'r', [
             sellerPoint.x for sellerPoint in sellerPoints], [sellerPoint.y for sellerPoint in sellerPoints], 'b')
    plt.show()
    fig.savefig('test.png')
    return buyerPoints, sellerPoints


def findIntersection(buyerPoints: List, sellerPoints: List) -> Tuple[List]:
    # print('=============')
    # print("buyers:",[(float(b.x),float(b.y)) for b in buyerPoints])
    # print("sellers:",[(float(s.x),float(s.y)) for s in sellerPoints])
    if(len(buyerPoints) == 2 and len(sellerPoints) == 2):
        buyerSegment = Ray(buyerPoints[0], buyerPoints[1])
        sellerSegment = Ray(sellerPoints[0], sellerPoints[1])
        if(len(buyerSegment.intersection(sellerSegment)) > 0):
            return buyerPoints, sellerPoints
        else:
            return ()

    buyerMiddleIndex, sellerMiddleIndex = len(buyerPoints) // 2, len(sellerPoints) // 2
    buyerLastIndex, sellerLastIndex = len(buyerPoints) - 1, len(sellerPoints) - 1
    # print(buyerMiddleIndex, sellerMiddleIndex)
    # print(buyerLastIndex, sellerLastIndex)
    sellerSegmentIndexes = [(sellerMiddleIndex, sellerLastIndex), (sellerMiddleIndex, 0)]
    buyerSegmentIndexes = [(buyerMiddleIndex, buyerLastIndex), (buyerMiddleIndex, 0)]
    if(len(buyerPoints) == 2):
        buyerSegmentIndexes = [(buyerLastIndex, 0)]
    if(len(sellerPoints) == 2):
        sellerSegmentIndexes = [(sellerLastIndex, 0)]

    # print(buyerSegmentIndexes, sellerSegmentIndexes)
    segmentIndexPairs = list(itertools.product(buyerSegmentIndexes, sellerSegmentIndexes))

    for (buyerP1, buyerP2), (sellerP1, sellerP2) in segmentIndexPairs:
        # print((buyerP1, buyerP2), (sellerP1, sellerP2))
        buyerSegment = Ray(buyerPoints[buyerP1], buyerPoints[buyerP2])
        sellerSegment = Ray(sellerPoints[sellerP1], sellerPoints[sellerP2])
        # print("==> Call recursive : ", len(buyerSegment.intersection(sellerSegment)) > 0)
        if(len(buyerSegment.intersection(sellerSegment)) > 0):
            # print("intersect:", ((buyerP1, buyerP2), (sellerP1, sellerP2)))
            return findIntersection(
                buyerPoints[slice(min(buyerP1, buyerP2), max(buyerP1, buyerP2) + 1)], 
                sellerPoints[slice(min(sellerP1, sellerP2), max(sellerP1, sellerP2) + 1)]
            )


def getIntersectPrices(buyerPoints: List[Point], sellerPoints: List[Point]) -> Tuple[float]:
    if(len(buyerPoints) != 2):
        raise ValueError('Invalid buyerPoints length')
    if(len(sellerPoints) != 2):
        raise ValueError('Invalid sellerPoints length')
    buyerSegment = Ray(*buyerPoints)
    sellerSegment = Ray(*sellerPoints)
    interceptPoints = buyerSegment.intersection(sellerSegment)
    if(buyerSegment.slope == 0 and sellerSegment.slope == 0):
        return float((buyerSegment.points)[0].y), float((sellerSegment.points)[0].y)
    if(buyerSegment.slope == 0 and sellerSegment.slope != 0):
        return float(interceptPoints[0].y), float((sellerSegment.points)[0].y)
    if(buyerSegment.slope != 0 and sellerSegment.slope == 0):
        return float((buyerSegment.points)[0].y), float(interceptPoints[0].y)
    if(buyerSegment.slope != 0 and sellerSegment.slope != 0):
        return float((buyerSegment.points)[0].y), float(max([p.y for p in interceptPoints]))


# def findUniPrice():

    # if(len(buyerPoints) == 2):
    #     buyerSegment = Segment(buyerPoints[0],buyerPoints[1])
    # else:
    #     buyerHighSegment = Segment(buyerPoints[0], buyerPoints[buyerMiddleIndex])
    #     buyerLowSegment = Segment(buyerPoints[buyerMiddleIndex], buyerPoints[-1])
    #     buyerHighPoints, buyerLowPoints = buyerPoints[:buyerMiddleIndex+1], buyerPoints[buyerMiddleIndex:]

    # if(len(sellerPoints)==2):
    #     sellerSegment = Segment(sellerPoints[0],sellerPoints[1])
    # else:
    #     sellerHighSegment = Segment(sellerPoints[sellerMiddleIndex],sellerPoints[-1])
    #     sellerLowSegment = Segment(sellerPoints[0],sellerPoints[sellerMiddleIndex])
    #     sellerLowPoints,sellerHighPoints = sellerPoints[:sellerMiddleIndex+1],sellerPoints[sellerMiddleIndex:]

    # if(buyerSegment is None and sellerSegment is None):
    #     if(len(buyerHighSegment.intersection(sellerLowSegment))>0):
    #         return findIntersection(buyerHighPoints,sellerLowPoints)
    #     if(len(buyerHighSegment.intersection(sellerHighSegment))>0):
    #         return findIntersection(buyerHighPoints,sellerHighPoints)
    #     if(len(buyerLowSegment.intersection(sellerLowSegment))>0):
    #         return findIntersection(buyerLowPoints,sellerLowPoints)
    #     if(len(buyerLowSegment.intersection(sellerHighSegment))>0):
    #         return findIntersection(buyerLowPoints,sellerHighPoints)
    # elif(buyerSegment is not None and sellerSegment is None):
    #     print("buyer short")
    #     if(len(buyerSegment.intersection(sellerLowSegment))>0):
    #         return findIntersection(buyerPoints,sellerLowPoints)
    #     if(len(buyerSegment.intersection(sellerHighSegment))>0):
    #         return findIntersection(buyerPoints,sellerHighPoints)
    # elif(buyerSegment is None and sellerSegment is not None):
    #     print("seller short")
    #     if(len(sellerSegment.intersection(buyerLowSegment))>0):
    #         return findIntersection(buyerLowPoints,sellerPoints)
    #     if(len(sellerSegment.intersection(buyerHighSegment))>0):
    #         return findIntersection(buyerHighPoints,sellerPoints)
    # else:
    #     interceptPoints=buyerSegment.intersection(sellerSegment)
    #     if(buyerSegment.slope == 0 and sellerSegment.slope == 0):
    #         return float((buyerSegment.points)[0].y)
    #     if(buyerSegment.slope == 0 and sellerSegment.slope != 0):
    #         return float(interceptPoints[0].y),float((sellerSegment.points)[0].y)
    #     if(buyerSegment.slope != 0 and sellerSegment.slope == 0):
    #         return float(interceptPoints[0].y),float((buyerSegment.points)[0].y)
    #     if(buyerSegment.slope != 0 and sellerSegment.slope != 0):
    #         return float(max([p.y for p in interceptPoints])),float((buyerSegment.points)[0].y)


# def getUniPrice(k: float, buyers: List[Buyer], sellers: List[Seller]) -> float:
#     buyer_line = list()
#     seller_line = list()

#     buyer_acc_q = np.cumsum([round(buyer.quantityWant, 2) for buyer in buyers])
#     seller_acc_q = np.cumsum([round(seller.quantityAvailable, 2) for seller in sellers])
#     print(buyer_acc_q, seller_acc_q)

    # [buyer_line.append(Point(buyer_acc_q[i], buyer.bidPrice))
    #  for i,buyer in enumerate(buyers)]
    # [seller_line.append(Point(seller_acc_q[i], seller.reservePrice))
    #  for i,seller in enumerate(sellers)]

#     seller_price = [seller.reservePrice for seller in sellers]
#     buyer_price = [buyer.bidPrice for buyer in buyers]

#     fig = plt.figure()
#     plt.plot(buyer_acc_q, buyer_price, 'r',seller_acc_q, seller_price,'b')
#     plt.show()
#     fig.savefig('test.png')

#     buyer_i, seller_j = poly_intersection(buyer_line, seller_line)
#     # return k*buyer_price[buyer_i]+(1-k)*seller_price[seller_j]


# def poly_intersection(buyer_pt: List[Point], seller_pt: List[Point]) -> Tuple[int]:

#     buyer_line=[Segment(*pair) for pair in list(map(list, zip(buyer_pt, buyer_pt[1:])))]
#     seller_line=[Segment(*pair) for pair in list(map(list, zip(seller_pt, seller_pt[1:])))]

#     b=datetime.now()
#     half = len(buyer_line)//2
#     higher_buyer,lower_buyer=buyer_line[:half], buyer_line[half:]
#     half = len(seller_line)//2
#     lower_seller,higher_seller=seller_line[:half], seller_line[half:]
#     for b in higher_buyer:
#         higher_seller[0].intersection(b)
#     # for i, p1_first_point in enumerate(seller_pt[:-1]):
#     #     p1_second_point = seller_pt[i + 1]
#     #     for j, p2_first_point in enumerate(buyer_pt[:-1]):
#     #         p2_second_point = buyer_pt[j + 1]
#     #         s1 = Segment(p1_first_point, p1_second_point)
#     #         s2 = Segment(p2_first_point, p2_second_point)
#     #         inter_p = s1.intersection(s2)
#     #         if(len(inter_p) > 0):
#     #             print(i+1,j+1)
#     #             print(datetime.now()-b)
#     #             return i+1, j+1

#     p1_max = max([p.x for p in buyer_pt])
#     p2_max = max([p.x for p in seller_pt])
#     if(p2_max < p1_max):
#         for i in range(len(buyer_pt)):
#             if buyer_pt[i].x > seller_pt[-1].x:
#                 potential = i
#                 break
#     else:
#         for i in range(len(seller_pt)):
#             if seller_pt[i].x > buyer_pt[-1].x:
#                 potential = i
#                 break
#     return potential, len(seller_pt)-1
