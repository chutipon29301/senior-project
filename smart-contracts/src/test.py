
from SmartContracts.main import *
from controller import *
from pathlib import Path
import pandas as pd
from datetime import datetime

path = Path(__file__).parent / "data/bldCharacteristicData.csv"

df=pd.read_csv(path,parse_dates=True)
# df=df.loc[df['Time'] == '2018-07-01 09:00:00']
for index,hr_df in df.iterrows():
	print(hr_df['Time'])
	buyer_name=['CHAM1','CHAM2','CHAM3','CHAM4','CHAM5']
	buyer_price=[3.9,3.2,4.7,3.8,3.3] #[4,3,2,1,5]
	buyer_q=[float(hr_df[name]) for name in buyer_name]
	seller_name=['CHAM1-PV','CHAM2-PV','CHAM3-PV','CHAM4-PV','CHAM5-PV']
	seller_price=[5.0,4.9,3.5,3.1,3.7] #[2,3,4,5,1]
	seller_q=[float(hr_df[name]) for name in seller_name]
	buyers=[{'id':buyer_name[i],'quantity':buyer_q[i],'bidPrice':buyer_price[i],'timestamp':str(datetime.now().isoformat())} for i in range(len(buyer_name))]
	sellers=[{'id':seller_name[j],'quantity':seller_q[j],'bidPrice':seller_price[j],'timestamp':str(datetime.now().isoformat())} for j in range(len(seller_name))]
	data = {"buyers":buyers,"sellers":sellers,"utilities":["utility"]}

	buyers, sellers, utilities = getUsers(**data)
	start=datetime.now()
	buyers_result, sellers_result = uni_kda(0.5, buyers, sellers, utilities)
	print(datetime.now()-start)
	res = getResult(buyers_result, sellers_result)
	json.dumps(res.__dict__)