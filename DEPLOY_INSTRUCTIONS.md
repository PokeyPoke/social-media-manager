# Step-by-Step Deployment Instructions

## Prerequisites You Need

1. **Railway Account**: Sign up at railway.app
2. **GitHub Account**: To host the code
3. **Facebook Developer Account**: For Facebook App credentials
4. **Google Cloud Account**: For Gemini API key

## Step 1: Get API Keys

### Facebook App Setup
1. Go to developers.facebook.com
2. Create New App → Business → Continue
3. Add Facebook Login product
4. Configure OAuth redirect: `https://your-app.railway.app/auth/facebook/callback`
5. Copy App ID and App Secret

### Google Gemini API
1. Go to console.cloud.google.com
2. Enable "Generative Language API"
3. Create API key
4. Copy the API key

## Step 2: Deploy to Railway

### Option A: GitHub Integration (Recommended)
1. Push this code to GitHub repository
2. Go to railway.app → New Project
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-deploy

### Option B: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# In project directory
railway login
railway init
railway up
```

## Step 3: Add Database Services

In Railway dashboard:
1. Click "+ New Service"
2. Add PostgreSQL
3. Add Redis
4. Note the connection URLs

## Step 4: Configure Environment Variables

In Railway dashboard → Variables tab, add:

```
DATABASE_URL=<Railway PostgreSQL URL>
REDIS_URL=<Railway Redis URL>
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
FACEBOOK_REDIRECT_URI=https://<your-app-url>.railway.app/auth/facebook/callback
GOOGLE_GEMINI_API_KEY=<your-gemini-api-key>
NEXTAUTH_URL=https://<your-app-url>.railway.app
NEXTAUTH_SECRET=<generate-random-secret>
NODE_ENV=production
```

## Step 5: Run Database Migration

In Railway dashboard → Deployments → Click latest deployment → Terminal:
```bash
npm run db:deploy
```

## Step 6: Update Facebook App

1. Go back to Facebook Developer Console
2. Update OAuth redirect URI with your actual Railway URL
3. Test the OAuth flow

## Troubleshooting

**Build Fails?**
- Check environment variables are set
- Ensure DATABASE_URL is correct

**Facebook OAuth Not Working?**
- Verify redirect URI matches exactly
- Check app is in "Live" mode

**Database Issues?**
- Run migration: `railway run npm run db:deploy`
- Check PostgreSQL service is running

## Expected Result

After successful deployment:
- ✅ User registration/login works
- ✅ Company management functional
- ✅ Facebook OAuth connects pages
- ✅ AI content generation works
- ✅ Approval workflow operational

**Estimated Time**: 30-45 minutes
**Monthly Cost**: ~$13 (Railway services)