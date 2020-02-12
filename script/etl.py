import pandas as pd
from sqlalchemy import create_engine
import pymysql
import pandas as pd

class ETL:

    def __init__(self):
        fabricSqlEngine = create_engine('mysql+pymysql://root:password@localhost:3306/fabric')
        self.fabricDbConnection = fabricSqlEngine.connect()
        analyticsSqlEngine = create_engine('mysql+pymysql://root:password@localhost:3306/Analytics')
        self.analyticsDbConnection = analyticsSqlEngine.connect()

    def loadUserDim(self):
        # Extract data from fabric.user table
        frame = pd.read_sql('SELECT * FROM user', self.fabricDbConnection)
        # Transform data by renaming column
        frame = frame.rename(columns = {'id': 'userId'})[['userId', 'name', 'organization']]
        # Load data into new database
        frame.to_sql('User_Dim', con = self.analyticsDbConnection, if_exists = 'append', index = False)
    
    def __del__(self):
        self.fabricDbConnection.close()
        self.analyticsDbConnection.close()
