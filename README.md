# Social Media Manager - Multi-Company Platform

A comprehensive, production-ready social media management platform designed for marketing professionals who handle multiple client companies. Features AI-powered content generation, human approval workflows, automated Facebook posting, and enterprise-grade security.

## 🚀 Features

### Core Functionality
- **Multi-Company Management**: Handle up to 10+ client companies with complete isolation
- **AI Content Generation**: Google Gemini AI integration for brand-aware post creation
- **Human Approval Workflow**: Mandatory review system for all AI-generated content
- **Facebook Integration**: Real Facebook Graph API v18.0+ with OAuth flow
- **Automated Scheduling**: Intelligent posting with timezone support
- **Performance Analytics**: Real-time engagement tracking and reporting
- **Advanced Pagination**: Efficient data loading with infinite scroll support

### Security & Authentication
- **Enterprise Security**: AES-256-GCM encryption for sensitive data
- **Secure Authentication**: Iron Session with JWT tokens and password hashing
- **Input Validation**: Comprehensive Zod schema validation for all endpoints
- **Rate Limiting**: Built-in protection against abuse and spam
- **Role-Based Access**: Admin, Manager, and Viewer permissions with middleware enforcement
- **Session Management**: Secure cookie-based sessions with automatic cleanup

### Technical Excellence
- **Next.js 15**: Full-stack TypeScript application with App Router
- **PostgreSQL**: Robust database with Prisma ORM and optimized queries
- **Redis**: Caching, rate limiting, and queue management
- **Centralized Error Handling**: Structured logging and error recovery
- **Reusable React Hooks**: Custom hooks for API interactions and state management
- **Railway Deployment**: Production-ready hosting with health checks
- **Responsive Design**: Mobile-first Tailwind CSS interface

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis instance
- Facebook App credentials
- Google Gemini API key

## 🛠 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd social-media-manager
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure all required variables:

**Critical Security Variables:**
```env
# Strong, unique secrets (use crypto.randomBytes(64).toString('hex'))
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
SESSION_SECRET="your-session-secret-key-minimum-32-characters"
```

**Database Connection:**
```env
# Local development
DATABASE_URL="postgresql://username:password@localhost:5432/social_media_manager"

# Production (Railway will auto-populate)
DATABASE_URL="postgresql://postgres:password@host:port/database"
```

**External Service Configuration:**
```env
# Facebook App (create at developers.facebook.com)
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_REDIRECT_URI="https://your-domain.com/api/auth/facebook/callback"

# Google Gemini AI (get from ai.google.dev)
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# Redis (optional for local dev)
REDIS_URL="redis://localhost:6379"
```

**Application Settings:**
```env
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"
NODE_ENV="development"  # Use "production" for deployment
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (creates tables)
npx prisma db push

# Optional: Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### 4. Development Commands
```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test

# Database operations
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset database (development only)
npm run db:deploy     # Deploy migrations (production)
```

## 🚀 Deployment

### Railway Deployment
1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Configure Services**
   - Add PostgreSQL service
   - Add Redis service
   - Configure environment variables

3. **Database Migration**
   ```bash
   railway run npm run db:deploy
   ```

## 📚 API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/login      # User login with email/password
POST /api/auth/register   # New user registration
POST /api/auth/logout     # User logout and session cleanup
GET  /api/auth/me        # Get current user profile
GET  /api/auth/facebook  # Facebook OAuth initiation
GET  /api/auth/facebook/callback  # Facebook OAuth callback
```

### Company Management
```typescript
GET    /api/companies           # List all companies (paginated)
POST   /api/companies           # Create new company
GET    /api/companies/[id]      # Get company details
PUT    /api/companies/[id]      # Update company
DELETE /api/companies/[id]      # Delete company
```

### Content & Posts
```typescript
POST /api/content/generate      # Generate AI content for posts
GET  /api/posts                # List posts (with pagination & filters)
POST /api/posts                # Create new post
GET  /api/posts/[id]           # Get post details
PUT  /api/posts/[id]           # Update post
POST /api/posts/[id]/approve   # Approve post for publishing
```

