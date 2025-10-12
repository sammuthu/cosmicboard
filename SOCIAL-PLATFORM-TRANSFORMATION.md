# CosmicBoard Social Platform Transformation Plan

## 🎯 Vision

Transform CosmicBoard from a personal productivity tool into a **social productivity platform** where users can:
- Share their productive content (notes, tasks, documentation, tutorials) publicly
- Discover and engage with community-created content
- Collaborate on shared projects with privacy controls
- Build a knowledge-sharing network around productive activities

**Think:** "X (Twitter) meets Notion/Todoist" - Social engagement around productive content, not casual posts.

---

## 📊 High-Level Architecture Changes

### Current State
```
Projects (Bottom Tab)
  ├── Project List (Private only)
  └── Project Detail
       ├── Radar (Tasks)
       ├── Neural Notes
       ├── Moments (Photos)
       ├── Snaps (Screenshots)
       └── Scrolls (PDFs)
```

### Target State
```
Home (Bottom Tab - renamed from Projects)
  ├── Discover Feed (Top Tab - like "For You")
  │    └── Public content from network (recommended)
  ├── My Space (Top Tab)
  │    ├── My Projects (Private + Shared with me)
  │    └── My Content (All my items)
  └── Following (Top Tab - future)
       └── Content from users you follow

Each Content Item (Radar, Neural Notes, Media):
  ├── Visibility: Public | Contacts | Private
  ├── Engagement: Likes, Comments (threaded), Views
  ├── Amplify (repost - public items only)
  └── Bookmarks (save for later)
```

---

## 🗂️ Database Schema Changes

### New Tables Required

#### 1. **content_visibility** (Core table for all content)
```sql
CREATE TABLE content_visibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL, -- 'task', 'note', 'photo', 'screenshot', 'pdf', 'project', 'event'
  content_id UUID NOT NULL, -- References the actual content table
  visibility VARCHAR(20) NOT NULL DEFAULT 'private', -- 'public', 'contacts', 'private'
  owner_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_type, content_id)
);

CREATE INDEX idx_content_visibility_type_id ON content_visibility(content_type, content_id);
CREATE INDEX idx_content_visibility_public ON content_visibility(visibility) WHERE visibility = 'public';
```

#### 2. **content_engagement** (Likes, views, bookmarks)
```sql
CREATE TABLE content_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  engagement_type VARCHAR(20) NOT NULL, -- 'like', 'bookmark', 'view'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_type, content_id, user_id, engagement_type)
);

CREATE INDEX idx_content_engagement_type_id ON content_engagement(content_type, content_id);
CREATE INDEX idx_content_engagement_user ON content_engagement(user_id);
```

#### 3. **content_comments** (Threaded comments like X)
```sql
CREATE TABLE content_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES content_comments(id), -- For threading
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_content_comments_content ON content_comments(content_type, content_id);
CREATE INDEX idx_content_comments_parent ON content_comments(parent_comment_id);
```

#### 4. **content_amplify** (Reposts - better name than "reSpace")
```sql
CREATE TABLE content_amplify (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  amplify_text TEXT, -- Optional comment when amplifying
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_type, content_id, user_id)
);

CREATE INDEX idx_content_amplify_user ON content_amplify(user_id);
CREATE INDEX idx_content_amplify_content ON content_amplify(content_type, content_id);
```

#### 5. **user_connections** (Contacts/Following system)
```sql
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  connected_user_id UUID NOT NULL REFERENCES users(id),
  connection_type VARCHAR(20) NOT NULL DEFAULT 'contact', -- 'contact', 'following', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

CREATE INDEX idx_user_connections_user ON user_connections(user_id);
CREATE INDEX idx_user_connections_following ON user_connections(connection_type) WHERE connection_type = 'following';
```

