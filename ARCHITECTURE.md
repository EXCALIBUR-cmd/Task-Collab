# Architecture Documentation

## System Overview

The Task Collaboration Platform follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Tier                          │
│                      (React Frontend)                        │
│  - Component-based UI                                        │
│  - Context API for state management                          │
│  - Socket.io client for real-time updates                   │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTP/REST + WebSocket
┌───────────────────▼─────────────────────────────────────────┐
│                      Application Tier                        │
│                   (Node.js + Express)                        │
│  - RESTful API endpoints                                     │
│  - JWT authentication middleware                             │
│  - Socket.io server for real-time                           │
│  - Business logic in controllers                            │
└───────────────────┬─────────────────────────────────────────┘
                    │ SQL Queries
┌───────────────────▼─────────────────────────────────────────┐
│                        Data Tier                             │
│                      (PostgreSQL)                            │
│  - Relational database                                       │
│  - Indexed for performance                                   │
│  - ACID transactions                                         │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Routes Layer                         │
│  - Define API endpoints                                      │
│  - Map HTTP methods to controllers                          │
│  - Apply middleware (auth, validation)                      │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                      Controllers Layer                       │
│  - Request/response handling                                 │
│  - Input validation                                          │
│  - Business logic orchestration                             │
│  - Error handling                                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                        Models Layer                          │
│  - Database queries                                          │
│  - Data access logic                                         │
│  - SQL operations                                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                       Database Layer                         │
│  - PostgreSQL connection pool                                │
│  - Transaction management                                    │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client sends HTTP request** with JWT token
2. **CORS middleware** validates origin
3. **Auth middleware** verifies JWT token
4. **Route handler** receives request
5. **Controller** processes business logic
6. **Model** executes database queries
7. **Controller** formats response
8. **Response** sent back to client

### WebSocket Flow

1. **Client connects** with JWT token in handshake
2. **Socket middleware** verifies token asynchronously
3. **User joins board room** via `join:board` event
4. **User performs action** (create/update/delete)
5. **REST API** processes request
6. **Controller** emits socket event to room
7. **All clients in room** receive update
8. **UI updates** automatically

### Authentication Flow

```
┌──────────┐                           ┌──────────┐
│  Client  │                           │  Server  │
└─────┬────┘                           └────┬─────┘
      │                                     │
      │  POST /api/auth/signup              │
      │  { email, password, name }          │
      ├────────────────────────────────────>│
      │                                     │
      │                                     │ 1. Hash password
      │                                     │ 2. Store in DB
      │                                     │ 3. Generate JWT
      │                                     │
      │  { user, token }                    │
      │<────────────────────────────────────┤
      │                                     │
      │  Store token in localStorage        │
      │                                     │
      │  Subsequent requests:               │
      │  Authorization: Bearer <token>      │
      ├────────────────────────────────────>│
      │                                     │
      │                                     │ Verify JWT
      │                                     │ Extract userId
      │                                     │
      │  Protected resource data            │
      │<────────────────────────────────────┤
      │                                     │
```

## Frontend Architecture

### Component Architecture

```
App
├── AuthProvider (Context)
│   ├── State: user, isAuthenticated
│   ├── Actions: login, signup, logout
│   └── BoardProvider (Context)
│       ├── State: boards, currentBoard, lists, tasks
│       ├── Actions: CRUD operations
│       └── Components
│           ├── Login (Public)
│           ├── Signup (Public)
│           ├── Boards (Private)
│           │   └── BoardCard (Component)
│           └── Board (Private)
│               ├── List (Component)
│               │   └── TaskCard (Component)
│               ├── TaskModal (Component)
│               └── ActivityPanel (Component)
```

### State Management

**AuthContext:**
- Manages user authentication state
- Handles login/signup/logout
- Initializes WebSocket connection
- Provides auth state to entire app

**BoardContext:**
- Manages board, list, and task data
- Handles CRUD operations
- Listens to WebSocket events
- Updates state based on real-time events

### Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
Context Action
    │
    ├──> API Call (axios)
    │       │
    │       ▼
    │   Server Response
    │       │
    │       ▼
    │   Update Local State
    │
    └──> WebSocket Event
            │
            ▼
        Broadcast to Room
            │
            ▼
        All Clients Update
