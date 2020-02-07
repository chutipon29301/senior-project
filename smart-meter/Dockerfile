FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7
RUN pip install pandas
WORKDIR /home/smartmeter
# COPY . .
# RUN ./install.sh
CMD [ "uvicorn", "main:app"]