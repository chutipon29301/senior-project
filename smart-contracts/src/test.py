
from SmartContracts.main import *
from controller import *
from pathlib import Path
import pandas as pd
from datetime import datetime

path = Path(__file__).parent / "data/bldCharacteristicData.csv"

df=pd.read_csv(path,parse_dates=True)
df=df.loc[df['Time'] == '2018-07-03 06:00:00']

for index,hr_df in df.iterrows():
	print(hr_df['Time'])
	buyer_name=['CHAM1','CHAM2','CHAM3','CHAM4','CHAM5']
	buyer_price=[3.9,3.2,4.7,3.8,3.3] #[4,3,2,1,5]
	buyer_q=[float(hr_df[name]) for name in buyer_name]
	seller_name=['CHAM1-PV','CHAM2-PV','CHAM3-PV','CHAM4-PV','CHAM5-PV']
	seller_price=[5.0,4.9,3.5,3.1,3.7] #[2,3,4,5,1]
	seller_q=[float(hr_df[name]) for name in seller_name]
	
	# buyers=[(0.0, 2.7579473224469613), (5.0, 2.7579473224469613), (5.0, 2.3575199826075472), (49.0, 2.3575199826075472), (49.0, 2.1126835628723453), (82.0, 2.1126835628723453), (82.0, 1.7295341188440012), (93.0, 1.7295341188440012), (93.0, 1.7044285715036822), (103.0, 1.7044285715036822), (103.0, 1.68)]
	# sellers=[(0.0, 2.887456972385678), (61.0, 2.887456972385678), (61.0, 3.09442462548661), (82.0, 3.09442462548661), (82.0, 3.4269259571539576), (152.0, 3.4269259571539576), (152.0, 4.077486008261394), (209.0, 4.077486008261394), (209.0, 4.311669215597835), (252.0, 4.311669215597835), (252.0, 5.0)]
	# buyers=[{'id':buyer_name[i],'quantity':buyers[i][0],'bidPrice':buyers[i][1],'timestamp':str(datetime.now().isoformat())} for i in range(len(buyer_name))]
	# sellers=[{'id':seller_name[j],'quantity':sellers[j][0],'bidPrice':sellers[j][1],'timestamp':str(datetime.now().isoformat())} for j in range(len(seller_name))]
	buyers=[{'id':buyer_name[i],'quantity':buyer_q[i],'bidPrice':buyer_price[i],'timestamp':str(datetime.now().isoformat())} for i in range(len(buyer_name))]
	sellers=[{'id':seller_name[j],'quantity':seller_q[j],'bidPrice':seller_price[j],'timestamp':str(datetime.now().isoformat())} for j in range(len(seller_name))]
	data = {"buyers":buyers,"sellers":sellers,"utilities":["utility"]}

	buyers, sellers, utilities = getUsers(**data)
	start=datetime.now()
	buyers_result, sellers_result = uni_kda(0.5, buyers, sellers, utilities)
	print(datetime.now()-start)
	res = getResult(buyers_result, sellers_result)
	json.dumps(res.__dict__)