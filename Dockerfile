# Felt & Fortune: a dependency-free Python server. The database lives on a mounted volume at /data.
# Stage 1 bundles the front end (one JS and one CSS file); stage 2 is the Python app.
FROM node:22-slim AS bundle
WORKDIR /app
COPY public ./public
COPY scripts/bundle.mjs ./scripts/bundle.mjs
RUN npm install --no-save esbuild@0.24 && node scripts/bundle.mjs

FROM python:3.13-slim
WORKDIR /app
COPY *.py ./
COPY public ./public
COPY --from=bundle /app/public/dist ./public/dist
ENV HOST=0.0.0.0 PORT=8080 DATABASE_PATH=/data/felt-and-fortune.sqlite3 COOKIE_SECURE=1 FF_BUNDLE=1 PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "server.py"]