#### 6. **events** (New entity for event management)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  location VARCHAR(255),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_events_project ON events(project_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
```

### Modified Existing Tables

#### **projects** (Add visibility)
```sql
ALTER TABLE projects ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';
```

#### **tasks** (Add event association + visibility)
```sql
ALTER TABLE tasks ADD COLUMN event_id UUID REFERENCES events(id);
ALTER TABLE tasks ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';
CREATE INDEX idx_tasks_event ON tasks(event_id);
```

#### **references** (Add visibility - for neural notes)
```sql
ALTER TABLE references ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';
```

#### **media** (Add visibility)
```sql
ALTER TABLE media ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';
```

---

## 🏗️ Implementation Phases (Incremental)

### **Phase S1: Foundation & Database** (Week 1-2)
*Focus: Backend schema without breaking existing functionality*

#### S1.1 Database Migration (Week 1)
- [ ] Create migration scripts for new tables
- [ ] Add visibility columns to existing tables (default 'private')
- [ ] Create indexes for performance
- [ ] Write rollback scripts
- [ ] Test migrations on staging database

#### S1.2 Backend API Foundation (Week 1-2)
- [ ] Create `content_visibility` service/controller
- [ ] Add visibility parameter to existing endpoints (backward compatible)
- [ ] Create `events` CRUD endpoints
- [ ] Add event association to tasks
- [ ] Write unit tests for new services

**Deliverable:** Database ready, backward-compatible API
**Risk:** Low - changes are additive, existing features unaffected

---

### **Phase S2: Navigation Redesign** (Week 3-4)
*Focus: UI restructure for new information architecture*

#### S2.1 Bottom Navigation Update (Week 3)
**Web:**
- [ ] Rename "Projects" → "Home" in bottom nav
- [ ] Update routing: `/cosmicboard` → `/home`
- [ ] Keep existing project list view temporarily

**Mobile:**
- [ ] Rename "Projects" tab → "Home" tab
- [ ] Update tab icon (house icon)
- [ ] Keep existing project screen temporarily

#### S2.2 Top Tabs Implementation (Week 3-4)
**Web:**
- [ ] Create top tab navigation component (similar to X's "For You/Following")
- [ ] Implement "My Space" tab (shows current project list)
- [ ] Implement "Discover" tab (empty state with "Coming Soon")
- [ ] Add tab persistence (remember last active tab)
- [ ] Smooth tab switching animations

**Mobile:**
- [ ] Create top tab navigation using React Navigation Material Top Tabs
- [ ] Implement "My Space" tab (current projects screen)
- [ ] Implement "Discover" tab (empty state)
- [ ] Add swipe gesture support
- [ ] Platform-specific styling (iOS feel vs Android Material)

**Naming Options for Tabs:**
| Name | Pro | Con |
|------|-----|-----|
| **Discover** | Clear, familiar (YouTube, LinkedIn use this) | Generic |
| **Explore** | Active, engaging | Similar to Discover |
| **Network** | Professional, clear purpose | Less intuitive |
| **Community** | Warm, collaborative | Might imply forums |
| **Feed** | Simple, X-like | Too generic |

**Recommendation:** "Discover" + "My Space"

**Deliverable:** New navigation structure with familiar project list
**Risk:** Low - UI change only, no functionality change yet

---

### **Phase S3: Privacy Controls** (Week 5-6)
*Focus: Allow users to set visibility on their content*

#### S3.1 Visibility UI Components (Week 5)
**Web:**
- [ ] Create visibility selector dropdown (🌍 Public | 👥 Contacts | 🔒 Private)
- [ ] Add to project creation modal
- [ ] Add to task creation/edit forms
- [ ] Add to neural note creation/edit
- [ ] Add to media upload forms
- [ ] Show current visibility status on cards/items

**Mobile:**
- [ ] Create visibility bottom sheet selector
- [ ] Add to project creation
- [ ] Add to task creation/edit
- [ ] Add to neural note creation/edit
- [ ] Add to media upload
- [ ] Visual indicators (icons) for visibility status

#### S3.2 Backend Integration (Week 5-6)
- [ ] Update `POST /projects` to accept visibility
- [ ] Update `POST /tasks` to accept visibility
- [ ] Update `POST /references` to accept visibility
- [ ] Update `POST /media/upload` to accept visibility
- [ ] Create `content_visibility` records for all new content
- [ ] Add visibility filter to existing GET endpoints

#### S3.3 Migration of Existing Data (Week 6)
- [ ] Script to create `content_visibility` records for all existing content (set to 'private')
- [ ] Verify data integrity
- [ ] Add safeguard: default to 'private' if visibility missing

**Deliverable:** Users can control who sees their content
**Risk:** Medium - Requires careful permission checks, but no public feed yet

---

### **Phase S4: Public Feed (Discover)** (Week 7-9)
*Focus: Show public content from the network*

#### S4.1 Feed Backend API (Week 7)
- [ ] Create `GET /api/feed/discover` endpoint
  - Fetch public items across all content types
  - Sort by recency (later: add relevance/trending)
  - Pagination support
  - Include user info (name, avatar) with each item
- [ ] Create unified feed item response format:
```typescript
interface FeedItem {
  id: string
  type: 'task' | 'note' | 'photo' | 'screenshot' | 'pdf' | 'project' | 'event'
  content: any // Polymorphic content based on type
  author: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  visibility: 'public'
  createdAt: string
  engagement: {
    likes: number
    comments: number
    amplifies: number
    views: number
  }
}
```

#### S4.2 Feed UI - Web (Week 8)
- [ ] Create `FeedCard` component (like X's post card)
  - Show content preview
  - Author info and avatar
  - Content type indicator
  - Timestamp
- [ ] Implement "Discover" tab content
  - Infinite scroll
  - Pull-to-refresh
  - Loading states
  - Empty state (no public content yet)
- [ ] Add content type filters (All | Tasks | Notes | Media)

#### S4.3 Feed UI - Mobile (Week 8-9)
- [ ] Create mobile `FeedCard` component
- [ ] Implement "Discover" tab content
  - FlatList with infinite scroll
  - Pull-to-refresh gesture
  - Loading skeleton
  - Empty state
- [ ] Add filter chips for content types
- [ ] Performance optimization (virtualization)

#### S4.4 Content Detail Views (Week 9)
- [ ] Tappable feed cards navigate to detail view
- [ ] Show full content in detail modal/screen
- [ ] Support all content types
- [ ] Add "Open in Project" link to navigate to source project

**Deliverable:** Users can discover public content from others
**Risk:** Medium - Performance concerns with large datasets (add pagination/caching)

---

### **Phase S5: Engagement Features** (Week 10-13)
*Focus: Likes, views, bookmarks, and comments*

#### S5.1 Likes & Views Backend (Week 10)
- [ ] Create `POST /api/engagement/like` endpoint
- [ ] Create `DELETE /api/engagement/like/:id` endpoint (unlike)
- [ ] Create `POST /api/engagement/view` endpoint (auto-triggered)
- [ ] Create `POST /api/engagement/bookmark` endpoint
- [ ] Update feed API to include user's engagement state (has_liked, has_bookmarked)
- [ ] Add engagement count to feed items

#### S5.2 Likes & Views UI (Week 10-11)
**Web:**
- [ ] Add heart icon button to feed cards (❤️)
- [ ] Animated like effect (heart fills)
- [ ] Show like count
- [ ] Add bookmark icon (🔖)
- [ ] Show view count (👁️)
- [ ] Add "Bookmarks" view in My Space

**Mobile:**
- [ ] Like button with haptic feedback
- [ ] Animated like (scale + color transition)
- [ ] Show engagement counts
- [ ] Bookmark button
- [ ] Bookmarks collection in My Space

#### S5.3 Comments Backend (Week 11-12)
- [ ] Create `POST /api/comments` endpoint
- [ ] Create `GET /api/comments/:contentType/:contentId` endpoint
  - Support threaded replies (parent_comment_id)
  - Pagination
  - Include author info
- [ ] Create `DELETE /api/comments/:id` endpoint
- [ ] Create `PATCH /api/comments/:id` endpoint (edit)

#### S5.4 Comments UI (Week 12-13)
**Web:**
- [ ] Comments section on detail view
- [ ] Threaded comments (X-style nesting)
- [ ] Reply button
- [ ] Edit/Delete own comments
- [ ] Comment count on feed cards
- [ ] Link to comments from feed

**Mobile:**
- [ ] Comments bottom sheet
- [ ] Threaded comment view
- [ ] Keyboard-aware input
- [ ] Reply flow
- [ ] Edit/Delete actions
- [ ] Show comment count on cards

**Deliverable:** Full engagement system (likes, views, bookmarks, comments)
**Risk:** Medium - Threaded comments can get complex, need good UX

---

### **Phase S6: Amplify (Repost)** (Week 14-15)
*Focus: Allow users to repost public content to their followers*

#### S6.1 Amplify Backend (Week 14)
- [ ] Create `POST /api/amplify` endpoint
  - Only allow public content
  - Optional comment when amplifying
  - Check if already amplified
- [ ] Create `DELETE /api/amplify/:id` endpoint (un-amplify)
- [ ] Update feed to include amplified content
  - Show "Username amplified" attribution
  - Show original author info
- [ ] Add amplify count to engagement

#### S6.2 Amplify UI (Week 14-15)
**Web:**
- [ ] Add Amplify button (🔄 or ↗️ icon)
- [ ] Amplify modal with optional comment
- [ ] Show amplify count
- [ ] Show "Amplified by You" state
- [ ] Display amplified items in feed with attribution

**Mobile:**
- [ ] Amplify button with bottom sheet
- [ ] Comment input (optional)
- [ ] Show amplified items in feed
- [ ] Attribution UI ("User amplified this")

**Naming Decision:**
| Name | Pro | Con |
|------|-----|-----|
| **Amplify** | Clear meaning (make louder) | Less playful |
| **Echo** | Poetic, fits cosmic theme | Might imply exact copy |
| **Boost** | Energetic, clear | Generic |
| **Share** | Universal understanding | Conflicts with existing "share to contacts" |
| **Repost** | Direct, like Reddit/X | Boring |

**Recommendation:** "Amplify" (fits cosmic branding, clear purpose)

**Deliverable:** Users can amplify public content
**Risk:** Low - Straightforward repost feature

---

### **Phase S7: User Network** (Week 16-18)
*Focus: Contacts and following system*

#### S7.1 Contacts System (Week 16)
- [ ] Create `POST /api/contacts` endpoint (add contact by email/username)
- [ ] Create `GET /api/contacts` endpoint (list my contacts)
- [ ] Create `DELETE /api/contacts/:id` endpoint
- [ ] Update visibility filter to respect "contacts" setting
  - If item is "contacts-only", only show to connected users
- [ ] Contact search and discovery

#### S7.2 Following System (Week 17)
- [ ] Create `POST /api/following/:userId` endpoint
- [ ] Create `DELETE /api/following/:userId` endpoint
- [ ] Create user profile pages (public profile)
  - Show public content from that user
  - Show follower/following counts
  - Follow button
- [ ] Add "Following" top tab
  - Feed of content from users you follow
  - Include both public and contacts-only content (if you're connected)

#### S7.3 User Discovery (Week 18)
**Web & Mobile:**
- [ ] Search users by name/username
- [ ] Suggested users to follow
- [ ] "Who to follow" section
- [ ] User profile modal/screen
  - Avatar, bio, stats
  - Public content grid
  - Follow button

**Deliverable:** Social graph with contacts and following
**Risk:** Medium - Privacy is critical (ensure contacts-only content is properly filtered)

---

### **Phase S8: Events Management** (Week 19-21)
*Focus: Event entity and task-event relationships*

#### S8.1 Events Backend (Week 19)
- [ ] Events CRUD API (already done in S1.2, enhance here)
- [ ] Add event calendar view endpoint
- [ ] Link tasks to events
- [ ] Add visibility to events

#### S8.2 Events UI - Web (Week 20)
- [ ] Event creation modal
- [ ] Event list view within project
- [ ] Event calendar view (monthly/weekly)
- [ ] Link tasks to events during creation/edit
- [ ] Event detail page
  - Associated tasks
  - Timeline
  - Event metadata

#### S8.3 Events UI - Mobile (Week 20-21)
- [ ] Event creation flow
- [ ] Event list within project
- [ ] Event calendar widget
- [ ] Task-event linking
- [ ] Event detail screen

#### S8.4 Public Events in Feed (Week 21)
- [ ] Show public events in Discover feed
- [ ] Event cards in feed
- [ ] Join/interest in public events (future: RSVPs)

**Deliverable:** Full event management with task integration
**Risk:** Low - Mostly additive feature

---

### **Phase S9: Polish & Optimization** (Week 22-24)
*Focus: Performance, UX refinements, and edge cases*

#### S9.1 Performance Optimization (Week 22)
- [ ] Database query optimization (indexes, materialized views)
- [ ] Feed caching strategy (Redis)
- [ ] Image optimization (thumbnails, lazy loading)
- [ ] Pagination tuning
- [ ] API response time monitoring

#### S9.2 UX Refinements (Week 23)
- [ ] Smooth animations and transitions
- [ ] Loading skeletons everywhere
- [ ] Error states and retry logic
- [ ] Offline mode indicators
- [ ] Success/failure toasts
- [ ] Empty states with helpful CTAs

#### S9.3 Edge Cases & Security (Week 24)
- [ ] Spam prevention (rate limiting on likes, comments, amplifies)
- [ ] Content reporting/flagging system
- [ ] Block users feature
- [ ] Privacy audit (ensure no leakage of private content)
- [ ] Moderation tools (admin panel)
- [ ] GDPR compliance (data export, deletion)

**Deliverable:** Production-ready social platform
**Risk:** Low - Polish and bug fixes

---

## 📱 UI/UX Mockup Concepts

### Bottom Navigation (Renamed)
```
Before:
📊 Discover | 📌 Projects | 🧭 Profile

