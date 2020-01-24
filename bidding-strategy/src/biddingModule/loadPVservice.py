import pandas as pd
import numpy as np

class StaticDataService:
    def __init__(self):
        self.df=pd.read_csv('/home/bidding-strategy/data/data.csv')
        self.num_round=len(self.df.index)
        pass
    def getAgentQuantity(self,round,id,dataset='all'):
        if(dataset=='all'):
            hr_df=self.df.loc[round]
            quantity=hr_df[str(id)]
        if(dataset=='train'):
            hr_df=self.train_df.loc[round]
            quantity=hr_df[str(id)]
        if(dataset=='test'):
            hr_df=self.test_df.loc[round]
            quantity=hr_df[str(id)]
        return quantity
    
    def splitTrainTest(self,factor=0.8):
        if(factor<1 and factor>0):
            msk = np.random.rand(self.num_round) < factor
            self.train_df = self.df[msk]
            self.test_df = self.df[~msk]
        return len(self.train_df.index), len(self.test_df.index)