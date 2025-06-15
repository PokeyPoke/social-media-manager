# Gemini API Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API key"**
3. Select **"Create API key in new project"** (or use existing project)
4. Copy the API key (it starts with `AIza...`)

### Step 2: Add to Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. Click **"New Variable"**
5. Add:
   - Variable name: `GOOGLE_GEMINI_API_KEY`
   - Value: `AIza...` (your API key from step 1)
6. Click **"Add"**
7. Railway will automatically redeploy

### Step 3: Verify It's Working

After deployment (1-2 minutes), test by creating content:
1. Create a company
2. Create a campaign
3. Generate content - it should now use real AI!

## Free Tier Limits

### Gemini 2.0 Flash (Latest Model - Now configured)
- **1 million tokens per minute** (free)
- **15 million tokens per day** (free)
- Latest and most capable model
- Perfect for social media content generation
- Fast response times

### Gemini Pro (Fallback)
- 60 requests per day (very limited)
- 60 requests per minute

## Troubleshooting

### "API key not valid" Error
- Make sure you copied the entire key (39 characters, starts with AIza)
- Check there are no spaces before/after the key
- Try creating a new key if the first one doesn't work

### "Quota exceeded" Error
- You've hit the daily limit (rare with 15K limit)
- Wait until tomorrow (quotas reset at midnight Pacific Time)
- Or upgrade to paid tier for unlimited requests

### Still Using Fallback Templates?
Check Railway logs for:
- "Valid Gemini API key not found" - API key not set properly
- "Gemini AI initialized with gemini-1.5-flash model" - Success!

## Testing Your API Key Locally

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Write a social media post about AI"
      }]
    }]
  }'
```

## Cost (Important!)

- **Free Tier**: 15,000 requests/day = ~500 posts/day
- **No credit card required**
- **No charges** unless you explicitly upgrade

## Next Steps

1. Get your API key (2 minutes)
2. Add to Railway (1 minute)
3. Start generating AI content!

The system will automatically fall back to templates if there are any issues, so your content generation will never fail.

## Advanced: Using OpenAI Instead

If you prefer OpenAI:
1. Get API key from https://platform.openai.com/api-keys
2. We can modify the code to use OpenAI's GPT-3.5/GPT-4
3. OpenAI costs ~$0.002 per post (not free)

Gemini 1.5 Flash is recommended because:
- Completely free
- High daily limits (15K requests)
- Excellent for social media content
- No credit card needed