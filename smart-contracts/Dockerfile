FROM python:3
WORKDIR /home/smartcontract
COPY . .
RUN ./install.sh
CMD [ "flask", "run", "--host 0.0.0.0" ]