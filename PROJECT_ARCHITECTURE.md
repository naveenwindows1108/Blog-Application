# Blog Application - Complete Project Architecture & Implementation

## Project Overview
A full-stack blog application with Django REST Framework backend and React TypeScript frontend, featuring user authentication (JWT + Google OAuth), post creation, commenting, likes, bookmarks, and related post recommendations.

---

## 1. BACKEND ARCHITECTURE

### Technology Stack
- **Framework:** Django 6.0.3
- **API:** Django REST Framework 3.16.1
- **Authentication:** JWT (djangorestframework-simplejwt 5.5.1)
- **Database:** PostgreSQL (hosted on Supabase)
- **Media Storage:** Cloudinary
- **Image Processing:** Pillow 12.1.1, Pilkit 3.0, django-imagekit 6.1.0
- **CORS:** django-cors-headers 4.9.0
- **Google OAuth:** google-auth 2.49.1
- **Server:** Gunicorn 25.1.0, Asgiref 3.11.1

### Project Structure
```
Backend/
├── blog_backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── build.sh
│   ├── blog_backend/          # Main project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   │   └── __init__.py
│   ├── blog/                   # Blog app
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── backends.py
│   │   ├── signals.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   └── media/
│       ├── posts/
│       └── profiles/
└── env/                        # Python virtual environment
```

### Database Models

#### 1. User Model (Custom)
```
- Inherits from AbstractUser
- Fields: username, email (unique), password
- Uses email for unique identification
```

#### 2. Profile Model
```
- OneToOne relationship with User
- Fields:
  - bio (TextField)
  - avatar (ImageField) - uploaded to 'profiles/'
  - website (URLField)
  - created_at (DateTime)
```

#### 3. Category Model
```
- name (CharField, unique)
- slug (SlugField, unique, auto-generated from name)
- auto_slug field auto-generates slugs on save
```

#### 4. Tag Model
```
- name (CharField, unique)
```

#### 5. Post Model
```
- author (ForeignKey to User) with related_name='posts'
- title (CharField, max 255)
- slug (SlugField, unique) - format: "{slugified-title}-{uuid:6}"
- content (TextField)
- image (ImageField) - uploaded to 'posts/', nullable
- category (ForeignKey to Category, nullable)
- tags (ManyToMany with Tag)
- status (Choice: 'draft' or 'published', default='draft')
- view_count (PositiveInteger, default=0)
- created_at (DateTime, auto_now_add)
- updated_at (DateTime, auto_now)
- published_at (DateTime, nullable)
- Meta: 
  - Ordered by '-created_at'
  - Indexes on: slug, status
```

#### 6. Comment Model
```
- post (ForeignKey to Post) with related_name='comments'
- user (ForeignKey to User)
- content (TextField)
- parent (SelfFK) - for nested/threaded comments with related_name='replies'
- is_approved (Boolean, default=True)
- created_at (DateTime, auto_now_add)
- Meta: Ordered by 'created_at'
```

#### 7. Like Model
```
- user (ForeignKey to User)
- post (ForeignKey to Post) with related_name='likes'
- created_at (DateTime, auto_now_add)
- Meta: unique_together=('user', 'post') - prevents duplicate likes
```

#### 8. Bookmark Model
```
- user (ForeignKey to User)
- post (ForeignKey to Post)
- created_at (DateTime, auto_now_add)
- Meta: unique_together=('user', 'post')
```

### API Endpoints

#### Authentication
- `POST /api/register/` - Register new user
- `POST /api/auth/google/` - Google OAuth login
- `POST /api/token/` - Obtain JWT tokens
- `POST /api/token/refresh/` - Refresh access token

#### Users
- `GET /api/users/` - List all users
- `GET /api/users/{id}/` - Get specific user
- `GET /api/users/me/` - Get current authenticated user
- `PATCH /api/users/me/` - Update current user

#### Profiles
- `GET /api/profiles/` - List all profiles
- `GET /api/profiles/{id}/` - Get specific profile
- `GET /api/profiles/me/` - Get current user's profile
- `PATCH /api/profiles/me/` - Update current user's profile
- `POST /api/profiles/` - Create profile
- `PUT /api/profiles/{id}/` - Update profile
- `DELETE /api/profiles/{id}/` - Delete profile

