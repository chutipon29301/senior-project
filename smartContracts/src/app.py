from flask import Flask, request
from flask_json import FlaskJSON, JsonError, json_response, as_json
import urllib.parse
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'hello, World!'

@app.route('/', methods=['POST'])
def test():
    # We use 'force' to skip mimetype checking to have shorter curl command.
    queryStr = request.get_json(force=True)
    # try:
    data=urllib.parse.parse_qsl(queryStr)
    print(data)
    value = int(data['value'])
    print(value)
    # except (KeyError, TypeError, ValueError):
    #     raise JsonError(description='Invalid value.')
    # return json_response(value=value+1)
    return value


if __name__ == '__main__':
    app.run()

