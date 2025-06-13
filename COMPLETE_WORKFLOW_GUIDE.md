# Complete Social Media Manager Workflow Guide

This guide provides a comprehensive step-by-step walkthrough for using the Social Media Manager application, from initial setup through automated Facebook posting.

## Prerequisites

- A Facebook Page (not personal profile)
- Facebook Developer account
- Access to the Social Media Manager application

## Step 1: Facebook Developer Setup (Required for Each Company)

### 1.1 Create Facebook App
1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Click "Create App" 
3. Select "Business" as the app type
4. Fill in app details:
   - App Name: "Your Company Social Media Manager"
   - Contact Email: Your email
   - Business Account: Select your business account

### 1.2 Configure App Permissions
1. In your app dashboard, go to "Add Products"
2. Add "Facebook Login" product
3. Go to Facebook Login → Settings
4. Add your domain to "Valid OAuth Redirect URIs":
   - For production: `https://yourdomain.com/api/auth/facebook/callback`
   - For development: `http://localhost:3000/api/auth/facebook/callback`

### 1.3 Get Facebook Page ID
1. Go to your Facebook Page
2. Click "About" in the left sidebar
3. Scroll down to find "Page ID" 
4. Copy this number (e.g., "123456789012345")

### 1.4 Generate Page Access Token
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Select required permissions:
   - `pages_read_engagement`
   - `pages_manage_posts` 
   - `pages_show_list`