#### Posts
- `GET /api/posts/` - List all posts (with search, pagination, filtering)
- `GET /api/posts/{id}/` - Get specific post (increments view_count)
- `POST /api/posts/` - Create post (requires authentication)
- `PUT /api/posts/{id}/` - Update post (owner only)
- `PATCH /api/posts/{id}/` - Partial update post (owner only)
- `DELETE /api/posts/{id}/` - Delete post (owner only)
- `POST /api/posts/{id}/like/` - Toggle like on post
- `POST /api/posts/{id}/bookmark/` - Toggle bookmark on post
- `GET /api/posts/{id}/related/` - Get related posts (same category/tags)

**Search functionality:** Searches in title, content, author__username, category__name, tags__name

#### Comments
- `GET /api/comments/` - List all comments
- `GET /api/comments/{id}/` - Get specific comment
- `POST /api/comments/` - Create comment (requires authentication)
- `PUT /api/comments/{id}/` - Update comment
- `PATCH /api/comments/{id}/` - Partial update comment
- `DELETE /api/comments/{id}/` - Delete comment

#### Categories
- `GET /api/categories/` - List all categories (cached 1 hour)
- `GET /api/categories/{id}/` - Get specific category
- `POST /api/categories/` - Create category
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

#### Tags
- `GET /api/tags/` - List all tags (cached 1 hour)
- `GET /api/tags/{id}/` - Get specific tag
- `POST /api/tags/` - Create tag
- `PUT /api/tags/{id}/` - Update tag
- `DELETE /api/tags/{id}/` - Delete tag

#### Likes
- `GET /api/likes/` - List all likes
- `POST /api/likes/` - Create like

#### Bookmarks
- `GET /api/bookmarks/` - List all bookmarks
- `POST /api/bookmarks/` - Create bookmark

### ViewSets & Permissions

#### UserViewSet (ReadOnly)
- Methods: list, retrieve
- Custom actions: me (GET, PATCH)
- Permission: AllowAny
- Optimization: select_related('profile')

#### ProfileViewSet (CRUD)
- Methods: list, retrieve, create, update, destroy
- Custom actions: me (GET, PATCH)
- Permission: IsAuthenticatedOrReadOnly
- Optimization: select_related('user')

#### CategoryViewSet (CRUD)
- Cache-Control: public, max-age=3600

#### TagViewSet (CRUD)
- Cache-Control: public, max-age=3600

#### PostViewSet (CRUD)
- Methods: list, retrieve, create, update, destroy
- Custom actions: like, bookmark, related (all POST except related which is GET)
- Permissions: IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly
- Search fields: title, content, author__username, category__name, tags__name
- Caching:
  - List: 5 minutes (300s)
  - Single post retrieve: 1 minute (60s)
  - Related posts: 10 minutes (600s)
- Optimization: select_related('author', 'category'), prefetch_related('tags', 'comments__replies', 'likes')
- Special behaviors:
  - Like/Unlike: toggles like, returns message
  - Bookmark/Unbookmark: toggles bookmark, returns message
  - Related: returns up to 3 related posts by category or tags

#### CommentViewSet (CRUD)
- Methods: list, retrieve, create, update, destroy
- Permission: IsAuthenticatedOrReadOnly
- Optimization: select_related('user', 'post'), prefetch_related('replies')

#### LikeViewSet (CRUD)
- auto_populate user on create

#### BookmarkViewSet (CRUD)
- auto_populate user on create

#### RegisterView (Create)
- POST only
- Permission: AllowAny

#### GoogleLoginView (POST)
- Verifies Google OAuth token
- Creates user if new (with unique username generation)
- Creates Profile for new users
- Returns JWT tokens, username, is_new_user flag, avatar URL

### Authentication Flow

#### JWT Authentication
- Access Token Lifetime: 60 minutes
- Refresh Token Lifetime: 7 days
- Uses djangorestframework-simplejwt
- Token endpoints: `/api/token/` and `/api/token/refresh/`

#### Google OAuth Flow
1. Frontend sends Google token to `/api/auth/google/`
2. Backend verifies token with Google
3. Extracts: email, first_name, last_name, picture
4. Creates/retrieves user by email
5. Returns: access_token, refresh_token, username, is_new_user, avatar

### Permissions
- `IsOwnerOrReadOnly`: Allows read to anyone, write only to post owner
- `IsAuthenticated`: For protected actions (create, update, delete on most resources)
- `IsAuthenticatedOrReadOnly`: Read for all, write for authenticated users
- `AllowAny`: Public access (registration, token obtain, read endpoints)

