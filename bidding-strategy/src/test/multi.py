import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

import warnings
warnings.filterwarnings('ignore')

import sys, os
sys.path.append('/workspace/bidding-strategy/src')

from biddingStrategy.environments import MultiAgentTrainingEnv
from biddingStrategy.info_settings import OfferInformationSetting, TimeInformationWrapper
from biddingStrategy.agents import GymRLAgent, TimeLinearAgent

from ray.rllib.env.multi_agent_env import MultiAgentEnv

from gym.spaces import Box, Discrete
class MultiWrapper(MultiAgentTrainingEnv, MultiAgentEnv):
    def __init__(self, env_config):
        super().__init__(**env_config)
rl_agents = [
    GymRLAgent('seller', 90, 'S1', max_factor=0.25, discretization=20),
    GymRLAgent('buyer', 110, 'B1', max_factor=0.25, discretization=20),
]
fixed_agents = [
    TimeLinearAgent('buyer', 110, 'TB1', noise=0., max_steps=6),
    TimeLinearAgent('seller', 90, 'TS3', noise=0., max_steps=20),
]
setting = TimeInformationWrapper(OfferInformationSetting(1))
env = MultiAgentTrainingEnv(rl_agents, fixed_agents, setting) # Just for convenience
my_policy = (None, env.observation_space, Discrete(20), {}) 
# None means this policy needs to be learned.
# Note: The action space should match that of the GymRLAgent defined earlier

def select_policy(agent_id):
    """This function maps the agent id to the policy id"""
    return agent_id

# We name our policies the same as our RL agents
policies = {
    'S1': my_policy,
    'B1': my_policy,
}
from ray.rllib.agents import dqn

trainer = dqn.DQNTrainer(env=MultiWrapper, config={
    "env_config": {"rl_agents": rl_agents, "fixed_agents": fixed_agents, "setting": setting},
    "timesteps_per_iteration": 30,
    "multiagent": {
        "policies": policies,
        "policy_mapping_fn": select_policy
    },
    "log_level": "ERROR",
})
rewards = []
episodes = []
episode_len = []

for i in range(250):
    result = trainer.train()
    # append data, each of them is a single dictionary
    rewards.append(result['policy_reward_mean'])
    episodes.append(result['episodes_total'])
    episode_len.append(result['episode_len_mean'])

rew_df = pd.DataFrame(rewards, index=episodes)
rew_df.index.name = 'Episodes'
rew_df.plot()

plt.ylabel("Mean reward")

plt.figure()
len_df = pd.Series(episode_len, index=episodes)
len_df.index.name = 'Episodes'
len_df.plot()
_ = plt.ylabel("Mean episode length")