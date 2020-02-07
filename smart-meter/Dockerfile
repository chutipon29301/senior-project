FROM python:3
WORKDIR /home/smartmeter
COPY . .
RUN ./install.sh
CMD [ "uvicorn", "main:app"]