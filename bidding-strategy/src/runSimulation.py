import pandas as pd
import numpy as np
import time
from biddingModule.agents import UniformRandomAgent, GymRLAgent
from biddingModule.info_settings import OfferInformationSetting
from biddingModule.engine import MarketEngine
from biddingModule.modeDTO import Mode, Strategy

from tqdm import tqdm

from stable_baselines import A2C, DQN, PPO2
from stable_baselines.common.policies import *

fixed_agents = [
    UniformRandomAgent('seller', 1.68, name='CHAM1-PV'),
    UniformRandomAgent('seller', 1.68, name='CHAM2-PV'),
    UniformRandomAgent('seller', 1.68, name='CHAM3-PV'),
    UniformRandomAgent('seller', 1.68, name='CHAM4-PV'),
    UniformRandomAgent('seller', 1.68, name='CHAM5-PV'),
    UniformRandomAgent('buyer', 5, name='CHAM1'),
    UniformRandomAgent('buyer', 5, name='CHAM2'),
    UniformRandomAgent('buyer', 5, name='CHAM3'),
    UniformRandomAgent('buyer', 5, name='CHAM4'),
    UniformRandomAgent('buyer', 5, name='CHAM5')
]

rl_agents=[
    # GymRLAgent('seller', 1.68, discretization=20,name='CHAM5-PV'),
    # GymRLAgent('seller', 1.68, discretization=20,name='CHAM4-PV'),
    # GymRLAgent('seller', 1.68, discretization=20,name='CHAM3-PV'),
    # GymRLAgent('seller', 1.68, discretization=20,name='CHAM2-PV'),
    # GymRLAgent('seller', 1.68, discretization=20,name='CHAM1-PV'),
    # GymRLAgent('buyer', 5, discretization=20,name='CHAM1'),
    # GymRLAgent('buyer', 5, discretization=20,name='CHAM2'),
    # GymRLAgent('buyer', 5, discretization=20,name='CHAM3'),
    # GymRLAgent('buyer', 5, discretization=20,name='CHAM4'),
    # GymRLAgent('buyer', 5, discretization=20,name='CHAM5'),
]

setting = OfferInformationSetting(5, mode=Mode.TEST, strategy= Strategy.UNIKDA) #set data train/test/all

# model = PPO2.load("./model/ppo2/seller3_MlpLnLstm_disKDA")
# model = PPO2.load("./model/ppo2/buyer2_MlpLnLstm_disKDA")
model = DQN.load("./model/dqn/buyer5_Mlp_uniKDA")
# model = DQN.load("./model/dqn/seller2_LnMlp_disKDA")
for rl_agent in rl_agents:
    rl_agent.model = model

def get_reward(agent, deals, trade_quantity):
    if not agent.name in deals:
        return [0,0,0,0]
    deal_price = deals[agent.name]
    quantity_got=trade_quantity[agent.name]
    if(deal_price==0): reward=0
    sign = -1 if agent.role == 'buyer' else 1
     
    if(deal_price!=0): 
        print(agent.name,deal_price,agent.reservation_price,quantity_got)
        reward = (sign*(deal_price-agent.reservation_price))*quantity_got
    return [reward,deal_price,agent.reservation_price,quantity_got]

def play_games(agents, setting, n_games=100, max_steps=30):
    buyer_ids =  [
        agent.name
        for agent in agents
        if agent.role == 'buyer'
    ]
    seller_ids =  [
        agent.name
        for agent in agents
        if agent.role == 'seller'
    ]
    buyer_ids_deal =  [
        agent.name+"_deal"
        for agent in agents
        if agent.role == 'buyer'
    ]
    seller_ids_deal =  [
        agent.name+"_deal"
        for agent in agents
        if agent.role == 'seller'
    ]
    buyer_ids_resev =  [
        agent.name+"_resev"
        for agent in agents
        if agent.role == 'buyer'
    ]
    seller_ids_resev =  [
        agent.name+"_resev"
        for agent in agents
        if agent.role == 'seller'
    ]
    ids = set(buyer_ids+ seller_ids)
    # ids_info=set(buyer_ids_deal + seller_ids_deal+ buyer_ids_resev + seller_ids_resev)
    market = MarketEngine(buyer_ids, seller_ids, setting.strategy, max_steps=max_steps)
    
    rewards = pd.DataFrame(0, index=np.arange(n_games), columns=ids, dtype=float)
    # rewards = pd.DataFrame(0, index=np.arange(n_games), columns=ids.union(ids_info), dtype=float)
    for game_idx,i in zip(range(n_games),tqdm(range(n_games))):
        while market.done != ids:
            observations = setting.get_states(ids, market)
            # print(quantitiesTradeIn)
            unmatched_agents = [
                agent for agent in agents
                if agent.name not in market.done
            ]
            offers = {
                agent.name: {'price': agent.get_offer(observations[agent.name]), 'quantity': setting.getAgentQuantity(game_idx,agent.name)}
                for agent in unmatched_agents
            }
            deals,trade_quantity = market.step(offers)
            for agent in unmatched_agents:
                rewards[agent.name][game_idx] = get_reward(agent, deals, trade_quantity)[0]
                # rewards[agent.name+"_deal"][game_idx] = get_reward(agent, deals)[1]
                # rewards[agent.name+"_resev"][game_idx] = get_reward(agent, deals)[2]
        market.reset()
    return rewards.reindex(sorted(rewards.columns), axis=1)
start=time.time()
df=play_games(fixed_agents + rl_agents, setting, setting.num_round)
# with pd.option_context('display.max_rows', None, 'display.max_columns', None):  # more options can be specified also
print(df.describe())
print((time.time()-start)/60, " mins")