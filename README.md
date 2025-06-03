# Social Media Manager - Multi-Company Platform

A comprehensive social media management platform designed for marketing professionals who handle multiple client companies. Features AI-powered content generation, human approval workflows, and automated Facebook posting.

## 🚀 Features

### Core Functionality
- **Multi-Company Management**: Handle up to 10+ client companies with complete isolation
- **AI Content Generation**: Google Gemini AI integration for brand-aware post creation
- **Human Approval Workflow**: Mandatory review system for all AI-generated content
- **Facebook Integration**: Real Facebook Graph API v18.0+ with OAuth flow
- **Automated Scheduling**: Intelligent posting with timezone support
- **Performance Analytics**: Real-time engagement tracking and reporting

### Security & Authentication
- **Secure Authentication**: Iron Session with JWT tokens
- **Encrypted Token Storage**: Facebook access tokens encrypted at rest
- **Role-Based Access**: Admin, Manager, and Viewer permissions
- **Session Management**: Secure cookie-based sessions

### Technical Excellence
- **Next.js 15**: Full-stack TypeScript application
- **PostgreSQL**: Robust database with Prisma ORM
- **Redis**: Caching and queue management
- **Railway Deployment**: Production-ready hosting
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
Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/social_media_manager"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
SESSION_SECRET="your-session-secret-key-here"

# Facebook App Configuration
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_REDIRECT_URI="https://your-app.railway.app/auth/facebook/callback"

# Google Gemini AI
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# Redis
REDIS_URL="redis://localhost:6379"

# Application
NEXTAUTH_URL="https://your-app.railway.app"
NEXTAUTH_SECRET="your-nextauth-secret"
NODE_ENV="production"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npm run db:deploy

# Start the application
npm run dev
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
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/logout
GET  /api/auth/me
```

### Company Management
```typescript
GET    /api/companies
POST   /api/companies
GET    /api/companies/[id]
PUT    /api/companies/[id]
DELETE /api/companies/[id]
```

### Content Operations
```typescript
POST /api/content/generate
GET  /api/posts
POST /api/posts/[id]/approve
PUT  /api/posts/[id]
```

## 🎯 Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Facebook app properly configured
- [ ] Gemini API key tested
- [ ] Redis connection verified

### Post-Deployment
- [ ] User registration working
- [ ] Facebook OAuth flow functional
- [ ] Content generation operational
- [ ] Approval workflow tested
- [ ] Scheduled posting verified

---

Built with ❤️ for social media marketing professionals who demand excellence in their tools.
