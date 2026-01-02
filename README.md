# Pastebin-Lite

A lightweight Pastebin-like application built with Node.js and Redis.

## Features
- Create text pastes with optional TTL (Time-to-Live) and view limits.
- Shareable links to view pastes.
- API endpoints for programmatic usage.
- Deterministic time testing support for CI/CD.

## Persistence Layer
This application uses **Redis** for persistence. Redis was chosen for its high performance, native support for key-based expiration, and atomic operations (like `INCR`), which are ideal for handling view counts and TTLs in a serverless-friendly way.

## Running Locally

### Prerequisites
- Node.js (v18+)
- Redis instance (local or remote)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   PORT=3000
   REDIS_URL=redis://localhost:6379
   BASE_URL=http://localhost:3000
   TEST_MODE=1
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Design Decisions
- **Separation of Concerns**: Logic is divided into routes, controllers/services, and config modules.
- **Atomic Counters**: Used Redis `INCR` to manage `max_views` to prevent race conditions.
- **Deterministic Time**: Implemented via middleware that checks for `x-test-now-ms` header when `TEST_MODE` is enabled.
- **Serverless Ready**: Designed to work on platforms like Vercel with external Redis persistence (e.g., Upstash).

## API Routes
- `GET /api/healthz`: Health check.
- `POST /api/pastes`: Create a new paste.
- `GET /api/pastes/:id`: Retrieve paste metadata and content (counts as a view).
- `GET /p/:id`: View paste content as HTML.

## Deployed URL
[Live on Vercel](https://your-app.vercel.app) (Placeholder - Replace after deployment)
