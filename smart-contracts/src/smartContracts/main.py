from .model.buyer import Buyer
from .model.seller import Seller
from .model.transaction import Transaction
from .service.calculateUnitPrice import *
from .service.evaluate import *
import datetime
import random
from typing import List, Optional, Tuple


def dis_kda(k: float,
            buyers: List[Buyer],
            sellers: List[Seller],
            utilities: List[str]) -> Tuple[List[Buyer], List[Seller]]:
    buyers_sorted, sellers_sorted = natural_sorting(buyers, sellers)
    totalQuantityAvailable = sum(
        [seller.quantityAvailable for seller in sellers])
    totalQuantityWant = sum([buyer.quantityWant for buyer in buyers])
    if(totalQuantityAvailable == 0 or totalQuantityWant == 0):
        buyersComplete, sellersComplete = addingGrid(
            buyers, sellers, utilities)
        buyersResult, sellersResult = updateStatus(
            buyersComplete, sellersComplete)
    else:
        buyersResult, sellersResult = trading_iterate(
            buyers_sorted, sellers_sorted, utilities, k=k)
    return buyersResult, sellersResult


def uni_kda(k: float,
            buyers: List[Buyer],
            sellers: List[Seller],
            utilities: List[str]) -> Tuple[List[Buyer], List[Seller]]:
    buyers_sorted, sellers_sorted = natural_sorting(buyers, sellers)
    totalQuantityAvailable = sum(
        [seller.quantityAvailable for seller in sellers])
    totalQuantityWant = sum([buyer.quantityWant for buyer in buyers])
    if(totalQuantityAvailable == 0 or totalQuantityWant == 0):
        buyersComplete, sellersComplete = addingGrid(
            buyers, sellers, utilities)
        buyersResult, sellersResult = updateStatus(
            buyersComplete, sellersComplete)
    else:
        price = getUniPrice(k, buyers_sorted, sellers_sorted)
        buyersResult, sellersResult = trading_iterate(
            buyers_sorted, sellers_sorted, utilities, k=k, price=price)
    return buyersResult, sellersResult


def weighted_avg(buyers: List[Buyer],
                 sellers: List[Seller],
                 utilities: List[str]) -> Tuple[List[Buyer], List[Seller]]:
    buyers_sorted, sellers_sorted = natural_sorting(buyers, sellers)
    totalQuantityAvailable = sum(
        [seller.quantityAvailable for seller in sellers])
    totalQuantityWant = sum([buyer.quantityWant for buyer in buyers])
    if(totalQuantityAvailable == 0 or totalQuantityWant == 0):
        buyersComplete, sellersComplete = addingGrid(
            buyers, sellers, utilities)
        buyersResult, sellersResult = updateStatus(
            buyersComplete, sellersComplete)
    else:
        price = getAvgPrice(buyers_sorted)
        buyersResult, sellersResult = trading_iterate(
            buyers_sorted, sellers_sorted, utilities, price=price)
    return buyersResult, sellersResult


def trading_iterate(buyers: List[Buyer],
                    sellers: List[Seller],
                    utilities: List[str],
                    price: Optional[float] = None,
                    k: float = 0.5) -> Tuple[List[Buyer], List[Seller]]:
    for buyer in buyers:
        if(buyer.quantityLeft == 0):
            continue
        for seller in sellers:
            if(seller.quantityLeft == 0 or buyer.quantityLeft == 0):
                continue
            elif(seller.quantityLeft <= buyer.quantityLeft):
                # print("seller<buyer")
                boughtQuantity = seller.quantityLeft
                buyer.quantityLeft -= seller.quantityLeft
                seller.quantityLeft = 0
            else:
                # print("seller>buyer")
                boughtQuantity = buyer.quantityLeft
                seller.quantityLeft -= buyer.quantityLeft
                buyer.quantityLeft = 0
            if(price == None):
                price = getDisPrice(k, buyer.bidPrice, seller.reservePrice)
            buyer.transaction.append(Transaction(
                seller.id, boughtQuantity, price))
            buyer.totalBoughtPrice += round(price*boughtQuantity, 2)
            seller.transaction.append(Transaction(
                buyer.id, boughtQuantity, price))
            seller.totalSoldPrice += round(price*boughtQuantity, 2)

    buyersComplete, sellersComplete = addingGrid(buyers, sellers, utilities)
    buyersResult, sellersResult = updateStatus(buyersComplete, sellersComplete)
    return buyersResult, sellersResult


def updateStatus(buyersComplete: List[Buyer], sellersComplete: List[Seller]):
    for buyer in buyersComplete:
        if(len(buyer.transaction) > 0):
            buyer.avgBoughtPrice = sum(
                tx.price for tx in buyer.transaction)/float(len(buyer.transaction))
    for seller in sellersComplete:
        if(len(seller.transaction) > 0):
            seller.avgSoldPrice = sum(
                tx.price for tx in seller.transaction)/float(len(seller.transaction))
    return updateEvalutaionIndex(buyersComplete, sellersComplete)


def addingGrid(buyers: List[Buyer],
               sellers: List[Seller],
               utilities: List[str]) -> Tuple[List[Buyer], List[Seller]]:
    totalQuantityWantLeft = sum([buyer.quantityWant for buyer in buyers])
    totalQuantityAvailableLeft = sum(
        [seller.quantityAvailable for seller in sellers])

    if(totalQuantityWantLeft > totalQuantityAvailableLeft):
        grid = Seller(utilities[0], totalQuantityWantLeft-totalQuantityAvailableLeft,
                      5, datetime.datetime.now().isoformat(), isGrid=True)
        for buyer in buyers:
            if(buyer.quantityLeft > 0):
                buyer.totalBoughtPrice += buyer.quantityLeft*grid.reservePrice
                buyer.transaction.append(Transaction(
                    grid.id, buyer.quantityLeft, grid.reservePrice))
                grid.transaction.append(Transaction(
                    buyer.id, buyer.quantityLeft, grid.reservePrice))
        sellers.append(grid)

    if(totalQuantityAvailableLeft > totalQuantityWantLeft):
        grid = Buyer(utilities[0], totalQuantityAvailableLeft-totalQuantityWantLeft,
                     1.68, datetime.datetime.now().isoformat(), isGrid=True)
        grid.totalSoldPrice = 1.68*totalQuantityAvailableLeft-totalQuantityWantLeft
        for seller in sellers:
            if(seller.quantityLeft > 0):
                seller.totalSoldPrice += seller.quantityLeft*grid.bidPrice
                seller.transaction.append(Transaction(
                    grid.id, seller.quantityLeft, grid.bidPrice))
                grid.transaction.append(Transaction(
                    seller.id, seller.quantityLeft, grid.bidPrice))
                # seller.quantityLeft=0
        buyers.append(grid)
    return buyers, sellers


def natural_sorting(buyers: List[Buyer], sellers: List[Seller]) -> Tuple[List[Buyer], List[Seller]]:
    buyersSortedTime = sorted(
        buyers, key=lambda buyer: buyer.timestamp, reverse=True)
    sellerSortedTime = sorted(
        sellers, key=lambda seller: seller.timestamp, reverse=False)
    return sorted(buyersSortedTime, key=lambda buyer: buyer.bidPrice, reverse=True), sorted(sellerSortedTime, key=lambda seller: seller.reservePrice, reverse=False)