5. Click "Generate Access Token" and authorize
6. **Important**: Get a long-lived token by making this request:
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}
   ```
7. Use the returned long-lived token for the application

### 1.5 Set Page Token (Critical Step)
1. In Graph API Explorer, use the long-lived token
2. Make a GET request to `/me/accounts`
3. Find your page in the response
4. Copy the `access_token` for your specific page (this is the Page Access Token you'll use)

## Step 2: Adding a Company

### 2.1 Navigate to Company Creation
1. Log into the Social Media Manager application
2. Go to Dashboard
3. Click "Add New Company" or navigate to `/companies/new`

### 2.2 Fill Company Information
1. **Company Name**: Enter your company name (required)
2. **Timezone**: Select appropriate timezone for scheduling

### 2.3 Facebook Integration (Required for Auto-posting)
1. **Facebook Page ID**: Enter the Page ID from Step 1.3
2. **Page Access Token**: Enter the Page Access Token from Step 1.5
   - This will be encrypted and stored securely
   - The system will test the token before saving

### 2.4 Brand Settings (Required)
1. **Brand Voice**: Select from professional, casual, friendly, or authoritative
2. **Brand Tone**: Enter specific tone (e.g., "inspiring", "helpful")
3. **Target Audience**: Detailed description (required)
   - Example: "Young professionals aged 25-35 interested in technology"
4. **Content Themes**: Comma-separated themes
   - Example: "innovation, sustainability, customer success"
5. **Posting Guidelines**: Specific content rules
   - Example: "Always include call-to-action, avoid controversial topics"

### 2.5 Default Instructions
1. Enter default AI content generation instructions
2. These apply to all content created for this company

### 2.6 Save Company
1. Click "Create Company"
2. System will validate Facebook credentials
3. If successful, you'll be redirected to the company page

## Step 3: Creating a Campaign

### 3.1 Navigate to Campaign Creation
1. From Dashboard, click "Create Campaign"
2. Or navigate to `/campaigns/new`

### 3.2 Campaign Information
1. **Campaign Name**: Enter descriptive name (required)
   - Example: "Holiday Season 2024"
2. **Company**: Select the company you created (required)
3. **Description**: Optional campaign description
4. **Campaign Theme**: Specific theme for this campaign
   - Example: "Product Launch", "Brand Awareness"

### 3.3 Content Strategy
1. **Post Frequency**: Select daily, weekly, bi-weekly, or monthly
2. **Max Post Length**: Set character limit (100-500)
3. **Preferred Post Times**: Comma-separated times
   - Example: "09:00, 13:00, 17:00"
4. **Content Types**: Comma-separated types
   - Example: "promotional, educational, engaging"
5. **Include Hashtags**: Check if hashtags should be included
6. **Include Emojis**: Check if emojis should be included

### 3.4 Schedule Settings
1. **Timezone**: Automatically set from company timezone
2. **Start Time**: Earliest posting time
3. **End Time**: Latest posting time  
4. **Active Days**: Select days of week for posting
   - Check boxes for Monday-Sunday

### 3.5 Save Campaign
1. Click "Create Campaign"
2. You'll be redirected to the campaign page

## Step 4: Content Generation and Management

### 4.1 Automatic Content Generation
- The system automatically generates content using Google Gemini AI
- Content is created based on:
  - Company brand settings
  - Campaign theme and strategy
  - Content types specified
  - Target audience

### 4.2 Content Review Process
1. Go to campaign page to see generated posts
2. Posts start in "DRAFT" status
3. Review AI-generated content
4. Edit content if needed
5. Approve posts to change status to "PENDING_APPROVAL"

### 4.3 Post Approval Workflow
1. **DRAFT**: Initial AI-generated content
2. **PENDING_APPROVAL**: Ready for final approval
3. **APPROVED**: Approved for scheduling
4. **SCHEDULED**: Queued for posting at specific time
5. **POSTED**: Successfully posted to Facebook
6. **FAILED**: Failed to post (check logs)

## Step 5: Scheduling and Auto-posting

### 5.1 Manual Scheduling
1. In post management, select approved posts
2. Set specific posting times
3. Posts will be queued with "SCHEDULED" status

### 5.2 Automatic Scheduling
- Based on campaign content strategy
- Uses preferred post times and active days
- Respects start/end time constraints

### 5.3 Auto-posting Process
1. **Scheduled Job**: System runs `/api/jobs/post-scheduler`
2. **Token Decryption**: Safely decrypts Facebook tokens
3. **Content Preparation**: Formats post content
4. **Facebook API Call**: Posts to Facebook using Graph API
5. **Status Update**: Updates post status to "POSTED" or "FAILED"
6. **Engagement Tracking**: System can fetch engagement metrics

### 5.4 Monitoring Auto-posting
1. Check post statuses in campaign dashboard
2. "POSTED" status indicates successful posting
3. "FAILED" status requires investigation
4. Facebook Post IDs are stored for tracking

## Step 6: Analytics and Monitoring

### 6.1 Real-time Analytics
- Navigate to `/analytics` for comprehensive metrics
- Data includes:
  - Total posts published
  - Total engagement (likes, comments, shares)
  - Average engagement per post
  - Top performing posts
  - Company breakdown
  - Daily performance charts

### 6.2 Engagement Tracking
- System fetches engagement data from Facebook
- Metrics updated periodically
- Used for performance optimization

## Important Security Notes

1. **Token Storage**: All Facebook tokens are encrypted using AES-256-GCM
2. **Token Access**: Only decrypted when needed for posting
3. **Permissions**: Use minimal required Facebook permissions
4. **Environment Variables**: Store sensitive data in environment variables
5. **Token Expiration**: Monitor token expiration and renewal

## Troubleshooting Common Issues

### Facebook Token Issues
- **Invalid Token**: Regenerate Page Access Token
- **Permissions**: Verify all required permissions are granted
- **Page Access**: Ensure token has access to specific page

### Posting Failures
- Check Facebook API limits
- Verify content meets Facebook posting guidelines
- Confirm Page Access Token is still valid

### Content Generation Issues
- Verify Google Gemini API key is configured
- Check company brand settings are complete
- Ensure target audience is detailed enough

## Required Environment Variables

```
# Facebook Integration
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# Database
DATABASE_URL=your_postgresql_url
```

## API Endpoints Reference

- `POST /api/companies` - Create company
- `POST /api/campaigns` - Create campaign  
- `POST /api/content/generate` - Generate content
- `POST /api/posts` - Create/manage posts
- `POST /api/jobs/post-scheduler` - Auto-posting job
- `GET /api/analytics` - Analytics data

This guide provides every step required to successfully set up and use the automated social media posting system. Each company requires its own Facebook Page Access Token for independent posting capabilities.