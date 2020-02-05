import pandas as pd
import numpy as np
import time
from biddingModule.environments import SingleAgentTrainingEnv
from biddingModule.agents import UniformRandomAgent, GymRLAgent
from biddingModule.info_settings import OfferInformationSetting
from biddingModule.engine import MarketEngine
from biddingModule.modeDTO import Mode

from stable_baselines import A2C, DQN, SAC, PPO2, TD3
from stable_baselines.common.policies import *
from stable_baselines.common.vec_env import DummyVecEnv

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
    UniformRandomAgent('buyer', 5, name='CHAM5'),
]

# rl_agent = GymRLAgent('seller', 1.68, discretization=20,name='CHAM2-PV')
rl_agent = GymRLAgent('buyer', 5, discretization=20,name='CHAM3')
setting = OfferInformationSetting(5,mode=Mode.TRAIN)
# setting = OfferInformationSetting(5,0.6,mode=Mode.TEST) #set data train/test/all

def get_env(rl_agent, fixed_agents, setting):
    return SingleAgentTrainingEnv(rl_agent, fixed_agents, setting)
env=get_env(rl_agent, fixed_agents, setting)
dummy_env = DummyVecEnv([lambda: env]) # wrap it for baselines

model = DQN("MlpPolicy", dummy_env, verbose=1, learning_rate=0.05)
# model = DQN("LnMlpPolicy", dummy_env, verbose=1, learning_rate=0.05)

start=time.time()
model.learn(total_timesteps=setting.num_round)
model.save("./model/buyer3_DQN_Mlp_full_disKDA")
# ===========================================================
print((time.time()-start)/60, " mins")