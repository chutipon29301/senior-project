from fastapi import FastAPI, Query
from LSTM import LSTM
from datetime import datetime

app = FastAPI() 

@app.get('/ping')
async def ping():
    return {
        'msg': 'pong'
    }

@app.get('/predict')
async def getLoadPrediction(timestamp: datetime = Query(None)):
    # Import/Insert your function here
    filename = 'MA_Boston_1hr.csv'
    lstm=LSTM()
    # lstm.read_data(filename)
    # lstm.load_model()
    # lstm.predict()
    # return  ex. [{ 'id' : key, 'quantity' : value } for key, value in quantity_dict.items()]
    return # 