### Django Settings
- **Database:** PostgreSQL on Supabase (aws-1-ap-northeast-1)
- **Cloudinary Storage:** For media file hosting
- **CORS Middleware:** Enabled for frontend communication
- **Media Root:** ./media/
- **Static Files:** WhiteNoise for production serving
- **Installed Apps:** 
  - django.contrib.admin, auth, contenttypes, sessions, messages, staticfiles
  - blog, rest_framework, corsheaders, imagekit, cloudinary_storage, cloudinary
- **Middleware Stack:** Security, WhiteNoise, CORS, Sessions, CSRF, Auth, Messages, XFrame

---

## 2. FRONTEND ARCHITECTURE

### Technology Stack
- **Framework:** React 19.2.4
- **Language:** TypeScript 5.9.3
- **Build Tool:** Vite 8.0.0
- **Routing:** react-router-dom 7.13.1
- **HTTP Client:** Axios 1.13.6
- **State Management:** TanStack React Query 5.91.0
- **UI Framework:** Bootstrap 5.3.8
- **Text Editor:** react-quill-new 3.8.3
- **Authentication:** Google OAuth (@react-oauth/google 0.13.4)
- **Linting:** ESLint 9.39.4

### Project Structure
```
Frontend/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx          # Entry point
│       ├── App.tsx           # Main app component with routing
│       ├── App.css
│       ├── index.css
│       ├── api/
│       │   └── axios.ts      # Axios HTTP client instance
│       ├── components/
│       │   ├── ArticleCard.tsx
│       │   ├── ArticleGrid.tsx
│       │   ├── Hero.tsx
│       │   ├── Navbar.tsx
│       │   └── PrivateRoute.tsx
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── SinglePost.tsx
│       │   ├── Profile.tsx
│       │   ├── Settings.tsx
│       │   ├── CreatePost.tsx
│       │   ├── EditPost.tsx
│       │   └── Bookmarks.tsx
│       ├── hooks/
│       │   └── useDocumentTitle.ts
│       └── utils/
```

### Main Entry Point (main.tsx)
```typescript
- StrictMode wrapper
- GoogleOAuthProvider with CLIENT_ID: 675906039706-rp4m2ik88vkuu905dqhg9ijto7f47apk.apps.googleusercontent.com
- Bootstrap CSS & JS imported
- React 19 with createRoot
```

### App Component (App.tsx)
- **Router:** BrowserRouter
- **State Management:** QueryClientProvider with React Query
- **Loading State:** Suspense with PageLoader component
- **Navbar:** Global navigation component

**Routes:**
- `POST /` - Home page (public)
- `POST /login` - Login page (public)
- `POST /register` - Register page (public)
- `POST /post/:id` - Single post view (public)
- `POST /profile` - User profile (protected)
- `POST /settings` - User settings (protected)
- `POST /create-post` - Create new post (protected)
- `POST /edit-post/:id` - Edit post (protected)

### HTTP Client (api/axios.ts)

**Features:**
- Base URL: `import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/'`
- Default headers: `Content-Type: application/json`
- Request interceptor: Adds Bearer token from localStorage
- Response interceptor: Handles 401 errors with token refresh
- Auto token refresh: Uses refresh_token to get new access_token
- Error handling: Redirects to login on session expiration

**Authentication flow:**
1. Stores access_token, refresh_token, username in localStorage
2. Adds Authorization header: `Bearer {access_token}`
3. On 401: Attempts to refresh token using refresh_token
4. If refresh succeeds: Retries original request with new token
5. If refresh fails: Clears tokens and redirects to /login

### Components

#### ArticleCard.tsx
- Displays individual blog post preview
- Shows: image, title, author, excerpt, date
- Links to full post view

#### ArticleGrid.tsx
- Grid layout for displaying multiple article cards
- Responsive Bootstrap grid

#### Hero.tsx
- Banner/hero section on home page
- Call-to-action for blog

#### Navbar.tsx
- Global navigation component
- Links to: home, login, register (when not authenticated)
- Links to: profile, create post, logout (when authenticated)
- User profile dropdown

#### PrivateRoute.tsx
- Route guard component
- Redirects unauthenticated users to /login
- Wraps protected routes

### Pages

#### Home.tsx
- Displays latest blog posts
- Search functionality
- Category/tag filtering
- Pagination or infinite scroll

#### Login.tsx
- Form-based login
- Google OAuth integration
- Form validation

#### Register.tsx
- User registration form
- Form validation
- Email verification (if implemented)

#### SinglePost.tsx
- Full post view
- Post content with rich text
- Comments section
- Like/bookmark buttons
- Related posts sidebar
- Author info

