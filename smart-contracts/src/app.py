from flask import Flask, request,jsonify,json
from flask_json import FlaskJSON, JsonError, json_response, as_json
import urllib.parse
from SmartContracts.main import *
from controller import *

app = Flask(__name__)

k=0.5

@app.route('/')
def hello_world():
    return 'hello, World!'

@app.route('/', methods=['POST'])
def test():
    data = json.loads(request.get_data())
    data['value'] = 'this has been altered...GOOD!'
    return data

@app.route('/disKDA', methods=['POST'])
def disKDA()->str:
    data = json.loads(request.get_data())
    buyers,sellers,utilities = getUsers(**data)
    buyers_result,sellers_result = dis_kda(k,buyers,sellers,utilities)
    res = getResult(buyers_result,sellers_result)
    return json.dumps(res.__dict__)
    
@app.route('/uniKDA', methods=['POST'])
def uniKDA()->str:
    data = json.loads(request.get_data())
    buyers,sellers,utilities = getUsers(**data)
    buyers_result,sellers_result = uni_kda(k,buyers,sellers,utilities)
    res = getResult(buyers_result,sellers_result)
    return json.dumps(res.__dict__)

@app.route('/weightedAvg', methods=['POST'])
def weightedAvg()->str:
    data = json.loads(request.get_data())
    buyers,sellers,utilities = getUsers(**data)
    buyers_result,sellers_result = weighted_avg(buyers,sellers,utilities)
    res = getResult(buyers_result,sellers_result)
    return json.dumps(res.__dict__)


if __name__ == '__main__':
    app.run()

