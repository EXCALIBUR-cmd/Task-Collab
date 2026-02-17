# Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USERS                                    │
│─────────────────────────────────────────────────────────────────────│
│ • id              INTEGER      PRIMARY KEY                          │
│ • email           VARCHAR(255) UNIQUE NOT NULL                      │
│ • password_hash   VARCHAR(255) NOT NULL                             │
│ • name            VARCHAR(255) NOT NULL                             │
│ • created_at      TIMESTAMP    DEFAULT NOW()                        │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ owns
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           BOARDS                                    │
│─────────────────────────────────────────────────────────────────────│
│ • id              INTEGER      PRIMARY KEY                          │
│ • name            VARCHAR(255) NOT NULL                             │
│ • owner_id        INTEGER      FK → users.id CASCADE                │
│ • created_at      TIMESTAMP    DEFAULT NOW()                        │
│ • updated_at      TIMESTAMP    DEFAULT NOW()                        │
└──────────────────────┬─────────────────┬────────────────────────────┘
                       │                 │
            has many   │                 │ has many
                       ▼                 ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│      BOARD_MEMBERS           │   │           LISTS              │
│──────────────────────────────│   │──────────────────────────────│
│ • id          INTEGER    PK  │   │ • id         INTEGER     PK  │
│ • board_id    INTEGER    FK  │   │ • board_id   INTEGER     FK  │
│ • user_id     INTEGER    FK  │   │ • name       VARCHAR(255)    │
│ • role        VARCHAR(50)    │   │ • position   INTEGER         │
│ • created_at  TIMESTAMP      │   │ • created_at TIMESTAMP       │
│                              │   └────────────┬─────────────────┘
│ UNIQUE(board_id, user_id)    │                │
└──────────────────────────────┘                │ has many
                                                 ▼
                                   ┌──────────────────────────────┐
                                   │           TASKS              │
                                   │──────────────────────────────│
                                   │ • id          INTEGER    PK  │
                                   │ • list_id     INTEGER    FK  │
                                   │ • title       VARCHAR(255)   │
                                   │ • description TEXT           │
                                   │ • position    INTEGER        │
                                   │ • created_at  TIMESTAMP      │
                                   │ • updated_at  TIMESTAMP      │
                                   └────────────┬─────────────────┘
                                                │
                                                │ has many
                                                ▼
                                   ┌──────────────────────────────┐
                                   │     TASK_ASSIGNMENTS         │
                                   │──────────────────────────────│
                                   │ • id         INTEGER     PK  │
                                   │ • task_id    INTEGER     FK  │
                                   │ • user_id    INTEGER     FK  │
                                   │ • created_at TIMESTAMP       │
                                   │                              │
                                   │ UNIQUE(task_id, user_id)     │
                                   └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       ACTIVITY_LOGS                                 │
│─────────────────────────────────────────────────────────────────────│
│ • id              INTEGER      PRIMARY KEY                          │
│ • board_id        INTEGER      FK → boards.id CASCADE               │
│ • user_id         INTEGER      FK → users.id SET NULL               │
│ • action          VARCHAR(100) NOT NULL                             │
│ • entity_type     VARCHAR(50)  NOT NULL                             │
│ • entity_id       INTEGER                                           │
│ • details         TEXT                                              │
│ • created_at      TIMESTAMP    DEFAULT NOW()                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Table Specifications

### Users Table

Stores user authentication and profile information.

| Column        | Type         | Constraints      | Description                    |
|---------------|--------------|------------------|--------------------------------|
| id            | SERIAL       | PRIMARY KEY      | Auto-incrementing user ID      |
| email         | VARCHAR(255) | UNIQUE, NOT NULL | User email (login)             |
| password_hash | VARCHAR(255) | NOT NULL         | Bcrypt hashed password         |
| name          | VARCHAR(255) | NOT NULL         | User display name              |
| created_at    | TIMESTAMP    | DEFAULT NOW()    | Account creation timestamp     |

**Indexes:**
- PRIMARY KEY on `id` (automatic)
- UNIQUE INDEX on `email` (for fast login lookup)

---

### Boards Table

Stores board information.

| Column     | Type         | Constraints      | Description                    |
|------------|--------------|------------------|--------------------------------|
| id         | SERIAL       | PRIMARY KEY      | Auto-incrementing board ID     |
| name       | VARCHAR(255) | NOT NULL         | Board name                     |
| owner_id   | INTEGER      | FK → users.id    | Board creator/owner            |
| created_at | TIMESTAMP    | DEFAULT NOW()    | Board creation timestamp       |
| updated_at | TIMESTAMP    | DEFAULT NOW()    | Last modification timestamp    |

