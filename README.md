# TaskFlow

A collaborative task and workflow management platform built with React, Node.js, Express, MongoDB, and Socket.io. Built as a learning project to go beyond basic CRUD and work with real-time systems, workspace-based access control, and scalable React architecture.

---

## What it does

TaskFlow lets small teams organize work across shared workspaces. Each workspace has its own task board with drag-and-drop columns, activity tracking, and live updates via WebSockets. Users can create and join workspaces through invite codes, assign tasks to members, set priorities and due dates, and filter/search their board.

It's not trying to be Notion or Linear — it's a focused productivity tool with a practical, dense UI designed for actual use rather than marketing screenshots.

---

## Tech stack

**Frontend**
- React 18 + Vite
- Zustand (state management)
- TanStack Query (server state + caching)
- React Hook Form
- @hello-pangea/dnd (drag-and-drop)
- Tailwind CSS
- Socket.io-client
- Framer Motion (modal animations only)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.io
- express-validator
- express-rate-limit
- bcryptjs

---

## Why these choices

**Zustand over Redux** — for a project this size, Redux adds boilerplate without meaningful benefit. Zustand gives a clean, minimal store with no providers needed. I used it for global auth state and workspace list since those are genuinely global. Everything else (tasks, activity) goes through TanStack Query since they're server state, not client state.

**TanStack Query over manual fetch/useEffect** — managing loading, error, and refetch logic manually gets messy quickly. React Query handles cache invalidation cleanly, which was important for keeping the board in sync after socket events trigger background refetches.

**MongoDB over PostgreSQL** — task data maps naturally to documents. Workspaces have embedded member subdocuments; tasks have tags as arrays. There aren't complex relational joins needed, so the document model fits well. The main tradeoff is that cross-workspace queries (like dashboard "all my tasks") require fanning out to multiple collections, which I handled with `Promise.all`.

**Socket.io over polling** — real-time task updates need low latency. Socket.io was straightforward to integrate and handles the room-based workspace isolation cleanly. I kept the implementation simple: emit on mutation, invalidate query on the client side, let React Query refetch rather than manually patching state.

**Tailwind CSS** — utility-first works well here because there are many small one-off layout decisions. The alternative (CSS Modules or styled-components) would have added indirection without much benefit for a single-developer project.

---

## Architecture

```
taskflow/
├── server/
│   ├── controllers/       # route handlers, one file per resource
│   ├── middleware/        # auth guard, error handler
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers
│   ├── services/          # activityService, socketService
│   └── utils/             # seed script
└── client/
    └── src/
        ├── api/           # axios instance + typed request functions
        ├── components/    # ui/, layout/, tasks/, workspace/, dashboard/
        ├── context/       # Zustand stores (auth, workspace)
        ├── hooks/         # useSocket, useTaskFilters
        ├── pages/         # one file per route
        └── utils/         # formatting helpers, status/priority metadata
```

The backend follows a controller → service pattern. Controllers handle HTTP request/response. The `activityService` is extracted because activity logging happens across multiple controllers — extracting it avoids duplication and lets activity failures degrade gracefully without crashing requests.

