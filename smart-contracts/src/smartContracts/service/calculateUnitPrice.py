from sympy import Point, Line, Segment
import numpy as np
import matplotlib.pyplot as plt
from typing import List,Tuple

from SmartContracts.model.buyer import Buyer
from SmartContracts.model.seller import Seller

def getAvgPrice(buyers: List[Buyer])->float:
    totalWeight=sum([buyer.bidPrice*buyer.quantityWant for buyer in buyers])
    totalPower=sum([buyer.quantityWant for buyer in buyers])
    return round(totalWeight/totalPower,2)

def getDisPrice(k: float, bidPrice: float, reservePrice: float)->float:
    return k*bidPrice+(1-k)*reservePrice

def getUniPrice(k: float, buyers : List[Buyer], sellers: List[Seller])->float:
    buyer_line=list();seller_line=list()
    
    buyer_acc_q=np.cumsum([round(buyer.quantityWant,2) for buyer in buyers])
    seller_acc_q=np.cumsum([round(seller.quantityAvailable,2) for seller in sellers])
    
    [buyer_line.append(Point(buyer_acc_q[i],buyers[i].bidPrice)) for i in range(len(buyers))]
    [seller_line.append(Point(seller_acc_q[i],sellers[i].reservePrice)) for i in range(len(sellers))]
    
    seller_price=[seller.reservePrice for seller in sellers]
    buyer_price=[buyer.bidPrice for buyer in buyers]
    
    # fig = plt.figure()
    # plt.plot(buyer_acc_q, buyer_price, 'r',seller_acc_q, seller_price,'b')
    # plt.show()
    # fig.savefig('test.png')

    buyer_i,seller_j=poly_intersection(buyer_line,seller_line)
    return k*buyer_price[buyer_i]+(1-k)*seller_price[seller_j]


def poly_intersection(poly1: List[Point] , poly2: List[Point])-> Tuple[int]:
    for i, p1_first_point in enumerate(poly1[:-1]):
        p1_second_point = poly1[i + 1]
        for j, p2_first_point in enumerate(poly2[:-1]):
            p2_second_point = poly2[j + 1]
            s1=Segment(p1_first_point, p1_second_point)
            s2=Segment(p2_first_point, p2_second_point)
            inter_p=s1.intersection(s2)
            if(len(inter_p)>0): return i+1,j+1
    p1_max=max([p.x for p in poly1])
    p2_max=max([p.x for p in poly2])
    if(p2_max<p1_max):
        for i in range(len(poly1)): 
            if poly1[i].x>poly2[-1].x: 
                potential = i
                break
    else:
        for i in range(len(poly2)): 
            if poly2[i].x>poly1[-1].x: 
                potential = i
                break
    return potential,len(poly2)-1