#### Profile.tsx
- User profile page
- User info: avatar, bio, website, post count
- User's published posts list
- Edit profile button

#### Settings.tsx
- User account settings
- Update profile info
- Change password (if implemented)
- Privacy settings

#### CreatePost.tsx
- New post creation form
- Rich text editor (react-quill-new)
- Title, content, image upload, category, tags, status
- Form validation

#### EditPost.tsx
- Edit existing post
- Pre-populated form
- Same fields as CreatePost

#### Bookmarks.tsx
- Display user's bookmarked posts
- List/grid view

### Custom Hooks

#### useDocumentTitle.ts
- Updates browser document title
- Accepts title string as parameter
- Used across pages for SEO

### Build Configuration (vite.config.ts)

**Plugins:**
- @vitejs/plugin-react for React fast refresh

**Server:**
- Headers: "Cross-Origin-Opener-Policy": "same-origin-allow-popups" (for Google OAuth)

**Build:**
- manualChunks configuration splits vendor dependencies:
  - vendor-react: React & React DOM
  - vendor-router: React Router DOM
  - vendor-query: TanStack React Query

### Environment Variables
- `VITE_API_URL`: Backend API base URL (defaults to http://127.0.0.1:8000/api/)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID (in main.tsx: 675906039706-rp4m2ik88vkuu905dqhg9ijto7f47apk.apps.googleusercontent.com)

---

## 3. FULL DATA FLOW

### Create & Read Post Flow
1. User navigates to `/create-post`
2. Fills form (title, content, image, category, tags, status)
3. Submits: `POST /api/posts/` with form data
4. Backend: CreateUpdateSerializer validates, creates Post with author=logged-in user
5. Image uploaded to Cloudinary
6. Post returned with id, slug, author, etc.
7. Frontend navigates to `/post/{slug}` or similar

### Read Single Post Flow
1. User clicks post or navigates to `/post/:id`
2. Frontend: `GET /api/posts/:id/`
3. Backend: Increments view_count, returns cache-controlled response
4. Post displayed with author info, comments, related posts
5. Comments displayed recursively (parent + replies)

### Like Flow
1. User clicks like button on post
2. Frontend: `POST /api/posts/{id}/like/` (no body needed)
3. Backend: Toggles Like object, returns "Liked" or "Unliked"
4. Frontend updates UI

### Bookmark Flow
1. User clicks bookmark button
2. Frontend: `POST /api/posts/{id}/bookmark/`
3. Backend: Toggles Bookmark object
4. Frontend updates UI

### Comment Flow
1. User writes comment and submits
2. Frontend: `POST /api/comments/` with {post, content, parent (optional)}
3. Backend: Creates Comment with user=authenticated user
4. Frontend displays comment with author avatar, timestamp
5. Nested comments: parent field links to parent comment

### Authentication Flow
1. User visits `/login`
2. Option A - Email/Password:
   - Fills email, password
   - `POST /api/token/` with credentials
   - Receives access_token, refresh_token
   - Stores in localStorage
3. Option B - Google OAuth:
   - Clicks "Sign in with Google"
   - Google popup appears
   - Backend receives token
   - `POST /api/auth/google/` with token
   - Backend verifies, creates/retrieves user
   - Returns {access, refresh, username, is_new_user, avatar}
   - Stores tokens in localStorage
4. Axios interceptor adds Bearer token to all requests
5. If token expires: Interceptor auto-refreshes and retries
6. If refresh fails: Clears tokens, redirects to `/login`

### Related Posts Flow
1. User viewing single post
2. Frontend: `GET /api/posts/{id}/related/`
3. Backend: Filters posts by same category OR tags
4. Returns up to 3 related posts
5. Cache-controlled (10 minutes)
6. Frontend displays as "Related Posts" section

---

## 4. PERFORMANCE OPTIMIZATIONS IMPLEMENTED

### Backend
1. **Database Optimizations:**
   - select_related('author', 'category') for N+1 prevention
   - prefetch_related('tags', 'comments__replies', 'likes') for forward relations
   - Database indexes on: slug, status fields
   - unique_together constraints on Like/Bookmark to prevent duplicates

2. **Caching:**
   - Categories list: 1 hour cache
   - Tags list: 1 hour cache
   - Posts list: 5 minutes cache
   - Single post retrieve: 1 minute cache
   - Related posts: 10 minutes cache

3. **Whitenoise:**
   - Static file serving with gzip compression

4. **CORS:**
   - Proper CORS headers for frontend communication

5. **Image Processing:**
   - Cloudinary integration for optimized image delivery
   - Image optimization during upload

### Frontend
1. **Code Splitting:**
   - Lazy loading of routes with React.lazy()
   - Suspense boundary with PageLoader fallback
   - Manual chunks in Vite build:
     - vendor-react.js
     - vendor-router.js
     - vendor-query.js

2. **Data Fetching:**
   - TanStack React Query for caching, deduplication, background refetching
   - Axios interceptor for efficient token management

3. **CSS:**
   - Bootstrap 5 for efficient styling
   - Component-scoped CSS where needed

4. **Bundle Optimization:**
   - TypeScript for type safety (reduced runtime errors)
   - Vite for fast development and optimized builds
   - Tree-shaking of unused code

---

## 5. DEPLOYMENT CONFIGURATION

### Backend
- **Procfile:** For Heroku/similar deployment
- **Gunicorn:** Application server
- **Django Settings:**
  - DEBUG set via environment variable
  - ALLOWED_HOSTS from environment
  - SECRET_KEY from environment
  - SSL mode required for database connection

### Database
- **Provider:** Supabase PostgreSQL
- **Connection:** SSL required (sslmode='require')
- **Credentials:** Environment variables

### Frontend
- **Build Command:** `tsc -b && vite build`
- **Build Output:** dist/ folder
- **Preview Command:** `vite preview`

---

## 6. DEPENDENCIES SUMMARY

### Backend Key Dependencies
- Django 6.0.3
- djangorestframework 3.16.1
- djangorestframework-simplejwt 5.5.1
- django-cors-headers 4.9.0
- django-cloudinary-storage 0.3.0
- cloudinary 1.44.1
- Pillow 12.1.1
- psycopg2-binary 2.9.11
- gunicorn 25.1.0
- python-dotenv

### Frontend Key Dependencies
- React 19.2.4
- react-router-dom 7.13.1
- axios 1.13.6
- @tanstack/react-query 5.91.0
- bootstrap 5.3.8
- react-quill-new 3.8.3
- @react-oauth/google 0.13.4
- TypeScript 5.9.3

---

## 7. CURRENT IMPLEMENTATION STATUS

### ✅ Implemented Features
- User authentication (JWT + Google OAuth)
- User profiles with avatar, bio, website
- Blog post CRUD operations
- Rich text editor for post content
- Image upload to Cloudinary
- Categories and tags
- Comments with nesting/replies
- Like system with toggle
- Bookmark system with toggle
- Search functionality across posts
- Related posts recommendation
- View count tracking
- Post status (draft/published)
- Responsive UI with Bootstrap
- Protected routes for authenticated users
- Token refresh mechanism

### 🔄 Areas for Performance Improvement
1. Frontend pagination/infinite scroll implementation
2. API response pagination strategy
3. Comment pagination
4. Search result optimization
5. Image optimization at upload time
6. Service worker for offline support
7. More aggressive caching strategies
8. Database query optimization for complex filters
9. API response compression
10. Frontend route preloading

---

## 8. PROJECT SETUP & RUNNING

### Backend Setup
```bash
cd Backend/blog_backend
source env/Scripts/activate  # Windows: env\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd Frontend/frontend
npm install
npm run dev
```

### Environment Variables Needed
**Backend (.env file):**
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (.env.local file):**
```
VITE_API_URL=http://127.0.0.1:8000/api/
VITE_GOOGLE_CLIENT_ID=675906039706-rp4m2ik88vkuu905dqhg9ijto7f47apk.apps.googleusercontent.com
```

---

## 9. KEY FILE LOCATIONS

### Backend
- Models: `Backend/blog_backend/blog/models.py`
- Views/ViewSets: `Backend/blog_backend/blog/views.py`
- Serializers: `Backend/blog_backend/blog/serializers.py`
- URLs: `Backend/blog_backend/blog/urls.py` & `Backend/blog_backend/blog_backend/urls.py`
- Settings: `Backend/blog_backend/blog_backend/settings.py`
- Permissions: `Backend/blog_backend/blog/permissions.py`

### Frontend
- Main App: `Frontend/frontend/src/App.tsx`
- HTTP Client: `Frontend/frontend/src/api/axios.ts`
- Pages: `Frontend/frontend/src/pages/`
- Components: `Frontend/frontend/src/components/`
- Config: `Frontend/frontend/vite.config.ts`

---

This documentation provides a complete overview of your blog application's architecture, implementation, and structure for performance optimization with Claude AI.