On the frontend, I separated concerns between Zustand (global client state: who's logged in, which workspaces exist) and React Query (server state that needs caching and background sync: tasks, activity, workspace details). This distinction matters — tasks on a board can change from other users' actions, so they should refetch. The auth state doesn't change behind your back.

Component organization is by feature rather than by type (no flat `components/` dumping ground). `components/tasks/` has everything task-related; `components/ui/` has generic primitives. Pages are thin orchestration layers.

---

## Database schemas

**User** — name, email, password (bcrypt), avatar, joinedWorkspaces[], lastLogin, timestamps

**Workspace** — name, description, owner (ref), members[] (user ref + role), inviteCode, themeColor, timestamps

**Task** — title, description, status, priority, dueDate, estimatedHours, tags[], assignedTo (ref), workspace (ref), createdBy (ref), order, timestamps

**Activity** — actor (ref), action, details, taskRef (ref, nullable), workspace (ref), timestamps

Tasks are indexed on `{workspace, status}`, `{workspace, assignedTo}`, and `{workspace, dueDate}` since those are the three main query patterns. Activity is indexed on `{workspace, createdAt: -1}` for the feed query.

---

## API

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Current user |
| PATCH | `/auth/profile` | Yes | Update name/avatar |
| PATCH | `/auth/password` | Yes | Change password |

### Workspaces

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/workspaces` | Yes | All user's workspaces |
| POST | `/workspaces` | Yes | Create workspace |
| POST | `/workspaces/join` | Yes | Join by invite code |
| GET | `/workspaces/:id` | Member | Get workspace + members |
| PATCH | `/workspaces/:id` | Admin | Update settings |
| POST | `/workspaces/:id/leave` | Member | Leave workspace |
| POST | `/workspaces/:id/invite/regenerate` | Admin | New invite code |

### Tasks (workspace-scoped)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/workspaces/:wsId/tasks` | Member | List tasks (filterable) |
| POST | `/workspaces/:wsId/tasks` | Member | Create task |
| POST | `/workspaces/:wsId/tasks/reorder` | Member | Bulk reorder |
| GET | `/workspaces/:wsId/tasks/:id` | Member | Task detail |
| PATCH | `/workspaces/:wsId/tasks/:id` | Member | Update task |
| DELETE | `/workspaces/:wsId/tasks/:id` | Member | Delete task |

**Task query params:** `status`, `priority`, `assignedTo`, `tag`, `search`, `sort` (newest | dueDate | priority)

### Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activity/:workspaceId` | Feed. Params: `limit`, `skip` |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/search?q=` | Search by name/email |
| GET | `/users/stats` | Task counts for current user |

---

## Real-time events (Socket.io)

Authentication: pass JWT in `socket.handshake.auth.token`.

**Client → Server**
- `workspace:join (workspaceId)` — subscribe to workspace room
- `workspace:leave (workspaceId)` — unsubscribe

**Server → Client**
- `task:created { task }` — new task created
- `task:updated { task }` — task modified
- `task:deleted { taskId }` — task removed
- `task:reordered { tasks }` — drag-and-drop reorder
- `workspace:member_joined { user }` — someone joined

On the client, socket events trigger React Query cache invalidation rather than manual state patching. This keeps server and client state in sync without complex merge logic.

---

## Local setup

**Requirements:** Node.js 18+, MongoDB (local or Atlas)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow

# install server deps
cd server && npm install

# install client deps
cd ../client && npm install
```

### 2. Configure environment

```bash
# in server/
cp .env.example .env
# edit MONGO_URI and JWT_SECRET

# in client/
cp .env.example .env
# VITE_API_URL and VITE_SOCKET_URL default to localhost
```

### 3. Seed the database (optional)

```bash
cd server
npm run seed
```

This creates 3 users, 1 workspace, 5 tasks, and activity entries. Login with `aman@example.com / password123`.

### 4. Run

```bash
# terminal 1 — backend
cd server && npm run dev

# terminal 2 — frontend
cd client && npm run dev
```

Frontend runs on http://localhost:5173. Backend on http://localhost:5000.

---

## Challenges

**Optimistic drag-and-drop sync** — when a task is dragged to a new column, I update the React Query cache immediately before the API call resolves. If the API fails, I roll back by invalidating the cache. Getting this right took a few iterations — the first approach patched the wrong query key because filter state was part of the key.

**Socket room isolation** — early on, socket events were broadcasting to all connected clients. The fix was straightforward (join workspace-scoped rooms), but it required restructuring how I attached `io` to the Express app. I ended up using `app.set('io', io)` so controllers can access it without a global import.

**Dashboard cross-workspace task query** — the "due today" widget needs tasks across all the user's workspaces. MongoDB doesn't make this trivial — I ended up fanning out with `Promise.all` across workspace IDs. It's not perfectly efficient but it's correct, and the dashboard caches for 30 seconds.

**Prop drilling vs global state** — workspace members need to be available in the task form, but the form is mounted deep in the workspace page. I avoided threading props four levels down by keeping workspace data in React Query and letting the task form query it directly via `workspaceId` from the URL param.

**Activity logging resilience** — activity writes happen inside every mutation. Rather than letting a failed log crash the whole request, `activityService.logActivity` catches its own errors and returns null. The trade-off is silent failures, but for a side-feature like logging, that's acceptable.

---

## What I'd do differently in V2

- **Refresh tokens** — current implementation uses 7-day JWTs with no refresh mechanism. A proper setup would use short-lived access tokens + httpOnly cookie refresh tokens.
- **Optimistic updates more broadly** — currently only drag-and-drop is optimistic. Task creation and edits still wait for the API response before updating the UI, which adds latency.
- **Role-based permissions in UI** — the backend enforces roles but the frontend doesn't conditionally render based on them (edit/delete buttons are visible to everyone). A proper permission hook would clean this up.
- **Pagination on the board** — for workspaces with 100+ tasks, loading everything at once doesn't scale. Virtualization or status-column pagination would be needed.
- **Test coverage** — there are no automated tests. For the backend, controller unit tests and route integration tests would catch regressions. For the frontend, component tests for the task form and board would be high value.

---

## Future scope

- File attachments on tasks (S3 or similar)
- Calendar view for due date visualization
- Notifications (in-app + email digest)
- Keyboard shortcuts for power users
- Dark/light theme toggle
- Mobile app (React Native, same API)
- AI task suggestions based on workspace context

---


