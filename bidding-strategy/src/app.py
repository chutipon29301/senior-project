from flask import Flask, request,jsonify,json
from flask_json import FlaskJSON, JsonError, json_response, as_json
import urllib.parse
import datetime

import bidding

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'hello, World!'

if __name__ == '__main__':
    app.run()

