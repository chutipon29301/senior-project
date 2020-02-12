from datetime import datetime, timedelta
from fastapi import FastAPI, Query
import pandas as pd

df = pd.read_csv('/home/smartmeter/data/1yr_solarPV_bld.csv', sep = ',', parse_dates = ['Time'])

app = FastAPI()

@app.get('/ping')
async def ping():
    return {
        'msg': 'pong'
    }

@app.get('/smartmeter')
async def list_smartmeter_value(timestamp: datetime = Query(None)):
    if timestamp == None:
        return df.to_json(orient='records')
    else:
        next_hr = timestamp + timedelta(hours = 1)
        filter_date_df = df[(df['Time'].dt.day == next_hr.day) & (df['Time'].dt.month == next_hr.month)]
        filter_date_df.set_index('Time', inplace = True)
        quantity_row = filter_date_df.between_time(timestamp.time(), next_hr.time())
        quantity_dict = quantity_row.to_dict(orient = 'records')[0]
        return [{ 'id' : key, 'quantity' : value } for key, value in quantity_dict.items()]
        
