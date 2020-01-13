FROM python:3.7
WORKDIR /home/bidding-strategy
COPY . .
RUN ./install.sh
CMD [ "flask", "run", "--host 0.0.0.0" ]