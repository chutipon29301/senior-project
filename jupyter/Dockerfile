FROM jupyter/scipy-notebook
USER root
RUN sudo apt-get update && sudo apt-get install -y cmake libopenmpi-dev python3-dev zlib1g-dev && sudo apt-get install rsync
USER jovyan
COPY ./requirements.txt . 
RUN pip install --requirement requirements.txt
RUN pip install stable-baselines 
