# Felt & Fortune: a dependency-free Python app. The database lives on a mounted volume at /data.
FROM python:3.13-slim
WORKDIR /app
COPY server.py engine.py coach.py practice_api.py ./
COPY public ./public
ENV HOST=0.0.0.0 PORT=8080 DATABASE_PATH=/data/felt-and-fortune.sqlite3 COOKIE_SECURE=1 PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "server.py"]
