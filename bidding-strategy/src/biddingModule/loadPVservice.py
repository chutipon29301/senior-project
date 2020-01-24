import pandas as pd
import numpy as np
from biddingModule.mode_dto import Mode
class StaticDataService:
    def __init__(self):
        self.df=pd.read_csv('/home/bidding-strategy/data/data.csv')
        self.num_round=len(self.df.index)
        pass
    
    def splitTrainTest(self,factor=0.8):
        if(factor<1 and factor>0):
            index = int(factor*self.num_round)
            train_df = self.df.loc[:index].reset_index()
            test_df = self.df.loc[index:].reset_index()
        return train_df, test_df