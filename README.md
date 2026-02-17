# Real-Time Task Collaboration Platform

A full-stack Trello-like task management application with real-time collaboration features.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT
- **Board Management**: Create, update, delete boards
- **List Management**: Organize tasks in customizable lists
- **Task Management**: Full CRUD operations on tasks
- **Drag & Drop**: Move tasks between lists seamlessly
- **Real-Time Updates**: See changes instantly via WebSockets
- **Activity History**: Track all board activities
- **Search & Pagination**: Find tasks quickly
- **User Assignment**: Assign team members to tasks
- **Multi-User Collaboration**: Work together in real-time

## 📋 Prerequisites

- **Node.js** v16.0.0 or higher
- **PostgreSQL** v12.0 or higher
- **npm** v7.0.0 or higher

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HintroAssessment
```

### 2. Database Setup

#### Install PostgreSQL (if not installed)

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taskcollab;

# Exit
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env file with your database credentials
# DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/taskcollab

# Run migrations
npm run migrate

# Start backend server
npm run dev
```

Backend will run on **http://localhost:5000**

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend will run on **http://localhost:3000**

## 🔐 Demo Credentials

Create a new account using the signup form:

**Test Account 1:**
- Email: alice@example.com
- Password: password123
- Name: Alice Johnson

**Test Account 2:**
- Email: bob@example.com
- Password: password123
- Name: Bob Smith

## 📚 Project Structure

```
HintroAssessment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Database connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # Authentication logic
│   │   │   ├── boardController.js    # Board operations
│   │   │   ├── listController.js     # List operations
│   │   │   ├── taskController.js     # Task operations
│   │   │   └── activityController.js # Activity logs
│   │   ├── database/
│   │   │   ├── schema.sql            # Database schema
│   │   │   └── migrate.js            # Migration script
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT authentication
│   │   ├── models/
│   │   │   ├── user.js               # User model
│   │   │   ├── board.js              # Board model
│   │   │   ├── list.js               # List model
│   │   │   ├── task.js               # Task model
│   │   │   └── activity.js           # Activity model
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Auth endpoints
│   │   │   ├── boardRoutes.js        # Board endpoints
│   │   │   ├── listRoutes.js         # List endpoints
│   │   │   ├── taskRoutes.js         # Task endpoints
│   │   │   └── activityRoutes.js     # Activity endpoints
│   │   └── server.js                 # Express + Socket.io server
│   ├── .env                          # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── TaskCard.js           # Task card component
    │   │   ├── TaskModal.js          # Task details modal
    │   │   └── ActivityPanel.js      # Activity sidebar
    │   ├── context/
    │   │   ├── AuthContext.js        # Authentication state
    │   │   └── BoardContext.js       # Board state management
    │   ├── pages/
    │   │   ├── Login.js              # Login page
    │   │   ├── Signup.js             # Signup page
    │   │   ├── Boards.js             # Board list page
    │   │   └── Board.js              # Board detail page
    │   ├── services/
    │   │   ├── api.js                # REST API client
    │   │   └── socket.js             # WebSocket client
    │   ├── styles/
    │   │   ├── App.css               # Global styles
    │   │   ├── Auth.css              # Auth pages styles
    │   │   ├── Boards.css            # Boards page styles
    │   │   └── Board.css             # Board page styles
    │   ├── App.js                    # Main app component
    │   └── index.js                  # Entry point
    └── package.json
```

## 🏗️ Architecture

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

**Architecture Pattern**: MVC (Model-View-Controller)

**Layers:**
1. **Routes**: API endpoint definitions
2. **Controllers**: Business logic and request handling
3. **Models**: Data access layer (SQL queries)
4. **Middleware**: Authentication, error handling
5. **WebSocket**: Real-time event handling

**Key Features:**
- Parameterized SQL queries (SQL injection protection)
- Asynchronous JWT verification (non-blocking)
- Connection pooling for database
- CORS enabled for cross-origin requests
- Environment-based configuration

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Drag & Drop**: React Beautiful DnD

**Architecture Pattern**: Component-Based with Context

**State Management:**
1. **AuthContext**: User authentication state
2. **BoardContext**: Board, list, and task state

**Component Hierarchy:**
```
App
├── AuthProvider
│   └── BoardProvider
│       ├── Login
│       ├── Signup
│       ├── Boards
│       │   └── BoardCard[]
│       └── Board
│           ├── List[]
│           │   └── TaskCard[]
│           ├── TaskModal
│           └── ActivityPanel
```

### Database Schema

**Tables:**

1. **users**
   - id (PK)
   - email (unique)
   - password_hash
   - name
   - created_at

