#!/bin/bash
sudo apt-get update && sudo apt-get install -y cmake libopenmpi-dev python3-dev zlib1g-dev
pip install --requirement requirements.txt
pip install stable-baselines 
pip install git+https://github.com/zhy0/dmarket_rl
pip install -r ./requirements.txt