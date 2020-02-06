import pandas as pd
import numpy as np
import time
from biddingModule.agents import UniformRandomAgent, GymRLAgent
from biddingModule.info_settings import OfferInformationSetting
from biddingModule.engine import MarketEngine
from biddingModule.modeDTO import Mode

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
    # UniformRandomAgent('buyer', 5, name='CHAM3'),
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
    GymRLAgent('buyer', 5, discretization=20,name='CHAM3'),
    # GymRLAgent('buyer', 5, discretization=20,name='CHAM4'),
    # GymRLAgent('buyer', 5, discretization=20,name='CHAM5'),
]

setting = OfferInformationSetting(5,mode=Mode.TEST) #set data train/test/all

model = DQN.load("./model/buyer3_DQN_LnMlp_full_disKDA")

# model = DQN.load("./model/buyer2_DQN_Mlp_full_disKDA")
# model = DQN.load("./model/buyer_DQN_Mlp_full_uniKDA")
# model = DQN.load("./model/buyer_DQN_LnMlp_full_uniKDA")
for rl_agent in rl_agents:
    rl_agent.model = model
def get_reward(agent, deals):
    if not agent.name in deals:
        return [0,0,0]
    deal_price = deals[agent.name]
    if(deal_price==0): reward=0
    if agent.role == 'buyer':
        if(deal_price!=0): reward = (agent.reservation_price - deal_price)
        return [reward,deal_price,agent.reservation_price]
    else:
        if(deal_price!=0):reward = (deal_price - agent.reservation_price)
        return [reward,deal_price,agent.reservation_price]

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
    market = MarketEngine(buyer_ids, seller_ids, max_steps=max_steps)
    
    rewards = pd.DataFrame(0, index=np.arange(n_games), columns=ids, dtype=float)
    # rewards = pd.DataFrame(0, index=np.arange(n_games), columns=ids.union(ids_info), dtype=float)
    for game_idx,i in zip(range(n_games),tqdm(range(n_games))):
        
        while market.done != ids:
            observations = setting.get_states(ids, market)
            unmatched_agents = [
                agent for agent in agents
                if agent.name not in market.done
            ]
            
            offers = {
                agent.name: {'price': agent.get_offer(observations[agent.name]), 'quantity': setting.getAgentQuantity(game_idx,agent.name)}
                for agent in unmatched_agents
            }
            deals = market.step(offers)
            for agent in unmatched_agents:
                rewards[agent.name][game_idx] = get_reward(agent, deals)[0]
                # rewards[agent.name+"_deal"][game_idx] = get_reward(agent, deals)[1]
                # rewards[agent.name+"_resev"][game_idx] = get_reward(agent, deals)[2]
        market.reset()
    return rewards.reindex(sorted(rewards.columns), axis=1)
start=time.time()
df=play_games(fixed_agents + rl_agents, setting, setting.num_round)
# [['CHAM3','CHAM3_deal','CHAM3_resev']]
# print(df.iloc[df['CHAM3'].idxmax()])
print(df.describe())
print((time.time()-start)/60, " mins")