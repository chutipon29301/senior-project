from flask import Flask, request,jsonify,json
from flask_json import FlaskJSON, JsonError, json_response, as_json
import urllib.parse
from smartContracts.smart_contracts import *
from smartContracts.buyer import *
from smartContracts.seller import *
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'hello, World!'

@app.route('/', methods=['POST'])
def test():
    data = json.loads(request.get_data())
    data['value'] = 'this has been altered...GOOD!'
    return data

@app.route('/disKDA', methods=['POST'])
def disKDA():
    data = json.loads(request.get_data())
    raw_buyers = data['buyers']
    raw_sellers = data['sellers']
    buyers=[];sellers=[]
    print(raw_buyers[0]['bidPrice'])
    for buyer in raw_buyers:
        buyers.append(Buyer(buyer['quantity'],buyer['bidPrice']))
    for seller in raw_sellers:
        sellers.append(Seller(seller['quantity'],seller['bidPrice']))
    print(discriminatory_kda(buyers,sellers))
    buyers_result,sellers_result=discriminatory_kda(buyers,sellers)
    print(buyers_result,sellers_result)
    # buyers_result = [obj.to_dict() for obj in buyers_result]
    # sellers_result = [obj.to_dict() for obj in sellers_result]
    # data['buyers'],data['sellers'] = json.dumps({"results": buyers_result}),json.dumps({"results": sellers_result})
    for buyer in buyers_result:
        buyer.transaction=[ob.__dict__ for ob in buyer.transaction]
    for seller in sellers_result:
        seller.transaction=[ob.__dict__ for ob in seller.transaction]
    return json.dumps({"buyers":[ob.__dict__ for ob in buyers_result],"sellers":[ob.__dict__ for ob in sellers_result]})

@app.route('/uniKDA', methods=['POST'])
def uniKDA():
    data = json.loads(request.get_data())
    raw_buyers = data['buyers']
    raw_sellers = data['sellers']
    buyers=[];sellers=[]
    for buyer in raw_buyers:
        buyers.append(Buyer(buyer['quantity'],buyer['bidPrice']))
    for seller in raw_sellers:
        sellers.append(Seller(seller['quantity'],seller['bidPrice']))
    buyers_result,sellers_result=uniform_kda(buyers,sellers)
    print(buyers_result,sellers_result)
    for buyer in buyers_result:
        buyer.transaction=json.dumps([ob.__dict__ for ob in buyer.transaction])
    for seller in sellers_result:
        seller.transaction=json.dumps([ob.__dict__ for ob in seller.transaction])
    data['buyers'],data['sellers'] = json.dumps([ob.__dict__ for ob in buyers_result]),json.dumps([ob.__dict__ for ob in sellers_result])
    return data

@app.route('/weightedAvg', methods=['POST'])
def weightedAvg():
    data = json.loads(request.get_data())
    raw_buyers = data['buyers']
    raw_sellers = data['sellers']
    buyers=[];sellers=[]
    for buyer in raw_buyers:
        buyers.append(Buyer(buyer['quantity'],buyer['bidPrice']))
    for seller in raw_sellers:
        sellers.append(Seller(seller['quantity'],seller['bidPrice']))
    buyers_result,sellers_result=weighted_avg(buyers,sellers)
    print(buyers_result,sellers_result)
    for buyer in buyers_result:
        buyer.transaction=json.dumps([ob.__dict__ for ob in buyer.transaction])
    for seller in sellers_result:
        seller.transaction=json.dumps([ob.__dict__ for ob in seller.transaction])
    data['buyers'],data['sellers'] = json.dumps([ob.__dict__ for ob in buyers_result]),json.dumps([ob.__dict__ for ob in sellers_result])
    return data

if __name__ == '__main__':
    app.run()

