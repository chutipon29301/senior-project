
import numpy as np
# import matplotlib.pyplot as plt
def calculateAvgPrice(buyers):
    totalWeight=sum([buyer.bidPrice*buyer.quantityWant for buyer in buyers])
    totalPower=sum([buyer.quantityWant for buyer in buyers])
    return round(totalWeight/totalPower,2)

def calculateUniPrice(k,buyers,sellers):
    buyer_line=list();seller_line=list()
    buyer_acc_q=np.cumsum([round(buyer.quantityWant,2) for buyer in buyers])
    seller_acc_q=np.cumsum([round(seller.quantityAvailable,2) for seller in sellers])
    [buyer_line.append((buyer_acc_q[i],buyers[i].bidPrice)) for i in range(len(buyers))]
    [seller_line.append((seller_acc_q[i],sellers[i].reservePrice)) for i in range(len(sellers))]
    seller_price=[seller.reservePrice for seller in sellers]
    buyer_price=[buyer.bidPrice for buyer in buyers]
    buyer_i,seller_j=(poly_intersection(buyer_line,seller_line))
    # plt.plot(buyer_acc_q, buyer_price, 'r',seller_acc_q, seller_price,'b')
    # plt.show()
    # print(buyer_price[buyer_i],seller_price[seller_j])
    return k*buyer_price[buyer_i]+(1-k)*seller_price[seller_j]

def calculateDisPrice(k,bidPrice,reservePrice):
    return k*bidPrice+(1-k)*reservePrice

def line_intersection(line1, line2):
    xdiff = (line1[0][0] - line1[1][0], line2[0][0] - line2[1][0])
    ydiff = (line1[0][1] - line1[1][1], line2[0][1] - line2[1][1])

    def det(a, b):
        return a[0] * b[1] - a[1] * b[0]

    div = det(xdiff, ydiff)
    if div == 0:
       return None, None

    d = (det(*line1), det(*line2))
    x = det(d, xdiff) / div
    y = det(d, ydiff) / div
    if(x and y): return round(x,2) , round(y,2)
    return None, None

def poly_intersection(poly1, poly2):
    for i, p1_first_point in enumerate(poly1[:-1]):
        p1_second_point = poly1[i + 1]
        for j, p2_first_point in enumerate(poly2[:-1]):
            p2_second_point = poly2[j + 1]
            intersect_x, intersect_y=line_intersection((p1_first_point, p1_second_point), (p2_first_point, p2_second_point))
            if(intersect_x and intersect_y):
                if(intersect_x >p1_first_point[0] \
                    and intersect_x > p2_first_point[0]\
                    and intersect_x<p1_second_point[0]\
                    and intersect_x<p2_second_point[0]\
                    and intersect_y<p1_first_point[1]\
                    and intersect_y<p2_second_point[1]\
                    and intersect_y>p1_second_point[1]\
                    and intersect_y>p2_first_point[1]\
                ):
                    return i+1,j+1 #Buyer index,Seller index
    p1_max=max([p[0] for p in poly1])
    p2_max=max([p[0] for p in poly2])
    if(p2_max<p1_max):
        for i in range(len(poly1)): 
            if poly1[i][0]>poly2[-1][0]: 
                potential = i
                break
    else:
        for i in range(len(poly2)): 
            if poly2[i][0]>poly1[-1][0]: 
                potential = i
                break
    return potential,len(poly2)-1 #Buyer index,Seller index