After:
📊 Discover | 🏠 Home | 🧭 Profile
```

### Top Tabs within Home
```
┌─────────────────────────────────────┐
│  Discover  |  My Space  |  Following │ ← Top tabs
├─────────────────────────────────────┤
│  [Feed Item Card]                    │
│  👤 User Name      📌 Task           │
│  Fix database migration bug          │
│  ❤️ 24  💬 5  🔄 3  👁️ 156          │
├─────────────────────────────────────┤
│  [Feed Item Card]                    │
│  👤 Jane Doe       🧠 Neural Note    │
│  How to setup Docker for Next.js    │
│  ❤️ 89  💬 12  🔄 15  👁️ 542        │
└─────────────────────────────────────┘
```

### Visibility Selector (Consistent Icon Language)
```
🌍 Public - Everyone can see
👥 Contacts - Only my contacts
🔒 Private - Only me
```

### Feed Card Engagement Bar
```
┌─────────────────────────────────────┐
│ ❤️ Like  💬 Comment  🔄 Amplify  🔖 │
│  (42)      (8)         (5)      Save│
└─────────────────────────────────────┘
```

---

## 🎨 Naming Conventions

### Feature Names (User-Facing)
| Feature | Name | Icon | Rationale |
|---------|------|------|-----------|
| Repost/Reshare | **Amplify** | 🔄 | Fits cosmic theme, clear purpose |
| Save for later | **Bookmark** | 🔖 | Universal understanding |
| Personal area | **My Space** | 🌌 | Cosmic theme, personal |
| Public feed | **Discover** | 🔭 | Exploration theme |
| Follow feed | **Following** | ⭐ | Standard social term |
| Comment thread | **Replies** | 💬 | X-style |

### Avoid These (Too X-like)
- ❌ "Retweet" or "Repost" → Use "Amplify"
- ❌ "Tweet" → Use "Item" or "Post"
- ❌ "Timeline" → Use "Feed"
- ❌ "For You" → Use "Discover"

---

## 🗄️ API Endpoints Summary

### New Endpoints
```
# Feed
GET    /api/feed/discover          # Public content feed
GET    /api/feed/following         # Content from followed users
GET    /api/feed/my-space          # User's own content + shared with them

