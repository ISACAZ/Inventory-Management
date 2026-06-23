You are helping integrate a React frontend with a FastAPI backend for a Laboratory Inventory Management System. The project is a single monorepo with frontend in `src/` and backend in `app/`.

## Current State
- **Backend**: Fully built FastAPI + SQLAlchemy + MySQL with JWT auth, running at port 8000
- **Frontend**: Fully built React 19 UI with TanStack Query, react-router-dom v6, Tailwind CSS — but uses ONLY mock data from `src/data/mockData.js` (no API calls at all)
- **Goal**: Replace ALL mock data with real API calls while preserving the exact same UI

## Backend API (all under `/api`)

### Auth
- `POST /api/auth/login` — body: `{email, password}` → response: `{access_token, token_type, user: {id, email, full_name, role, is_active, created_at}}`
- `POST /api/auth/token` — OAuth2 form login (for Swagger, NOT for frontend)
- JWT: HS256, 24h expiry, sent as `Authorization: Bearer <token>`
- Auth dep: `get_current_user` extracts user from JWT; `require_admin` checks admin role

### Users
- `GET /api/users` — list users (admin only), response: `UserOut[]`
- `POST /api/users` — create user (admin only), body: `{email, password, full_name?, role?}` → `UserOut`
- `GET /api/users/{id}` — single user (admin or self)
- `UserOut`: `{id, email, full_name, role, is_active, created_at}`

### Items
- `GET /api/items?skip=0&limit=100&category=&location_id=` — list items, response: `ItemOut[]`
- `POST /api/items` — create (admin), body: `ItemCreate`
- `GET /api/items/{id}` — single item
- `PUT /api/items/{id}` — update (admin), body: `ItemUpdate`
- `DELETE /api/items/{id}` — soft delete (admin), returns 204
- `ItemOut`: `{id, name, description?, category?, total_quantity, available_quantity, low_stock_threshold, location_id?, is_active, created_at}`
- `ItemCreate`: `{name, description?, category?, total_quantity, low_stock_threshold?, location_id?}`
- `ItemUpdate`: all fields optional

### Locations
- `GET /api/locations?skip=0&limit=100` — list locations, response: `LocationOut[]`
- `POST /api/locations` — create (admin), body: `{name, description?}`
- `GET /api/locations/{id}` — single location
- `GET /api/locations/{id}/items` — items at location, response: `ItemOut[]`
- `LocationOut`: `{id, name, description?, is_active, created_at}`

### Borrow/Return
- `POST /api/borrow` — borrow items, body: `{item_id, quantity?, note?}`, response: `BorrowOut`
- `POST /api/return` — return items, body: `{borrow_id, note?}`, response: `BorrowOut`
- `GET /api/transactions?skip=0&limit=100&user_id=&item_id=&status_filter=` — list transactions, response: `BorrowOut[]`
- `BorrowOut`: `{id, user_id, item_id, quantity, status (borrowed|returned), borrowed_at, returned_at?, note?}`

### Stats (admin only)
- `GET /api/stats/summary` → `{total_items, total_users, active_borrows, low_stock_items}`
- `GET /api/stats/item-usage?limit=10` → `{item_id, name, borrow_count, total_quantity_borrowed}[]`
- `GET /api/stats/stock-movement?days=30` → `{date, borrowed, returned}[]`
- `GET /api/stats/low-stock` → `{item_id, name, available_quantity, low_stock_threshold}[]`

### Error Format
All errors return `{"detail": "message"}` with appropriate HTTP status codes (401, 403, 404, 422, 500).

---

## Frontend Architecture

### Stack
- React 19, react-router-dom v6, TanStack Query v5, sonner (toasts), framer-motion, recharts, lucide-react
- Vite dev server (no proxy configured yet — configure in vite.config.js or .env)

### Routes (14 pages)
| Route | Page | Auth Required |
|-------|------|---------------|
| `/login` | Login | No |
| `/` | Dashboard | Yes |
| `/inventory` | Inventory (list) | Yes |
| `/inventory/:id` | ItemDetail | Yes |
| `/borrow` | BorrowReturn | Yes |
| `/qr-scanner` | QrScanner | Yes |
| `/locations` | Locations | Yes |
| `/analytics` | Analytics | Yes |
| `/maintenance` | Maintenance | Yes |
| `/recommendations` | Recommendations | Yes |
| `/leaderboard` | Leaderboard | Yes |
| `/reports` | Reports | Yes |
| `/admin` | Admin | Yes |
| `/settings` | Settings | Yes |

### Auth (useAuth.jsx)
Currently uses mock data + localStorage. Needs to be replaced to:
- Call `POST /api/auth/login` with email/password
- Store JWT in localStorage (as `lab_token`)
- Store user object in localStorage (as `lab_currentUser`)
- Auto-attach JWT to all requests via `Authorization: Bearer <token>`
- Provide `login(email, password)`, `logout()`, `currentUser`, `isAuthenticated`
- On page load, check for stored token, verify it's valid by fetching `GET /api/users/me` (or decode JWT)

