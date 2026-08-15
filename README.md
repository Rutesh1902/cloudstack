# CloudStack

CloudStack is a privacy-first, self-hosted file storage API. It is the secure backend foundation for a future web drive and mobile photo-backup application.

## Included in this Phase 1 backend

- Account registration, access tokens, rotating refresh tokens, and logout
- Per-user private file trees using opaque IDs, never browser-supplied disk paths
- Folder creation, file upload, list, rename, move, download, trash, and restore
- Streamed uploads with SHA-256 checksums, file-size limits, and per-user quotas
- PostgreSQL metadata, local-disk storage abstraction, Docker Compose, and Alembic migrations

## Run locally with Docker

1. Copy `.env.example` to `.env` and set strong, unique `POSTGRES_PASSWORD` and `SECRET_KEY` values.
2. Set `HOST_STORAGE_PATH` to a folder on the disk that will hold your data. On Windows, for example: `HOST_STORAGE_PATH=C:/cloudstack-data`.
3. Start the service:

   ```powershell
   docker compose up --build
   ```

4. Open `http://localhost:1111/docs` to use the interactive API documentation.

The API container runs `alembic upgrade head` before serving traffic. Do not use `Base.metadata.create_all()` in production; all schema changes must be migrations.

## Main API endpoints

All file endpoints require `Authorization: Bearer <access_token>`.

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/files?parent_id=`
- `POST /api/v1/files/folders`
- `POST /api/v1/files/upload` (multipart: `parent_id`, `files`)
- `PATCH /api/v1/files/{node_id}`
- `DELETE /api/v1/files/{node_id}`
- `GET /api/v1/files/{node_id}/download`
- `GET /api/v1/files/trash/items`
- `POST /api/v1/files/{node_id}/restore`

## Before an internet-facing release

Put the service behind HTTPS (Caddy or a reverse proxy), restrict `CORS_ORIGINS` to the web application’s actual domain, configure backups to a second physical disk, and add rate limiting, sharing, background thumbnails, and resumable uploads. Never expose PostgreSQL directly to the internet.