### Campaign Management
```typescript
GET    /api/campaigns           # List campaigns (paginated)
POST   /api/campaigns           # Create new campaign
GET    /api/campaigns/[id]      # Get campaign details
PUT    /api/campaigns/[id]      # Update campaign
DELETE /api/campaigns/[id]      # Delete campaign
```

### Health & Monitoring
```typescript
GET /api/health                # Comprehensive health check
GET /api/health/simple         # Simple health status
```

## 🔧 Custom Hooks & Frontend APIs

### Data Fetching Hooks
```typescript
// Generic API hook
const { data, loading, error, refetch } = useApi<User>('/api/auth/me')

// Paginated data with infinite scroll
const { data, loading, loadMore, hasMore } = usePaginatedApi<Post>('/api/posts')

// Mutations for create/update operations
const [createPost, { loading, error }] = useMutation<Post, CreatePostData>('/api/posts')
```

### Specific Entity Hooks
```typescript
const user = useUser(userId)
const posts = usePosts({ status: 'PENDING', companyId: '123' })
const campaigns = useCampaigns({ active: true })
const companies = useCompanies()

// Authentication hooks
const [login] = useLogin()
const [register] = useRegister()
```

## 🎯 Production Checklist

### Pre-Deployment Security
- [ ] Strong JWT_SECRET and SESSION_SECRET generated (64+ characters)
- [ ] All environment variables configured and validated
- [ ] Database migrations completed successfully
- [ ] Input validation schemas implemented for all endpoints
- [ ] Rate limiting configured and tested
- [ ] CORS headers properly configured for production domain

### External Services
- [ ] Facebook app properly configured with correct callback URLs
- [ ] Facebook app reviewed and approved (if required)
- [ ] Gemini API key tested and quota verified
- [ ] Redis connection verified (for caching and rate limiting)
- [ ] Database connection pool configured for production load

### Post-Deployment Verification
- [ ] Health check endpoints responding (⚡ `/api/health`)
- [ ] User registration and login working
- [ ] Facebook OAuth flow functional
- [ ] AI content generation operational
- [ ] Human approval workflow tested
- [ ] Role-based access control verified
- [ ] Pagination working on large datasets
- [ ] Error handling and logging operational

### Performance & Monitoring
- [ ] Database queries optimized (check with Prisma Studio)
- [ ] Caching strategy implemented and verified
- [ ] API response times under 500ms
- [ ] Memory usage staying under Railway limits
- [ ] Error logging captured and monitored

## 🛡️ Security Features

### Data Protection
- **AES-256-GCM Encryption**: All sensitive data encrypted at rest
- **PBKDF2 Key Derivation**: Secure password hashing with salt
- **JWT Token Security**: Short-lived access tokens with refresh capability
- **Input Sanitization**: XSS and injection attack prevention

### Access Control
- **Role-Based Permissions**: Admin, Manager, Viewer access levels
- **Session Management**: Secure iron-session with automatic expiry
- **Rate Limiting**: API abuse protection with Redis backing
- **CSRF Protection**: Cross-site request forgery prevention

### Audit & Compliance
- **Request Logging**: All API calls logged with context
- **Error Tracking**: Structured error reporting and alerting
- **Data Validation**: Comprehensive Zod schema validation
- **Security Headers**: HSTS, CSP, and other protective headers

## 🏗️ Architecture Overview

### Backend Structure
```
lib/
├── auth.ts              # JWT authentication & user management
├── encryption.ts        # AES-256-GCM encryption utilities
├── validation.ts        # Zod schemas for input validation
├── middleware.ts        # Centralized request/response handling
├── error-handling.ts    # Structured error management
├── rate-limiting.ts     # API rate limiting with Redis
└── hooks/
    └── useApi.ts        # Reusable React hooks for API calls
```

### Database Design
- **Users**: Authentication, roles, and profile management
- **Companies**: Multi-tenant company isolation
- **Campaigns**: Marketing campaign organization
- **Posts**: Content lifecycle with approval workflow
- **Post Approvals**: Human review tracking
- **Post Revisions**: Content version history

### Security Layers
1. **Network**: HTTPS, security headers, CORS
2. **Application**: Input validation, rate limiting, authentication
3. **Database**: Encrypted fields, role-based access
4. **Session**: Secure cookies, automatic expiry

---

Built with ❤️ for social media marketing professionals who demand enterprise-grade security and performance.