# Engagement
POST   /api/engagement/like
DELETE /api/engagement/like/:id
POST   /api/engagement/bookmark
GET    /api/engagement/bookmarks   # User's bookmarked items
POST   /api/engagement/view        # Track views

# Comments
POST   /api/comments
GET    /api/comments/:contentType/:contentId
PATCH  /api/comments/:id
DELETE /api/comments/:id

# Amplify
POST   /api/amplify
DELETE /api/amplify/:id
GET    /api/amplify/:userId        # User's amplified items

# User Network
POST   /api/contacts
GET    /api/contacts
DELETE /api/contacts/:id
POST   /api/following/:userId
DELETE /api/following/:userId
GET    /api/following              # Users you follow
GET    /api/followers              # Users following you

# Events
POST   /api/events
GET    /api/events/:projectId
GET    /api/events/:id
PATCH  /api/events/:id
DELETE /api/events/:id

# User Profiles
GET    /api/users/:id/profile      # Public profile
GET    /api/users/:id/content      # User's public content
```

### Modified Endpoints (Add visibility param)
```
POST   /api/projects               # Add visibility field
POST   /api/tasks                  # Add visibility + event_id fields
POST   /api/references             # Add visibility field
POST   /api/media/upload           # Add visibility field
```

---

## 🧪 Testing Strategy

### Phase-by-Phase Testing

**S1 (Database):**
- Migration rollback tests
- Backward compatibility tests
- Data integrity checks

**S2 (Navigation):**
- UI navigation flow tests
- Tab switching performance
- Deep linking tests

**S3 (Privacy):**
- Visibility permission tests (critical!)
- Ensure private content never leaks to public feed
- Contacts-only content visible only to connected users

**S4 (Feed):**
- Feed pagination tests
- Performance tests with 10k+ items
- Content type filtering

**S5 (Engagement):**
- Like/unlike idempotency
- Comment threading depth limits
- Engagement count accuracy

**S6 (Amplify):**
- Prevent amplifying private content
- Attribution accuracy
- Un-amplify flow

**S7 (Network):**
- Contact invitation flow
- Follow/unfollow
- Privacy enforcement with following

**S8 (Events):**
- Event CRUD operations
- Task-event linking
- Calendar view accuracy

**S9 (Polish):**
- Load testing (1000+ concurrent users)
- Security penetration testing
- GDPR compliance audit

---

## ⚠️ Risks & Mitigation

### High-Risk Areas

**1. Privacy Leakage**
- *Risk:* Private content accidentally shown publicly
- *Mitigation:*
  - Strict WHERE clauses in all queries (always filter by visibility)
  - Add database row-level security (RLS)
  - Automated privacy tests
  - Manual security audit before launch

**2. Performance Degradation**
- *Risk:* Feed queries become slow with millions of items
- *Mitigation:*
  - Aggressive indexing
  - Feed caching (Redis)
  - Pagination everywhere
  - Load testing early and often

**3. Spam & Abuse**
- *Risk:* Users spam likes, comments, amplifies
- *Mitigation:*
  - Rate limiting (max 100 likes/hour, 50 comments/hour)
  - Content flagging system
  - Block/mute users
  - Admin moderation tools

**4. Breaking Existing Functionality**
- *Risk:* Changes to core tables break current features
- *Mitigation:*
  - All changes backward compatible (additive only)
  - Comprehensive regression testing
  - Feature flags for gradual rollout
  - Staging environment testing

### Medium-Risk Areas

**1. Complex Threaded Comments**
- *Risk:* Threading logic becomes unmaintainable
- *Mitigation:*
  - Limit thread depth (max 5 levels)
  - Use proven comment library if needed
  - Simplify UI for deep threads (collapse)

**2. User Discovery & Search**
- *Risk:* Poor search experience, hard to find users
- *Mitigation:*
  - Implement full-text search (PostgreSQL FTS or Elasticsearch)
  - Smart suggestions algorithm
  - A/B test different discovery UIs

---

## 📈 Success Metrics

### Phase S4 (Feed Launch)
- [ ] 30%+ of users view Discover feed daily
- [ ] Average 50+ public items posted per day

### Phase S5 (Engagement)
- [ ] 50%+ of public content receives at least 1 like
- [ ] 20%+ of public content receives comments
- [ ] 10%+ of users bookmark content

### Phase S6 (Amplify)
- [ ] 10%+ of public content gets amplified
- [ ] 5%+ of users amplify at least once per week

### Phase S7 (Network)
- [ ] 40%+ of users add at least 3 contacts
- [ ] 20%+ of users follow other users
- [ ] 15%+ of content is set to "Contacts" visibility

### Phase S8 (Events)
- [ ] 30%+ of projects have at least 1 event
- [ ] 50%+ of tasks are linked to events

---

## 🚀 Go-to-Market Strategy

### Beta Launch (Phase S4-S5)
- Invite-only beta
- 100-500 early adopters
- Focus on content creators (educators, developers, designers)
- Gather feedback on feed algorithm

### Public Launch (Phase S7)
- Open registration
- Landing page highlighting social features
- Case studies (e.g., "Teacher shares study notes with students")
- Reddit, Product Hunt, Hacker News posts

### Growth Loops
1. **Content Loop:** Great public content → Discovery → New users → More content
2. **Network Loop:** Users invite contacts → Contacts-only content sharing → More engagement
3. **Amplify Loop:** Amplified content → Reach new audiences → More followers

---

## 🔄 Migration from Current State

### For Existing Users
- **Phase S2:** See new "Home" tab, but everything works the same
- **Phase S3:** See new visibility options (defaults to Private), no behavior change
- **Phase S4:** Can explore Discover feed, but their content stays private until they opt-in
- **Phase S5+:** Gradually adopt social features at their own pace

### Communication Plan
- In-app announcement: "Introducing CosmicBoard Community"
- Email to users explaining new features
- Video tutorial on privacy controls
- FAQ on blog/docs

---

## 🛠️ Technology Additions

### New Dependencies

**Backend:**
- `pg` (PostgreSQL) - already have
- `redis` + `ioredis` - For feed caching
- `bull` - Job queue for notifications
- `socket.io` - Real-time comment updates (optional)

**Web Frontend:**
- `react-intersection-observer` - Infinite scroll
- `react-virtualized` or `react-window` - Feed performance
- Already have React Query for data fetching

**Mobile:**
- `react-native-tab-view` - Top tabs
- `@react-native-community/netinfo` - Offline detection
- Already have React Native core

### Infrastructure
- Redis instance (AWS ElastiCache or local)
- CDN for media (already using S3/LocalStack)
- Background job processor (for notifications, later)

---

## 📅 Timeline Summary

| Phase | Duration | Focus | Risk |
|-------|----------|-------|------|
| S1 | 2 weeks | Database & Backend Foundation | Low |
| S2 | 2 weeks | Navigation Redesign | Low |
| S3 | 2 weeks | Privacy Controls | Medium |
| S4 | 3 weeks | Public Feed (Discover) | Medium |
| S5 | 4 weeks | Engagement (Likes, Comments) | Medium |
| S6 | 2 weeks | Amplify (Repost) | Low |
| S7 | 3 weeks | User Network (Contacts, Following) | Medium |
| S8 | 3 weeks | Events Management | Low |
| S9 | 3 weeks | Polish & Optimization | Low |
| **Total** | **24 weeks** (~6 months) | Full social platform | |

**Optimized with Parallel Work:** 20-22 weeks (~5 months)

---

## 🎯 Next Immediate Steps

1. **Review this plan** and approve the scope
2. **Database migration design** (S1.1) - Create detailed migration scripts
3. **Design mockups** for new navigation (S2) - Figma designs for web + mobile
4. **API contract definition** - Swagger/OpenAPI specs for all new endpoints
5. **Set up staging environment** with test data for social features
6. **Create feature flag system** for gradual rollout

---

## 📝 Open Questions

1. **Content Moderation:** Do we need AI-powered content moderation, or start with user reporting?
2. **Notification System:** Should we implement push notifications in Phase S5, or defer to later?
3. **Monetization:** Will there be premium features (e.g., unlimited public posts, analytics)?
4. **Data Retention:** How long do we keep old feed items? Archive after 1 year?
5. **Privacy Defaults:** Should new accounts default to private profile, or public?

---

**Document Version:** 1.0
**Created:** 2025-10-11
**Owner:** Product & Engineering
**Status:** DRAFT - Awaiting Approval
**Next Review:** After feedback from stakeholders