2. **boards**
   - id (PK)
   - name
   - owner_id (FK → users)
   - created_at
   - updated_at

3. **board_members**
   - id (PK)
   - board_id (FK → boards)
   - user_id (FK → users)
   - role
   - created_at

4. **lists**
   - id (PK)
   - board_id (FK → boards)
   - name
   - position
   - created_at

5. **tasks**
   - id (PK)
   - list_id (FK → lists)
   - title
   - description
   - position
   - created_at
   - updated_at

6. **task_assignments**
   - id (PK)
   - task_id (FK → tasks)
   - user_id (FK → users)
   - created_at

7. **activity_logs**
   - id (PK)
   - board_id (FK → boards)
   - user_id (FK → users)
   - action
   - entity_type
   - entity_id
   - details
   - created_at

**Indexes:**
- users(email)
- boards(owner_id)
- board_members(board_id, user_id)
- lists(board_id)
- tasks(list_id, title)
- task_assignments(task_id, user_id)
- activity_logs(board_id, created_at)

### Real-Time Sync Strategy

**WebSocket Implementation:**

1. **Connection**: Client connects with JWT token
2. **Room-Based**: Users join board-specific rooms
3. **Events**: Broadcast changes to all room members
4. **Optimistic Updates**: UI updates before server confirmation
5. **Event Reconciliation**: Server broadcasts canonical state

**Socket Events:**
- `join:board` - Join board room
- `leave:board` - Leave board room
- `board:updated` - Board name changed
- `list:created` - New list added
- `list:updated` - List modified
- `list:deleted` - List removed
- `task:created` - New task added
- `task:updated` - Task modified (including moves)
- `task:deleted` - Task removed
- `task:assigned` - User assigned to task
- `task:unassigned` - User removed from task
- `board:member_added` - Member added to board
- `board:member_removed` - Member removed from board

## 📡 API Documentation

### Authentication

#### POST /api/auth/signup
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-02-15T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-02-15T10:00:00.000Z"
}
```

### Boards

#### GET /api/boards
Get all boards for current user.

**Query Parameters:**
- `limit` (optional): Number of boards per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Project Board",
    "owner_id": 1,
    "owner_name": "John Doe",
    "created_at": "2026-02-15T10:00:00.000Z",
    "updated_at": "2026-02-15T10:00:00.000Z"
  }
]
```

#### POST /api/boards
Create a new board.

**Request:**
```json
{
  "name": "New Board"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "New Board",
  "owner_id": 1,
  "created_at": "2026-02-15T10:00:00.000Z",
  "updated_at": "2026-02-15T10:00:00.000Z"
}
```

#### GET /api/boards/:id
Get board details with members.

**Response:**
```json
{
  "id": 1,
  "name": "Project Board",
  "owner_id": 1,
  "owner_name": "John Doe",
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "owner"
    }
  ]
}
```

#### PUT /api/boards/:id
Update board name.

**Request:**
```json
{
  "name": "Updated Board Name"
}
```

#### DELETE /api/boards/:id
Delete a board (owner only).

#### POST /api/boards/:id/members
Add member to board.

**Request:**
```json
{
  "userId": 2,
  "role": "member"
}
```

#### DELETE /api/boards/:boardId/members/:userId
Remove member from board.

### Lists

#### GET /api/lists/:boardId/lists
Get all lists in a board.

**Response:**
```json
[
  {
    "id": 1,
    "board_id": 1,
    "name": "To Do",
    "position": 0,
    "created_at": "2026-02-15T10:00:00.000Z"
  }
]
```

#### POST /api/lists/:boardId/lists
Create a new list.

**Request:**
```json
{
  "name": "In Progress",
  "position": 1
}
```

#### PUT /api/lists/:id
Update list.

**Request:**
```json
{
  "name": "Done",
  "position": 2
}
```

#### DELETE /api/lists/:id
Delete a list.

### Tasks

#### POST /api/tasks/:listId/tasks
Create a new task.

**Request:**
```json
{
  "title": "Implement feature",
  "description": "Add drag and drop",
  "position": 0
}
```

**Response:**
```json
{
  "id": 1,
  "list_id": 1,
  "title": "Implement feature",
  "description": "Add drag and drop",
  "position": 0,
  "created_at": "2026-02-15T10:00:00.000Z",
  "updated_at": "2026-02-15T10:00:00.000Z"
}
```

#### GET /api/tasks/:id
Get task details with assignments.

**Response:**
```json
{
  "id": 1,
  "list_id": 1,
  "title": "Implement feature",
  "description": "Add drag and drop",
  "position": 0,
  "assignments": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

#### PUT /api/tasks/:id
Update task (including moving between lists).

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "listId": 2,
  "position": 1
}
```

