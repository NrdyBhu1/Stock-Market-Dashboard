FROM ghcr.io/astral-sh/uv:alpine

WORKDIR /app

COPY uv.lock pyproject.toml ./

RUN uv pip install .

COPY . .

CMD ["uvicorn", "main:app", "--port", "5000"]