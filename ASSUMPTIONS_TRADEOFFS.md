# Assumptions & Trade-offs

## Project Assumptions

### 1. User Base & Scale

**Assumptions:**
- Initial user base: Small to medium teams (10-100 users per board)
- Concurrent users per board: < 20 simultaneously
- Board size: < 50 lists, < 500 tasks per board
- Response time requirement: < 500ms for most operations
- Single region deployment initially

**Implications:**
- Single database instance sufficient
- No CDN required for initial launch
- In-memory WebSocket rooms acceptable
- No need for distributed caching initially

### 2. Data & Storage

**Assumptions:**
- Task descriptions: Plain text only (no rich text/markdown)
- No file attachments in MVP
- Activity log retention: Unlimited
- User data stored in single timezone (UTC)
- No data archival requirements initially

**Implications:**
- Simple TEXT column for descriptions
- No blob storage integration (S3/Azure)
- No log rotation needed initially
- Timezone conversions handled client-side
- Database grows linearly with usage

### 3. User Behavior

**Assumptions:**
- Users work primarily during business hours
- Board ownership rarely changes
- Task movements are the most frequent operation
- Users rarely delete boards (soft delete not required)
- Search is occasional, not real-time critical

**Implications:**
- No 24/7 high availability requirement
- Simple ownership model without transfer
- Optimized drag-and-drop performance
- Hard delete acceptable for cleanup
- Simple full-text search sufficient

### 4. Security & Compliance

**Assumptions:**
- No GDPR/HIPAA compliance required in MVP
- Password reset via email (not implemented)
- No 2FA requirement
- Single JWT secret acceptable
- No audit trail requirement beyond activity logs

**Implications:**
- Simpler authentication flow
- Manual password reset process
- Basic security sufficient for MVP
- No key rotation mechanism needed
- Activity logs serve audit purpose

### 5. Integration & Extensibility

**Assumptions:**
- No third-party integrations needed (Slack, GitHub, etc.)
- No API rate limiting required initially
- No webhooks for external services
- No import/export functionality needed
- No mobile app in MVP (web responsive)

**Implications:**
- Focused feature set
- Simpler API without rate limiting
- No event publishing infrastructure
- Manual data migration if needed
- Single responsive web interface

### 6. Development & Operations

**Assumptions:**
- Small development team (1-3 developers)
- Manual deployment acceptable
- Development and production on similar stacks
- Single environment initially (no staging)
- Manual testing + basic automated tests

**Implications:**
- Simple deployment process
- No complex CI/CD pipeline needed
- Consistent behavior across environments
- Lower infrastructure costs
- Focus on core features over testing

---

## Technical Trade-offs

### 1. REST vs GraphQL

**Chosen: REST**

**Pros:**
- ✅ Simpler to implement and understand
- ✅ Well-established patterns
- ✅ Easy caching with HTTP
- ✅ Smaller learning curve
- ✅ Predictable endpoints

**Cons:**
- ❌ Over-fetching/under-fetching data
- ❌ Multiple requests for related data
- ❌ Less flexible for clients
- ❌ No built-in schema documentation
- ❌ Versioning complexity with growth

**Why:**
For MVP with simple data requirements, REST provides clarity and speed of development. GraphQL would add complexity without significant benefit at current scale.

### 2. PostgreSQL vs MongoDB

**Chosen: PostgreSQL**

**Pros:**
- ✅ ACID compliance (data integrity)
- ✅ Strong relations (boards → lists → tasks)
- ✅ Mature indexing and query optimization
- ✅ JSON support for flexible data
- ✅ Excellent for transactional data

**Cons:**
- ❌ Vertical scaling limits
- ❌ More complex horizontal scaling
- ❌ Schema migrations required
- ❌ Less flexible than NoSQL

**Why:**
The relational nature of boards, lists, and tasks benefits from SQL enforced constraints. ACID guarantees are important for collaborative editing.

**MongoDB Alternative:**
- Would be better for: Flexible schemas, horizontal scaling, document-heavy features
- Trade-off: Lose relational integrity, manual denormalization

### 3. Context API vs Redux

**Chosen: Context API**

**Pros:**
- ✅ Built into React (no dependencies)
- ✅ Simpler to set up and understand
- ✅ Sufficient for medium complexity
- ✅ Less boilerplate code
- ✅ Good for authentication state

