# CLAUDE.md — Laboratory Inventory Management (Backend)

## Project context
Purpose : REST API for a Computer/EE lab inventory system
Client  : University / engineering lab
Your role: Backend only — DB schema owned by database teammate,
           frontend owned by React teammate

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

## Testing expectations
- Every service function has at least one test
- Use pytest + pytest-asyncio
- Mock the DB session in tests (don't hit real DB)
- Test happy path AND at least one error case per endpoint

## Working with Claude (AI assistant)
- Share code snippets, not full files unless asked
- Ask "review this like a senior dev" for feedback
- Say "guide me" if you want hints, "show me" if you're stuck
- Claude will ask what YOU think before giving answers