```

### Routing Strategy

```
/ (root)
├── /login (public)
├── /signup (public)
├── /boards (protected)
│   └── Redirects to /login if not authenticated
└── /board/:id (protected)
    └── Redirects to /login if not authenticated
```

## Database Architecture

### Schema Design

```
users                     boards                    lists
┌──────────┐             ┌──────────┐              ┌──────────┐
│ id (PK)  │             │ id (PK)  │              │ id (PK)  │
│ email    │             │ name     │              │ board_id │─┐
│ password │             │ owner_id │──┐           │ name     │ │
│ name     │             │ ...      │  │           │ position │ │
└──────────┘             └──────────┘  │           └──────────┘ │
                                       │                        │
board_members            ┌─────────────┘                        │
┌──────────┐            │                                       │
│ id (PK)  │            │              tasks                    │
│ board_id │────────────┘              ┌──────────┐            │
│ user_id  │───────┐                   │ id (PK)  │            │
│ role     │       │                   │ list_id  │────────────┘
└──────────┘       │                   │ title    │
                   │                   │ desc     │
task_assignments   │                   │ position │
┌──────────┐      │                   └──────────┘
│ id (PK)  │      │                        │
│ task_id  │──────┼────────────────────────┘
│ user_id  │──────┘
└──────────┘

activity_logs
┌──────────┐
│ id (PK)  │
│ board_id │
│ user_id  │
│ action   │
│ entity   │
│ details  │
└──────────┘
```

### Indexing Strategy

**Primary Indexes (Automatic):**
- All primary keys (id columns)

**Foreign Key Indexes:**
- `boards.owner_id` - Fast lookup of user's boards
- `board_members.board_id` - Fast board member queries
- `board_members.user_id` - Fast user membership queries
- `lists.board_id` - Fast list retrieval per board
- `tasks.list_id` - Fast task retrieval per list
- `task_assignments.task_id` - Fast assignment lookups
- `task_assignments.user_id` - Fast user task queries
- `activity_logs.board_id` - Fast activity retrieval

**Search Indexes:**
- `users.email` - Unique index for fast login
- `tasks.title` - Text search on task titles
- `activity_logs.created_at` - Time-based queries

**Composite Indexes:**
- `board_members(board_id, user_id)` - Unique constraint + fast lookups
- `task_assignments(task_id, user_id)` - Unique constraint + fast lookups

### Query Optimization

1. **Pagination**: Use LIMIT/OFFSET for large result sets
2. **Eager Loading**: JOIN users table to avoid N+1 queries
3. **Filtering**: WHERE clauses use indexed columns
4. **Sorting**: ORDER BY on indexed columns
5. **Connection Pooling**: Reuse database connections

## Real-Time Architecture

### WebSocket Room Design

```
Server
├── Room: board-1
│   ├── User Socket A
│   ├── User Socket B
│   └── User Socket C
├── Room: board-2
│   ├── User Socket A
│   └── User Socket D
└── Room: board-3
    └── User Socket E
```

### Event Broadcasting

```
User A creates task in board-1
    │
    ▼
POST /api/tasks/:listId/tasks
    │
    ▼
Task saved to database
    │
    ▼
Controller emits: io.to('board-1').emit('task:created', task)
    │
    ├──> User Socket A receives event
    ├──> User Socket B receives event
    └──> User Socket C receives event
    │
    ▼
All clients update their local state
```

### Optimistic Updates

1. User performs action (e.g., drag task)
2. UI updates immediately (optimistic)
3. API request sent to server
4. Server validates and saves
5. Server broadcasts to all clients
6. Clients reconcile with server state

### Conflict Resolution

- **Last Write Wins**: Server state is canonical
- **Client Reconciliation**: Clients update to latest server state
- **Automatic Sync**: No manual refresh needed
- **Event Ordering**: Events processed in order received

## Security Architecture

### Authentication Layer

```
Request
    │
    ▼
Extract JWT from Authorization header
    │
    ▼
Verify token signature
    │
    ├─> Invalid? → 401 Unauthorized
    │
    ▼ Valid
