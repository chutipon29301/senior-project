#!/bin/bash
apt-get update && apt-get install -y cmake libopenmpi-dev python3-dev zlib1g-dev && apt-get install rsync
pip install --requirement requirements.txt
pip install stable-baselines 
if [[ -n "$1" ]]; then
pip install $1
pip freeze > requirements.txt
else
pip install --requirement requirements.txt
fi;