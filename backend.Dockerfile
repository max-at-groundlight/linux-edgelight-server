FROM python:3.9-slim-bookworm
# FROM python:3.9-alpine

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
# COPY ./pi_requirements.txt /app/pi_requirements.txt

RUN pip3 install --no-cache-dir --upgrade -r /app/requirements.txt
RUN pip3 install opencv-python-headless

RUN pip install --index-url=https://www.piwheels.org/simple --no-cache-dir -r /app/requirements.txt
RUN pip install --no-deps groundlight
RUN pip install --no-deps framegrab
RUN pip install pypylon

COPY ./api /app/api

EXPOSE 8000

CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]