**Cons:**
- ❌ Can cause unnecessary re-renders
- ❌ Limited debugging tools
- ❌ No middleware system
- ❌ Less suited for complex state logic
- ❌ No time-travel debugging

**Why:**
For two main state domains (auth + boards), Context API reduces complexity. Redux would be overkill for MVP but should be considered if state management becomes complex.

**Redux Alternative:**
- Would be better for: Complex state, many async actions, time-travel debugging
- Trade-off: More setup, larger bundle, steeper learning curve

### 4. Socket.io vs Native WebSocket

**Chosen: Socket.io**

**Pros:**
- ✅ Automatic reconnection
- ✅ Fallback mechanisms
- ✅ Room/namespace support
- ✅ Cross-browser compatibility
- ✅ Middleware support

**Cons:**
- ❌ Larger bundle size (~40KB)
- ❌ Overhead vs raw WebSocket
- ❌ Sticky sessions for scaling
- ❌ Custom protocol (not standard WS)

**Why:**
Room support and automatic reconnection are critical for multi-board scenarios. The overhead is acceptable for better reliability.

**Native WebSocket Alternative:**
- Would be better for: Low latency requirements, minimal dependencies
- Trade-off: More manual reconnection logic, no room support

### 5. React Beautiful DnD vs React DnD

**Chosen: React Beautiful DnD**

**Pros:**
- ✅ Beautiful animations out of box
- ✅ Excellent mobile support
- ✅ Accessibility built-in
- ✅ Simpler API
- ✅ Better performance

**Cons:**
- ❌ Less flexible than React DnD
- ❌ Opinionated styling
- ❌ Limited to vertical/horizontal lists
- ❌ Maintenance status uncertain

**Why:**
Provides polished drag-and-drop experience with minimal configuration. Perfect for list-based layouts like Trello.

**React DnD Alternative:**
- Would be better for: Complex drag scenarios, custom animations, greater control
- Trade-off: More code, less polish by default

### 6. JWT vs Session-Based Auth

**Chosen: JWT**

**Pros:**
- ✅ Stateless (no server session storage)
- ✅ Scales horizontally easily
- ✅ Works well with microservices
- ✅ Can include user claims
- ✅ No database lookup per request

**Cons:**
- ❌ Cannot revoke easily
- ❌ Larger than session IDs
- ❌ No central logout
- ❌ Token refresh complexity
- ❌ Security risk if leaked

**Why:**
Simplifies scaling and reduces database load. Acceptable for MVP without token blacklisting.

**Session Alternative:**
- Would be better for: Easy revocation, smaller overhead, central control
- Trade-off: Requires session store (Redis), harder to scale

### 7. Inline CSS vs Styled Components

**Chosen: Plain CSS files**

**Pros:**
- ✅ No additional dependencies
- ✅ Familiar to all developers
- ✅ Easy to override
- ✅ Good for SSR (future)
- ✅ Better performance (no runtime)

**Cons:**
- ❌ Global namespace issues
- ❌ No automatic critical CSS
- ❌ Manual class management
- ❌ Less component encapsulation

**Why:**
Keeps bundle small and performance high. CSS-in-JS would add complexity and bundle size for MVP.

**Styled Components Alternative:**
- Would be better for: Component scoping, dynamic styles, theme management
- Trade-off: Larger bundle, runtime overhead, learning curve

### 8. Optimistic UI vs Pessimistic UI

**Chosen: Optimistic for drag-and-drop, pessimistic for CRUD**

**Pros:**
- ✅ Fast perceived performance for common actions
- ✅ Better UX for drag operations
- ✅ Safer for critical operations

**Cons:**
- ❌ Potential UI/server mismatch
- ❌ More complex error handling
- ❌ Need rollback logic

**Why:**
Drag-and-drop feels laggy with pessimistic updates. Other operations are infrequent enough that optimistic updates aren't critical.

### 9. Connection Pool Size

**Chosen: Default pg pool (10 connections)**

**Pros:**
- ✅ Sufficient for expected load
- ✅ Prevents database overload
- ✅ Good for single server

**Cons:**
- ❌ May need tuning under high load
- ❌ Not optimal for massive concurrency

**Why:**
10 connections handle 100+ requests/second comfortably with async I/O. Can be tuned based on monitoring.

### 10. Monorepo vs Multi-repo

**Chosen: Single repo with frontend/backend folders**

**Pros:**
- ✅ Easier to manage for small team
- ✅ Shared types/interfaces possible
- ✅ Single PR for full-stack features
- ✅ Simplified setup for new developers

