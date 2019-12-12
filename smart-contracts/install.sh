#!/bin/bash
if [[ -n "$1" ]]; then
pip install $1
pip freeze > requirements.txt
else
pip install --requirement requirements.txt
fi;