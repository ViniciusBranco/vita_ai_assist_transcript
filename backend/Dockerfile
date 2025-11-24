FROM python:3.11-slim

WORKDIR /app

# Install poetry (cached layer)
RUN pip install --no-cache-dir poetry

# Configure poetry to not create a virtual environment inside the container
RUN poetry config virtualenvs.create false

# Copy ONLY dependency files first (for better caching)
COPY pyproject.toml poetry.lock* ./

# Install dependencies (this layer is cached unless pyproject.toml/poetry.lock change)
RUN poetry install --no-interaction --no-ansi --no-root

# Copy the rest of the application code (changes here won't trigger dependency reinstall)
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
