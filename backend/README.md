# StackleVest Backend (Go)

This is the new backend service for StackleVest, handling Authentication and User Management.

## Prerequisites
- Go 1.21 or higher

## Setup

1.  **Install Dependencies**
    ```bash
    go mod tidy
    ```

2.  **Environment Variables**
    Create a `.env` file in this directory (optional, defaults provided in `internal/config`):
    ```env
    PORT=8080
    JWT_SECRET=stacklevest-secret-2025
    DB_PATH=../websocket-server/db.json
    ```

## Running the Server

```bash
go run cmd/server/main.go
```

The server will start on port `8080`.

## API Endpoints

-   `POST /api/login` - Authenticate user, returns JWT.
-   `GET /api/users` - List all users (Auth required).
-   `GET /api/users/:id` - Get user by ID (Auth required).

## Architecture

-   `cmd/server`: Entry point.
-   `internal/auth`: Authentication logic (JWT).
-   `internal/user`: User management logic.
-   `internal/storage`: Persistence (currently `db.json` compatible).
-   `internal/middleware`: Auth and RBAC middleware.
