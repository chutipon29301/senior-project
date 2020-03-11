import pandas as pd
import numpy as np
import os
from pathlib import Path

path = Path(__file__).parent / "data/bldCharacteristicData.csv"

class StaticDataService:
    def __init__(self):
        self.df=pd.read_csv(path,parse_dates=True)
        self.num_round=len(self.df.index)
        pass
    
    def splitTrainTest(self,factor=0.8):
        if(factor<1 and factor>0):
            index = int(factor*self.num_round)
            train_df = self.df.loc[:index].reset_index()
            test_df = self.df.loc[index:].reset_index()
            cols_of_interest = ['CHAM1-PV','CHAM2-PV','CHAM3-PV','CHAM4-PV','CHAM5-PV'] 
            print(len(test_df.index))
            test_df=test_df[(test_df[cols_of_interest] != 0).any(axis=1)].reset_index()
            print(len(test_df.index))
        return train_df, test_df