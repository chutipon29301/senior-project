
from flask import Flask, request, jsonify, json
from flask_json import FlaskJSON, JsonError, json_response, as_json
import pandas as pd
from datetime import datetime, timedelta
import dateutil.parser
app = Flask(__name__)

df = pd.read_csv('/home/smartmeter/data/1yr_solarPV_bld.csv',
                 sep=',', parse_dates=['Time'])

@app.route('/ping')
def hello_world():
    return 'pong'


@app.route('/quantity', methods=['POST'])
def getQuantity():
    data = json.loads(request.get_data())
    time = dateutil.parser.parse(data['timestamp'])

    df = self.df
    
    next_hr=time + timedelta(hours=1)
    filter_date_df=df[(df['Time'].dt.day==next_hr.day)&(df['Time'].dt.month==next_hr.month)]

    filter_date_df.set_index('Time',inplace=True)
    quantity_row = (filter_date_df.between_time(time.time(),next_hr.time()))
    json_obj=quantity_row.to_dict(orient='records')

    return json_obj