**Foreign Keys:**
- `owner_id` REFERENCES `users(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `owner_id` (for user's boards query)

---

### Board_Members Table

Manages user access to boards (many-to-many relationship).

| Column     | Type        | Constraints          | Description                    |
|------------|-------------|----------------------|--------------------------------|
| id         | SERIAL      | PRIMARY KEY          | Auto-incrementing ID           |
| board_id   | INTEGER     | FK → boards.id       | Board reference                |
| user_id    | INTEGER     | FK → users.id        | User reference                 |
| role       | VARCHAR(50) | DEFAULT 'member'     | User role (owner/member)       |
| created_at | TIMESTAMP   | DEFAULT NOW()        | Membership creation timestamp  |

**Foreign Keys:**
- `board_id` REFERENCES `boards(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Constraints:**
- UNIQUE(`board_id`, `user_id`) - User can only be member once per board

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `board_id` (for board members query)
- INDEX on `user_id` (for user's boards query)

---

### Lists Table

Stores board columns/lists.

| Column     | Type         | Constraints      | Description                    |
|------------|--------------|------------------|--------------------------------|
| id         | SERIAL       | PRIMARY KEY      | Auto-incrementing list ID      |
| board_id   | INTEGER      | FK → boards.id   | Parent board                   |
| name       | VARCHAR(255) | NOT NULL         | List name                      |
| position   | INTEGER      | NOT NULL         | Display order (0, 1, 2, ...)   |
| created_at | TIMESTAMP    | DEFAULT NOW()    | List creation timestamp        |

**Foreign Keys:**
- `board_id` REFERENCES `boards(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `board_id` (for board's lists query)

---

### Tasks Table

Stores individual tasks/cards.

| Column      | Type         | Constraints      | Description                    |
|-------------|--------------|------------------|--------------------------------|
| id          | SERIAL       | PRIMARY KEY      | Auto-incrementing task ID      |
| list_id     | INTEGER      | FK → lists.id    | Parent list                    |
| title       | VARCHAR(255) | NOT NULL         | Task title                     |
| description | TEXT         |                  | Task description (optional)    |
| position    | INTEGER      | NOT NULL         | Order within list (0, 1, 2...) |
| created_at  | TIMESTAMP    | DEFAULT NOW()    | Task creation timestamp        |
| updated_at  | TIMESTAMP    | DEFAULT NOW()    | Last modification timestamp    |

**Foreign Keys:**
- `list_id` REFERENCES `lists(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `list_id` (for list's tasks query)
- INDEX on `title` (for task search)

---

### Task_Assignments Table

Manages user assignments to tasks (many-to-many).

| Column     | Type      | Constraints        | Description                    |
|------------|-----------|--------------------|--------------------------------|
| id         | SERIAL    | PRIMARY KEY        | Auto-incrementing ID           |
| task_id    | INTEGER   | FK → tasks.id      | Task reference                 |
| user_id    | INTEGER   | FK → users.id      | Assigned user                  |
| created_at | TIMESTAMP | DEFAULT NOW()      | Assignment timestamp           |

**Foreign Keys:**
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Constraints:**
- UNIQUE(`task_id`, `user_id`) - User assigned once per task

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `task_id` (for task's assignments)
- INDEX on `user_id` (for user's assigned tasks)

---

### Activity_Logs Table

Tracks all board activity for history/audit trail.

| Column      | Type         | Constraints           | Description                    |
|-------------|--------------|-----------------------|--------------------------------|
| id          | SERIAL       | PRIMARY KEY           | Auto-incrementing log ID       |
| board_id    | INTEGER      | FK → boards.id        | Related board                  |
| user_id     | INTEGER      | FK → users.id         | User who performed action      |
| action      | VARCHAR(100) | NOT NULL              | Action type (created/updated)  |
| entity_type | VARCHAR(50)  | NOT NULL              | Entity type (board/list/task)  |
| entity_id   | INTEGER      |                       | ID of affected entity          |
| details     | TEXT         |                       | Human-readable description     |
| created_at  | TIMESTAMP    | DEFAULT NOW()         | Activity timestamp             |

**Foreign Keys:**
- `board_id` REFERENCES `boards(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `board_id` (for board activity query)
- INDEX on `created_at DESC` (for recent activity)

---

## Relationships

### One-to-Many Relationships

1. **User → Boards**: One user owns many boards
   - `boards.owner_id` → `users.id`

2. **Board → Lists**: One board has many lists
   - `lists.board_id` → `boards.id`

3. **List → Tasks**: One list contains many tasks
   - `tasks.list_id` → `lists.id`

4. **Board → Activities**: One board has many activity logs
   - `activity_logs.board_id` → `boards.id`

### Many-to-Many Relationships

1. **Users ↔ Boards**: Many users can access many boards
   - Through `board_members` table
   - `board_members.user_id` → `users.id`
   - `board_members.board_id` → `boards.id`

2. **Users ↔ Tasks**: Many users can be assigned to many tasks
   - Through `task_assignments` table
   - `task_assignments.user_id` → `users.id`
   - `task_assignments.task_id` → `tasks.id`

---

## Common Queries

### Get user's boards
```sql
SELECT DISTINCT b.*, u.name as owner_name 
FROM boards b 
JOIN board_members bm ON b.id = bm.board_id 
JOIN users u ON b.owner_id = u.id
WHERE bm.user_id = ?
ORDER BY b.updated_at DESC;
```

### Get board with lists and tasks
```sql
-- Get board
SELECT * FROM boards WHERE id = ?;

-- Get lists
SELECT * FROM lists WHERE board_id = ? ORDER BY position;

-- Get tasks for each list
SELECT * FROM tasks WHERE list_id = ? ORDER BY position;
```

### Search tasks in board
```sql
SELECT t.*, l.name as list_name 
FROM tasks t 
JOIN lists l ON t.list_id = l.id 
WHERE l.board_id = ? 
  AND (t.title ILIKE ? OR t.description ILIKE ?)
ORDER BY t.updated_at DESC;
```

### Get board activity
```sql
SELECT a.*, u.name as user_name 
FROM activity_logs a 
LEFT JOIN users u ON a.user_id = u.id 
WHERE a.board_id = ?
ORDER BY a.created_at DESC 
LIMIT 50;
```

---

## Data Integrity

### CASCADE Rules

**ON DELETE CASCADE:**
- Deleting a user deletes their owned boards
- Deleting a board deletes all lists, members, and activities
- Deleting a list deletes all its tasks
- Deleting a task deletes all assignments

**ON DELETE SET NULL:**
- Deleting a user sets activity logs' user_id to NULL (preserve history)

### Constraints

**UNIQUE Constraints:**
- `users.email` - No duplicate emails
- (`board_members.board_id`, `board_members.user_id`) - User in board once
- (`task_assignments.task_id`, `task_assignments.user_id`) - User assigned once

**NOT NULL Constraints:**
- All essential fields (names, references, etc.)
- Prevents incomplete data

---

## Indexing Strategy

### Performance Indexes

1. **Foreign Key Indexes**: Fast JOIN operations
2. **Email Index**: Fast user lookup during login
3. **Title Index**: Full-text search on tasks
4. **Timestamp Index**: Recent activity queries

### Index Maintenance

- Automatic index updates on INSERT/UPDATE/DELETE
- PostgreSQL auto-vacuum keeps indexes optimized
- Monitor slow queries and add indexes as needed

---

## Sample Data Flow

### Creating a Task

1. Insert into `tasks` table
   ```sql
   INSERT INTO tasks (list_id, title, description, position)
   VALUES (1, 'New Task', 'Description', 0);
   ```

2. Insert activity log
   ```sql
   INSERT INTO activity_logs (board_id, user_id, action, entity_type, entity_id, details)
   VALUES (1, 1, 'created', 'task', 1, 'Created task "New Task"');
   ```

3. Optionally assign users
   ```sql
   INSERT INTO task_assignments (task_id, user_id)
   VALUES (1, 2);
   ```

### Moving a Task

1. Update task's list_id and position
   ```sql
   UPDATE tasks 
   SET list_id = 2, position = 1, updated_at = NOW()
   WHERE id = 1;
   ```

2. Log the move
   ```sql
   INSERT INTO activity_logs (board_id, user_id, action, entity_type, entity_id, details)
   VALUES (1, 1, 'moved', 'task', 1, 'Moved task to another list');
   ```

---

## Backup & Recovery

### Backup Strategy

```bash
# Full database backup
pg_dump taskcollab > backup_$(date +%Y%m%d).sql

# Backup specific tables
pg_dump -t users -t boards taskcollab > critical_tables.sql
```

### Restoration

```bash
# Restore from backup
psql taskcollab < backup_20260215.sql
```

---

## Database Migrations

### Initial Schema
- Create all tables in correct order (respecting foreign keys)
- Create all indexes
- Set up constraints

### Future Migrations
- Add new columns with ALTER TABLE
- Create new tables as needed
- Update indexes for performance
- Version control all schema changes