**Cons:**
- ❌ Cannot version independently
- ❌ Larger repository size
- ❌ Mixed concerns in single repo

**Why:**
For MVP with small team, monorepo reduces overhead. Can split later if teams/deployment diverge.

---

## Known Limitations

### 1. Scalability Limits

**Current Architecture Limits:**
- **WebSocket**: Single server rooms (not distributed)
- **Database**: Single instance, vertical scaling only
- **No Caching**: Every request hits database
- **No CDN**: Static assets served from app server

**Impact:**
- Max ~1000 concurrent WebSocket connections
- Database bottleneck at ~5000 boards or ~100 concurrent writes/sec
- Slower response times for distant users

**Mitigation Path:**
- Add Redis for WebSocket scaling
- Add database read replicas
- Add Redis for query caching
- Use CDN for static assets (Cloudflare)

### 2. Real-time Limitations

**Current Implementation:**
- No conflict resolution for simultaneous edits
- Last write wins (no operational transforms)
- No offline support
- Disconnection requires manual refresh
- No event ordering guarantees

**Impact:**
- Potential data loss in race conditions
- Poor experience on unstable connections
- Can't work offline
- May see stale data after reconnect

**Mitigation Path:**
- Implement CRDT or OT for conflict resolution
- Add event sequence numbers
- Implement offline queue
- Add automatic reconnection with state sync

### 3. Search Limitations

**Current Implementation:**
- ILIKE pattern matching (slow on large datasets)
- No fuzzy search
- Case-insensitive only
- Limited to title and description
- No search across all boards

**Impact:**
- Slow searches with >1000 tasks
- Misspellings return no results
- Can't find tasks by assignee name
- Must know which board contains task

**Mitigation Path:**
- Add Elasticsearch for full-text search
- Implement fuzzy matching
- Index more fields
- Add global search

### 4. Security Limitations

**Current Implementation:**
- No JWT refresh tokens
- No token blacklisting
- No rate limiting
- No CSRF protection
- No password strength enforcement

**Impact:**
- Stolen token valid until expiry
- Can't forcefully logout users
- Vulnerable to brute force
- Potential CSRF attacks
- Weak passwords possible

**Mitigation Path:**
- Add refresh token rotation
- Implement token blacklist (Redis)
- Add express-rate-limit
- Add CSRF tokens
- Add zxcvbn password strength checker

### 5. Testing Coverage

**Current State:**
- Unit tests only
- No integration tests
- No E2E tests
- No load testing
- Manual testing for UI

**Impact:**
- Integration bugs possible
- No user flow validation
- Unknown performance limits
- UI regressions possible

**Mitigation Path:**
- Add integration tests (supertest)
- Add E2E tests (Cypress/Playwright)
- Run load tests (k6/Artillery)
- Add visual regression tests

---

## Future Improvements

### Phase 2 Enhancements

1. **User Features:**
   - Password reset via email
   - Email notifications
   - User avatars
   - @mentions in task descriptions
   - Due dates and reminders
   - Task labels/tags
   - Task checklists

2. **Collaboration:**
   - Real-time cursors
   - User presence indicators
   - Comments on tasks
   - Task attachments
   - Board templates
   - Export boards (JSON/CSV)

3. **Performance:**
   - Redis caching layer
   - Database query optimization
   - Lazy loading for tasks
   - Image optimization
   - Code splitting

4. **DevOps:**
   - Docker containerization
   - Kubernetes deployment
   - CI/CD pipeline (GitHub Actions)
   - Monitoring (Datadog/New Relic)
   - Error tracking (Sentry)

### Phase 3 Scaling

1. **Infrastructure:**
   - Multi-region deployment
   - CDN integration
   - Load balancing
   - Auto-scaling
   - Database sharding

2. **Features:**
   - Mobile apps (React Native)
   - Desktop app (Electron)
   - Browser extensions
   - API for third-party integration
   - Webhooks

3. **Enterprise:**
   - SSO/SAML authentication
   - Advanced permissions
   - Audit logs
   - Compliance certifications
   - White-labeling

---

## Conclusion

This MVP prioritizes speed of development and simplicity over scalability and advanced features. The architecture provides a solid foundation that can evolve as user needs and scale requirements become clear.

**Key Takeaway:**
Every trade-off is intentional and documented. As the product matures, these decisions can be revisited with real usage data to guide improvements.
