# Update DATABASE_URL in Railway Dashboard

To fix the database connection issue, you need to update the DATABASE_URL in the Railway dashboard:

1. Go to: https://railway.com/project/fbc12270-abfd-49c2-80f9-0d7adcd12cc3
2. Click on the "social-media-manager" service
3. Go to "Variables" tab
4. Update the DATABASE_URL to use the PUBLIC URL:

**Change FROM:**
```
DATABASE_URL=postgresql://postgres:GqSnBFAkrAFIvEqfgRBcAknSfYPRzXQl@postgres.railway.internal:5432/railway
```

**Change TO:**
```
DATABASE_URL=postgresql://postgres:GqSnBFAkrAFIvEqfgRBcAknSfYPRzXQl@caboose.proxy.rlwy.net:51183/railway
```

5. Save and let it redeploy

This uses the public proxy URL which is accessible during the build process, whereas the internal URL only works after deployment.