import pandas as pd
from sqlalchemy import create_engine
import pymysql

class ETL:

    def __init__(self):
        self.fabricSqlEngine = create_engine('mysql+pymysql://root:password@localhost:3306/fabric')
        self.analyticsSqlEngine = create_engine('mysql+pymysql://root:password@localhost:3306/Analytics')

    def loadUserDim(self):
        with self.fabricSqlEngine.connect() as fabricDbConnection, self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = pd.read_sql('SELECT id userId, name, organization FROM user', fabricDbConnection)
            frame.to_sql('User_Dim', con = analyticsDbConnection, if_exists = 'append', index = False)
