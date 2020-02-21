FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7
WORKDIR /home/forecast
COPY ./requirements.txt .
RUN pip install -r requirements.txt
CMD [ "uvicorn", "main:app"]