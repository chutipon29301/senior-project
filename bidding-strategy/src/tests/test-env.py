
from biddingModule.environments import SingleAgentTrainingEnv
from biddingModule.agents import UniformRandomAgent, GymRLAgent
from biddingModule.info_settings import OfferInformationSetting
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

env=SingleAgentTrainingEnv(rl_agent, fixed_agents, setting)
dummy_env = DummyVecEnv([lambda: env]) # wrap it for baselines
model = DQN("MlpPolicy", dummy_env, verbose=1, learning_rate=0.05)
# train_df,test_df=pvService.splitTrainTest()
model.learn(total_timesteps=env.num_round)#plugin # of available training time period