#### DELETE /api/tasks/:id
Delete a task.

#### POST /api/tasks/:taskId/assign
Assign user to task.

**Request:**
```json
{
  "userId": 2
}
```

#### DELETE /api/tasks/:taskId/assign/:userId
Unassign user from task.

#### GET /api/tasks/search/:boardId
Search tasks in a board.

**Query Parameters:**
- `q`: Search query
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "list_id": 1,
    "title": "Matching task",
    "description": "Description with search term",
    "list_name": "To Do",
    "board_id": 1
  }
]
```

### Activities

#### GET /api/activities/:boardId
Get activity history for a board.

**Query Parameters:**
- `limit` (optional): Activities per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "board_id": 1,
    "user_id": 1,
    "user_name": "John Doe",
    "action": "created",
    "entity_type": "task",
    "entity_id": 1,
    "details": "Created task 'Implement feature'",
    "created_at": "2026-02-15T10:00:00.000Z"
  }
]
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Restricted origins
- **Input Validation**: Server-side validation
- **Access Control**: Board membership verification

## 📈 Scalability Considerations

### Current Architecture
- RESTful API design for horizontal scaling
- Database connection pooling
- Indexed database queries
- Stateless authentication (JWT)
- Room-based WebSocket isolation

### Future Improvements
1. **Caching**: Redis for session management and frequently accessed data
2. **Load Balancing**: Multiple backend instances behind load balancer
3. **Database**: 
   - Read replicas for query scaling
   - Sharding by board_id for write scaling
4. **WebSocket**: Sticky sessions or Redis adapter for multi-server support
5. **CDN**: Static asset delivery
6. **Message Queue**: RabbitMQ/Kafka for async tasks
7. **Microservices**: Split auth, boards, and notifications into separate services
8. **File Storage**: S3 for attachments
9. **Search**: Elasticsearch for advanced search
10. **Monitoring**: Application performance monitoring (APM)

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Quick Deploy to Render (Recommended)

This application is configured for **one-click deployment** to Render using Blueprint:

1. **Push code to GitHub**
2. **Connect to Render** and select "New Blueprint"
3. **All services deploy automatically** (backend, frontend, database)

🎯 **For complete step-by-step instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

The deployment includes:
- ✅ Backend API with Socket.io (WebSocket support)
- ✅ Frontend static site with optimized build
- ✅ PostgreSQL database with automatic migrations
- ✅ Environment variables configured automatically
- ✅ CORS and security configured for production

### Manual Deployment

#### Backend Deployment

**Environment Variables:**
```
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret>
PORT=5000
NODE_ENV=production
FRONTEND_URL=<frontend-production-url>
```

**Build & Start:**
```bash
npm install --production
npm run migrate  # Run database migrations
npm start
```

#### Frontend Deployment

**Environment Variables:**
```
REACT_APP_API_URL=<backend-production-url>
REACT_APP_WS_URL=<backend-production-url>
```

**Build:**
```bash
npm run build
```

Deploy the `build` folder to any static hosting service (Netlify, Vercel, AWS S3, etc.)

## 🐛 Troubleshooting

### Database Connection Issues

If you see `ECONNREFUSED` error:
1. Ensure PostgreSQL is running: `pg_ctl status`
2. Check database exists: `psql -U postgres -l`
3. Verify credentials in `.env` file
4. Check PostgreSQL is listening on port 5432

### Port Already in Use

If port 5000 or 3000 is busy:
```bash
# Backend: Change PORT in backend/.env
# Frontend: Set PORT environment variable
PORT=3001 npm start
```

### WebSocket Connection Issues

1. Ensure backend is running
2. Check CORS configuration
3. Verify token is being sent in socket connection

## 📝 Assumptions & Trade-offs

### Assumptions
1. Single database instance sufficient for MVP
2. All users in same timezone (UTC)
3. Board size limited to reasonable number of lists/tasks
4. No file attachment support in MVP
5. English-only interface

### Trade-offs
1. **Context API vs Redux**: Chose Context API for simplicity; Redux better for larger apps
2. **PostgreSQL vs MongoDB**: PostgreSQL for ACID guarantees and relations
3. **REST vs GraphQL**: REST for simplicity; GraphQL better for complex queries
4. **Inline CSS vs Styled Components**: Plain CSS for simplicity and performance
5. **Socket.io vs WebRTC**: Socket.io for easier implementation; WebRTC for p2p

## 👥 Contributors

- Your Name - Full Stack Development

## 📄 License

MIT License
