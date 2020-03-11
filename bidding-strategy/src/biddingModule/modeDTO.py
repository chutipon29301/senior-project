from enum import Enum
class Mode(Enum):
    ALL= 'all'
    TRAIN= 'train'
    TEST= 'test'
class Strategy(Enum):
    DISKDA= 'disKDA'
    WEIGHT_AVG= 'weightedAvg'
    UNIKDA= 'uniKDA'