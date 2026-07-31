FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt requirements-test.txt ./
RUN pip install --no-cache-dir -r requirements-test.txt

COPY . .

EXPOSE 2500

CMD ["python", "-m", "flask", "run", "--host", "0.0.0.0", "--port", "2500"]
