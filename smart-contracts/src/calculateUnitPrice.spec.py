import unittest
from SmartContracts.service.calculateUnitPrice import *
from sympy import Point

class CalculateUnitPriceTestingModule(unittest.TestCase):

    def testFindIntersection1(self):
        buyerPoints = [
            Point(2, 3),
            Point(3, 3),
            Point(3, 2),
            Point(5, 2)
        ]
        sellerPoints = [
            Point(1, 1),
            Point(4, 1),
            Point(4, 4)
        ]

        buyerIntersectPoint, sellerIntersectPoint = findIntersection(buyerPoints, sellerPoints)
        
        self.assertEqual(buyerIntersectPoint[0].x.evalf(), 3)
        self.assertEqual(buyerIntersectPoint[0].y.evalf(), 2)
        self.assertEqual(buyerIntersectPoint[1].x.evalf(), 5)
        self.assertEqual(buyerIntersectPoint[1].y.evalf(), 2)

        self.assertEqual(sellerIntersectPoint[0].x.evalf(), 4)
        self.assertEqual(sellerIntersectPoint[0].y.evalf(), 1)
        self.assertEqual(sellerIntersectPoint[1].x.evalf(), 4)
        self.assertEqual(sellerIntersectPoint[1].y.evalf(), 4)

    def testFindIntersection2(self):
        buyerPoints = [
            Point(0.0, 4.7),
            Point(0.553333333, 4.7),
            Point(0.553333333, 3.9),
            Point(6.076, 3.9),
            Point(6.076, 3.8),
            Point(8.441333333, 3.8),
            Point(8.441333333, 3.3),
            Point(11.125333333, 3.3),
            Point(11.125333333, 3.2),
            Point(19.188333333, 3.2),
            Point(19.188333333, 1.68)
        ]
        sellerPoints = [
            Point(0.0, 3.1),
            Point(13.87, 3.1),
            Point(13.87, 3.5),
            Point(50.11, 3.5),
            Point(50.11, 3.7),
            Point(77.4, 3.7),
            Point(77.4, 4.9),
            Point(116.32, 4.9),
            Point(116.32, 5.0),
            Point(161.06, 5.0),
            Point(161.06, 5.0)
        ]

        buyerIntersectPoint, sellerIntersectPoint = findIntersection(buyerPoints, sellerPoints)
        
        self.assertEqual(buyerIntersectPoint[0].x.evalf(), 11.125333333)
        self.assertEqual(buyerIntersectPoint[0].y.evalf(), 3.2)
        self.assertEqual(buyerIntersectPoint[1].x.evalf(), 19.188333333)
        self.assertEqual(buyerIntersectPoint[1].y.evalf(), 3.2)

        self.assertEqual(sellerIntersectPoint[0].x.evalf(), 13.87)
        self.assertEqual(sellerIntersectPoint[0].y.evalf(), 3.1)
        self.assertEqual(sellerIntersectPoint[1].x.evalf(), 13.87)
        self.assertEqual(sellerIntersectPoint[1].y.evalf(), 3.5)
    
    def testFindIntersection3(self):
        buyerPoints = [
          
        ]
        sellerPoints = [

        ]

        buyerIntersectPoint, sellerIntersectPoint = findIntersection(buyerPoints, sellerPoints)
        
        self.assertEqual(buyerIntersectPoint[0].x.evalf(), 11.125333333)
        self.assertEqual(buyerIntersectPoint[0].y.evalf(), 3.2)
        self.assertEqual(buyerIntersectPoint[1].x.evalf(), 19.188333333)
        self.assertEqual(buyerIntersectPoint[1].y.evalf(), 3.2)

        self.assertEqual(sellerIntersectPoint[0].x.evalf(), 13.87)
        self.assertEqual(sellerIntersectPoint[0].y.evalf(), 3.1)
        self.assertEqual(sellerIntersectPoint[1].x.evalf(), 13.87)
        self.assertEqual(sellerIntersectPoint[1].y.evalf(), 3.5)


if __name__ == '__main__':
    unittest.main()