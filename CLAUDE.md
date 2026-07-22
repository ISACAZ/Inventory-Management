# CLAUDE.md — Laboratory Inventory Management

## Project context
Purpose : REST API for a Computer/EE lab inventory system
Client  : University / engineering lab

## Architecture rules

### Layer responsibilities (strict)
api/v1/*.py    → receive request, call service, return response. NO logic.
services/*.py  → all business rules, validation, orchestration
models/*.py    → SQLAlchemy ORM only, no logic
schemas/*.py   → Pydantic in/out shapes, no DB imports
core/          → auth, security, shared exceptions

### What to never do
- No DB queries inside api/ route handlers
- No raw SQL — use SQLAlchemy ORM
- No business logic inside Pydantic schemas
- Never commit .env (use .env.example)

## Code style
- Type hints everywhere (functions, returns, Pydantic fields)
- snake_case for variables/functions, PascalCase for classes
- Max function length: ~30 lines — split if longer
- One responsibility per function
- Explicit HTTP status codes on every endpoint
  (201 for create, 204 for delete, 422 already handled by Pydantic)

## Domain vocabulary
Use these exact names in code (align with DB teammate):

Equipment    — a physical lab item (oscilloscope, Arduino kit, etc.)
BorrowRecord — a checkout/return transaction
User         — lab member or admin
Category     — equipment type grouping
Location     — physical storage place (cabinet, shelf, room)
StockAlert   — triggered when quantity <= threshold

## API conventions
Base URL   : /api/
Auth header: Authorization: Bearer <token>
Errors     : always return {"detail": "message"} shape

Endpoints follow REST:
  GET    /items/          → list (with pagination ?skip=&limit=)
  POST   /items/          → create
  GET    /items/{id}      → single
  PATCH  /items/{id}      → partial update
  DELETE /items/{id}      → soft delete (set is_active=False, never hard delete)

================================================================================
# DATABASE
================================================================================

## Connection
- File: `app/database.py`
- Env var: `DATABASE_URL` (SQLite or PostgreSQL)
- Engine + SessionLocal created at import time
- `check_same_thread=False` only for SQLite

### Local dev (Docker Compose — PostgreSQL)
```
DATABASE_URL=postgresql://invent:invent@localhost:5432/invent
docker compose up -d         # start postgres + backend
docker compose logs backend  # check seed output
```

### Local dev (no Docker — SQLite)
```
DATABASE_URL=sqlite:///./data/invent.db
```

### Production (Render — PostgreSQL)
- Set `DATABASE_URL` in Render dashboard (Internal DB URL from Render PostgreSQL)
- Dockerfile does NOT read `.env` — Render injects env vars at runtime

## Schema (SQLAlchemy ORM)

### Table: `users`
| Column         | Type                  | Notes                          |
|----------------|-----------------------|--------------------------------|
| id             | Integer PK            | auto-increment                 |
| email          | String(255) UNIQUE    | indexed; login identifier      |
| password       | String(255) NULL      | NULL for Google OAuth users     |
| auth_provider  | String(20)            | "email" or "google"            |
| full_name      | String(255) NULL      | from Google profile if OAuth   |
| role           | Enum("admin","user")  | default "user"                 |
| is_active      | Boolean               | default True                   |
| created_at     | DateTime              | auto UTC                       |
| updated_at     | DateTime              | auto on update                 |

Relations:
- `user.borrow_records` → BorrowRecord[]
- `UserRoleEnum.admin` is granted via `ADMIN_EMAILS` env var on Google login

### Table: `items`
| Column              | Type               | Notes                          |
|---------------------|--------------------|--------------------------------|
| id                  | Integer PK         | auto-increment                 |
| name                | String(255)        | indexed; display name          |
| description         | String(1000) NULL  |                                |
| category            | String(100) NULL   | indexed                        |
| total_quantity      | Integer            | master stock count             |
| available_quantity  | Integer            | current shelf stock            |
| low_stock_threshold | Integer            | default 1; alert when <= this  |
| location_id         | Integer FK NULL    | → locations.id                 |
| is_active           | Boolean            | default True; soft delete flag |
| created_at          | DateTime           | auto UTC                       |
| updated_at          | DateTime           | auto on update                 |

Relations:
- `item.location` → Location
- `item.borrow_records` → BorrowRecord[]

### Table: `locations`
| Column      | Type           | Notes                      |
|-------------|----------------|----------------------------|
| id          | Integer PK     | auto-increment             |
| name        | String(255)    | UNIQUE, NOT NULL           |
| description | String(500)    | NULL                       |
| is_active   | Boolean        | default True               |
| created_at  | DateTime       | auto UTC                   |
| updated_at  | DateTime       | auto on update             |

Relations:
- `location.items` → Item[]

### Table: `borrow_records`
| Column      | Type                      | Notes                          |
|-------------|---------------------------|--------------------------------|
| id          | Integer PK                | auto-increment                 |
| user_id     | Integer FK                | → users.id, indexed            |
| item_id     | Integer FK                | → items.id, indexed            |
| quantity    | Integer                   | default 1                      |
| status      | Enum("borrowed","returned") | indexed; default "borrowed"  |
| borrowed_at | DateTime                  | auto UTC                       |
| returned_at | DateTime NULL             | set on return                  |
| note        | String(500) NULL          |                                |

Relations:
- `record.user` → User
- `record.item` → Item

### Enum values
```python
UserRoleEnum: admin | user
BorrowStatus: borrowed | returned
```

## Models location
- `app/models/__init__.py` — re-exports all models for `from app.models import *`
- `app/models/item.py`
- `app/models/user.py`
- `app/models/location.py`
- `app/models/borrow.py`

## Seed data
- File: `app/seed.py`
- CSV: `equipment.csv`
- Called from `app/main.py` lifespan after `Base.metadata.create_all()`
- Checks `Item.count() > 0` before inserting (idempotent)
- CSV columns mapped:
  - `Name` → `item.name`
  - `Description` → `item.description`
  - `Total Quantity` → `item.total_quantity`
  - `Quantity Available` → `item.available_quantity`
  - `Damaged Qty` and `Borrowed` → **ignored**
- 224 items total

## Migration / schema changes
- **No Alembic** — schema is created via `Base.metadata.create_all()` on startup
- To add a column: add field in model file, restart app → column auto-created (for new tables; existing tables need manual ALTER)
- Drop + recreate if model changes significantly:
  ```bash
  docker compose down -v    # WARNING: destroys data
  docker compose up -d
  ```
- For Render PostgreSQL: connect via psql or Render web shell to run ALTER TABLE

## Common DB operations

### Inspect current state
```bash
# Connect to PostgreSQL (local)
docker exec -it invent-postgres-1 psql -U invent -d invent

# Connect via Docker (local)
docker compose exec postgres psql -U invent -d invent

# List tables
\dt

# Describe table
\d+ items

# Count rows
SELECT count(*) FROM items;

# Sample data
SELECT id, name, total_quantity, available_quantity FROM items LIMIT 10;
```

### Reset database & re-seed
```bash
docker compose down -v
docker compose up -d
```

### Run seed manually
```python
# via shell
docker compose exec backend python -c "
from app.seed import seed_if_empty
seed_if_empty()
"
```

## Notes
- No Alembic — schema creation is on startup via `Base.metadata.create_all()`
- Soft deletes only: `is_active=False` on items, users, locations (never hard delete)
- Borrow records keep `status="returned"` for audit trail (never hard delete)
- `created_at` / `updated_at` use `datetime.now(timezone.utc)` via `_utcnow()` helper in each model file

================================================================================