### What Each Page Needs from the API

**Login.jsx**: Replace mock login with real `POST /api/auth/login`. Remove demo account list or make it dynamic.

**Dashboard.jsx**: Replace these mock imports with API calls:
- `stats` → `GET /api/stats/summary` (use total_items, total_users, active_borrows, low_stock_items)
- `transactions` → `GET /api/transactions?limit=10` (recent activity)
- `lowStockItems` → `GET /api/stats/low-stock`
- `categoryDistribution` → calculate from items or remove (no backend endpoint yet)
- `monthlyBorrowStats` → `GET /api/stats/stock-movement?days=365` (group by month)
- `popularEquipment` → `GET /api/stats/item-usage?limit=10`
- `upcomingReturns`, `announcements`, `maintenanceRecords` — no backend, drop or keep static

**Inventory.jsx**: Replace:
- `items` → `GET /api/items?skip=0&limit=100`
- `categories` → derive unique categories from items response
- `locationsList` → `GET /api/locations`
- `statuses`, `conditions` — keep as static if no backend
- Search/filter/sort/pagination all done client-side (or eventually server-side via query params)

**ItemDetail.jsx**: Replace:
- `items.find(i => i.id === id)` → `GET /api/items/{id}`
- `transactions` → `GET /api/transactions?item_id={id}`
- `locations` → `GET /api/locations`
- `getMaintenanceHistory`, `getBorrowHistory`, `getRelatedItems`, `getRecommendations` — drop if no backend endpoints

**BorrowReturn.jsx**: Replace:
- Borrow form → `POST /api/borrow` with `{item_id, quantity, note}`
- Return form → `POST /api/return` with `{borrow_id, note}`
- `transactions` → `GET /api/transactions?user_id={currentUser.id}`
- `items` → `GET /api/items?skip=0&limit=100`

**Locations.jsx**: Replace:
- `locations` → `GET /api/locations` (note: mock has parentId tree, backend is flat with no parent — adapt tree building or add parent_id to backend)
- `inventoryItems` → `GET /api/locations/{id}/items`

**Analytics.jsx** (admin page): Replace:
- `monthlyBorrowStats` → `GET /api/stats/stock-movement`
- `categoryDistribution` → derive from items or drop
- `departmentUsage` — no backend, drop
- `popularItems` → `GET /api/stats/item-usage`
- `items` → `GET /api/items`

**Admin.jsx**: Replace:
- `stats` → `GET /api/stats/summary`
- `users` → `GET /api/users`
- `items` → `GET /api/items`

**Reports.jsx, Maintenance.jsx, Recommendations.jsx, Leaderboard.jsx, Settings.jsx, QrScanner.jsx**: These use mock data with no direct backend equivalents. Either keep static or remove features.

---

## Implementation Plan

### Phase 1: Foundation
1. Create `.env` file with `VITE_API_URL=http://localhost:8000`
2. Configure Vite proxy in `vite.config.js` to forward `/api` to `http://localhost:8000`
3. Create `src/lib/apiClient.js` — fetch wrapper with:
   - Base URL from env
   - Auto-attach Authorization header from localStorage
   - JSON content-type
   - Error handling (parse `{"detail": "..."}` errors, throw for 401/403/404/422/500)
4. Create service files in `src/services/`:
   - `authService.js` — `login(email, password)`, `getMe()`
   - `itemService.js` — `listItems(params)`, `getItem(id)`, `createItem(data)`, `updateItem(id, data)`, `deleteItem(id)`
   - `locationService.js` — `listLocations()`, `getLocation(id)`, `getLocationItems(id)`
   - `borrowService.js` — `borrow(data)`, `return_(data)`, `listTransactions(params)`
   - `statsService.js` — `getSummary()`, `getItemUsage(limit)`, `getStockMovement(days)`, `getLowStock()`
5. Rewrite `useAuth.jsx` to:
   - Replace `login(userId)` with `login(email, password)` that calls authService
   - Store `access_token` and `user` in localStorage
   - On mount, restore from localStorage
   - Expose `token` for use in apiClient

### Phase 2: Replace Mock Data Per Page
For each page, replace direct `import { ... } from "../data/mockData"` with TanStack Query `useQuery` hooks calling the service functions. Keep the same data shapes — map API response fields to whatever the UI expects.

For example in Dashboard:
```jsx
const { data: summary } = useQuery({ queryKey: ['stats-summary'], queryFn: statsService.getSummary })
const { data: recentTransactions } = useQuery({ queryKey: ['transactions', { limit: 10 }], queryFn: () => borrowService.listTransactions({ limit: 10 }) })
