import pandas as pd
import numpy as np
import gym
from stable_baselines import A2C,DQN
from stable_baselines.common.policies import MlpPolicy
from stable_baselines.common.vec_env import DummyVecEnv

import sys, os
sys.path.append('/workspace/bidding-strategy/src')

from biddingModule.environments import SingleAgentTrainingEnv
from biddingModule.agents import UniformRandomAgent, GymRLAgent
from biddingModule.info_settings import OfferInformationSetting
from biddingModule.engine import MarketEngine


fixed_agents = [
    UniformRandomAgent('seller', 90),
    UniformRandomAgent('seller', 90),
    UniformRandomAgent('seller', 90),
    UniformRandomAgent('seller', 90),
    UniformRandomAgent('seller', 90),
    UniformRandomAgent('buyer', 110),
    UniformRandomAgent('buyer', 110),
    UniformRandomAgent('buyer', 110),
    UniformRandomAgent('buyer', 110),
    UniformRandomAgent('buyer', 110),
]

rl_agent = GymRLAgent('buyer', 110, discretization=20)
setting = OfferInformationSetting(5)

def get_env(rl_agent, fixed_agents, setting):
    return SingleAgentTrainingEnv(rl_agent, fixed_agents, setting)

env = DummyVecEnv([lambda: get_env(rl_agent, fixed_agents, setting)]) # wrap it for baselines

model = DQN("MlpPolicy", env, verbose=1, learning_rate=0.05)

model.learn(total_timesteps=10000)
rl_agent.model = model
def get_reward(agent, deals):
    if not agent.name in deals:
        return 0

    deal_price = deals[agent.name]
    if agent.role == 'buyer':
        return agent.reservation_price - deal_price
    else:
        return deal_price - agent.reservation_price

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
    ids = set(buyer_ids + seller_ids)
    market = MarketEngine(buyer_ids, seller_ids, max_steps=max_steps)
    
    rewards = pd.DataFrame(0, index=np.arange(n_games), columns=ids)
    for game_idx in range(n_games):
        while market.done != ids:
            observations = setting.get_states(ids, market)
            unmatched_agents = [
                agent for agent in agents
                if agent.name not in market.done
            ]
            offers = {
                agent.name: agent.get_offer(observations[agent.name])
                for agent in unmatched_agents
            }
            deals = market.step(offers)
            for agent in unmatched_agents:
                rewards[agent.name][game_idx] = get_reward(agent, deals)
        market.reset()
    return rewards
print(play_games(fixed_agents + [rl_agent], setting, 10))
print(play_games(fixed_agents + [rl_agent], setting, 100).describe())
rl_seller = GymRLAgent('seller', 90, model=model, name='myseller')
print(play_games(fixed_agents + [rl_seller], setting, 100).describe())
