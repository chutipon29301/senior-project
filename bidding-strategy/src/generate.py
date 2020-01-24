import pandas as pd
import numpy as np

from biddingModule.environments import SingleAgentTrainingEnv
from biddingModule.agents import UniformRandomAgent, GymRLAgent
from biddingModule.info_settings import OfferInformationSetting
from biddingModule.engine import MarketEngine

from stable_baselines import A2C, DQN
from stable_baselines.common.policies import *
from stable_baselines.common.vec_env import DummyVecEnv


fixed_agents = [
    UniformRandomAgent('seller', 3, name='CHAM1-PV'),
    UniformRandomAgent('seller', 3, name='CHAM2-PV'),
    UniformRandomAgent('seller', 3, name='CHAM3-PV'),
    UniformRandomAgent('seller', 3, name='CHAM4-PV'),
    UniformRandomAgent('seller', 3, name='CHAM5-PV'),
    UniformRandomAgent('buyer', 5, name='CHAM1'),
    UniformRandomAgent('buyer', 5, name='CHAM2'),
    UniformRandomAgent('buyer', 5, name='CHAM3'),
    UniformRandomAgent('buyer', 5, name='CHAM4'),
]

rl_agent = GymRLAgent('buyer', 5, discretization=20,name='CHAM5')
setting = OfferInformationSetting(5)

def get_env(rl_agent, fixed_agents, setting):
    return SingleAgentTrainingEnv(rl_agent, fixed_agents, setting)

env = DummyVecEnv([lambda: get_env(rl_agent, fixed_agents, setting)]) # wrap it for baselines
model = DQN("MlpPolicy", env, verbose=1, learning_rate=0.05)
model.learn(total_timesteps=10000)
# model.save("deepq_trading")