Extract userId from payload
    │
    ▼
Attach userId to request object
    │
    ▼
Continue to controller
```

### Authorization Layer

```
Request to access board
    │
    ▼
Check board_members table
    │
    ├─> User not member? → 403 Forbidden
    │
    ▼ User is member
Continue with operation
```

### Data Protection

1. **Passwords**: Hashed with bcrypt (10 rounds)
2. **Tokens**: Signed with HS256 algorithm
3. **SQL Injection**: Parameterized queries only
4. **XSS**: React auto-escapes output
5. **CORS**: Restricted to frontend origin

## Performance Optimization

### Backend Optimizations

1. **Connection Pooling**: Reuse DB connections
2. **Async Operations**: Non-blocking I/O
3. **Indexed Queries**: Fast data retrieval
4. **Pagination**: Limit result set sizes
5. **Compression**: gzip response compression

### Frontend Optimizations

1. **Code Splitting**: Lazy load routes
2. **Memoization**: Prevent unnecessary re-renders
3. **Virtual Scrolling**: For large lists (future)
4. **Debouncing**: Search input delays
5. **Optimistic UI**: Immediate feedback

### Database Optimizations

1. **Indexes**: On frequently queried columns
2. **Query Planning**: Efficient JOIN strategies
3. **Connection Limits**: Pool size configuration
4. **Vacuum**: Regular maintenance (PostgreSQL)

## Scalability Strategy

### Horizontal Scaling

```
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    Server 1         Server 2         Server 3
        │                │                │
        └────────────────┼────────────────┘
                         │
                    PostgreSQL
```

### Database Scaling

**Vertical Scaling (Initial):**
- Increase CPU/RAM
- Upgrade to faster storage (SSD)

**Horizontal Scaling (Future):**
- Read replicas for query distribution
- Sharding by board_id
- Caching layer (Redis)

### WebSocket Scaling

**Current**: Single server, in-memory rooms

**Future**: Redis adapter for multi-server
```
Server 1 ──┐
           ├──> Redis Pub/Sub
Server 2 ──┘
```

## Monitoring & Logging

### Application Logging

- Request/response logging
- Error logging with stack traces
- WebSocket connection events
- Database query logging (development)

### Metrics to Monitor

- **API Response Times**: Monitor endpoint performance
- **WebSocket Connections**: Active connection count
- **Database Queries**: Slow query detection
- **Error Rates**: Track failed requests
- **Memory Usage**: Detect leaks
- **CPU Usage**: Identify bottlenecks

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│              CDN (Static)               │
│         (Frontend Build Files)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Application Server              │
│      (Node.js + Express + Socket.io)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       PostgreSQL Database               │
│          (Managed Service)              │
└─────────────────────────────────────────┘
```

### CI/CD Pipeline

```
Code Push
    │
    ▼
Run Tests
    │
    ├─> Failed? → Notify developer
    │
    ▼ Passed
Build Application
    │
    ▼
Deploy to Staging
    │
    ▼
Run Integration Tests
    │
    ├─> Failed? → Rollback
    │
    ▼ Passed
Deploy to Production
    │
    ▼
Health Check
    │
    ├─> Failed? → Rollback
    │
    ▼ Success
Deployment Complete
```

## Technology Choices

### Backend: Node.js + Express

**Pros:**
- JavaScript full-stack
- Large ecosystem (npm)
- Excellent for I/O operations
- Great WebSocket support

**Cons:**
- Single-threaded (use clustering for CPU-intensive)
- Callback complexity (mitigated with async/await)

### Frontend: React

**Pros:**
- Component reusability
- Large community
- Rich ecosystem
- Virtual DOM performance

**Cons:**
- Frequent updates
- Boilerplate code

### Database: PostgreSQL

**Pros:**
- ACID compliance
- Complex queries support
- JSON support
- Excellent performance
- Open source

**Cons:**
- Vertical scaling limits
- Complex horizontal scaling

### Real-time: Socket.io

**Pros:**
- Automatic fallbacks
- Room support
- Simple API
- Cross-browser compatibility

**Cons:**
- Overhead vs raw WebSocket
- Sticky sessions needed for scaling
