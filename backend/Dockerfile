FROM python:alpine

WORKDIR /app

COPY pyproject.toml ./

RUN pip install .

COPY . .

EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]