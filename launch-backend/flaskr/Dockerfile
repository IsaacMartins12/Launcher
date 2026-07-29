FROM python:3.12
EXPOSE 2500
WORKDIR /launch-backend
COPY requirements.txt /launch-backend
RUN pip install -r requirements.txt
COPY ./ /launch-backend
CMD ["flask", "run", "--host", "0.0.0.0", "--port", "2500"]