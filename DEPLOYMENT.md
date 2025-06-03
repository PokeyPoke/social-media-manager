# Deployment Guide

## Current Status
The project is **ready for deployment** but not currently deployed. All code and configuration files are complete.

## Quick Deploy to Railway

### 1. Prerequisites
- Railway account (railway.app)
- GitHub repository with this code
- Facebook App credentials
- Google Gemini API key

### 2. Deploy Steps

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 3. Configure Services

**Add PostgreSQL Database:**
```bash
railway add postgresql
```

**Add Redis:**
```bash
railway add redis
```

### 4. Environment Variables
Set these in Railway dashboard:

```
DATABASE_URL=<provided by Railway PostgreSQL>
REDIS_URL=<provided by Railway Redis>
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://your-app.railway.app/auth/facebook/callback
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production
```

### 5. Run Database Migration
```bash
railway run npm run db:deploy
```

## Alternative: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-username/social-media-manager)

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables set
- [ ] Facebook app redirect URI updated
- [ ] Test user registration
- [ ] Test Facebook OAuth flow
- [ ] Test content generation
- [ ] Verify scheduled posting

## Expected Costs

**Railway Pricing (Estimated):**
- Hobby Plan: $5/month
- PostgreSQL: $5/month
- Redis: $3/month
- **Total: ~$13/month**

## Domain Setup (Optional)

1. Purchase domain
2. Add custom domain in Railway
3. Update environment variables
4. Update Facebook app settings