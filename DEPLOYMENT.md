# Deployment Guide: Quantum Operational Intelligent System

## Overview
- **Frontend**: React + Vite (Deploy to Vercel)
- **Backend**: Node.js + Express + MongoDB (Deploy to Render)

## Step 1: Backend Deployment (Render)

### 1.1 Prepare Repository
1. Push your code to GitHub
2. Ensure `render.yaml` is in the root directory

### 1.2 Set up Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub account
3. Click "New +" → "Web Service"
4. Select your repository
5. Render will auto-detect the `render.yaml` configuration

### 1.3 Environment Variables (Render Dashboard)
Set these in your Render service environment variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT & Security
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-frontend.vercel.app

# Email Configuration (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Worker
RUN_WORKER=true
```

### 1.4 MongoDB Setup
1. Create a free MongoDB Atlas account
2. Create a cluster
3. Get your connection string
4. Add to Render environment variables

## Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Vercel
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub account
3. Click "Add New..." → "Project"

### 2.2 Import Project
1. Select your repository
2. Vercel will auto-detect it's a Vite project
3. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Environment Variables (Vercel Dashboard)
```bash
VITE_API_URL=https://your-backend-url.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 3: Update CORS and API URLs

### 3.1 Update Backend CORS
After getting your Vercel URL, update the `FRONTEND_URL` in Render environment variables.

### 3.2 Update Frontend API URL
In your frontend code, ensure API calls use the environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## Step 4: Deploy

### 4.1 Deploy Backend First
1. Push changes to GitHub
2. Render will auto-deploy
3. Wait for deployment to complete
4. Note your Render URL (e.g., `https://quantum-backend.onrender.com`)

### 4.2 Deploy Frontend
1. Update `VITE_API_URL` in Vercel with your Render URL
2. Vercel will auto-deploy
3. Update `FRONTEND_URL` in Render with your Vercel URL

## Step 5: Test Deployment

1. Visit your Vercel frontend URL
2. Test user registration/login
3. Test job tracking features
4. Check browser console for errors

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check that credentials are enabled in CORS config

**Database Connection**
- Verify MongoDB URI is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Check database user permissions

**Build Failures**
- Check build logs in Render/Vercel dashboards
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly

**API Calls Failing**
- Check that `VITE_API_URL` is set correctly
- Verify backend is running and accessible
- Check network tab in browser dev tools

### Environment Variable Checklist

**Render (Backend):**
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] FRONTEND_URL
- [ ] SMTP_HOST (if using email)
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] GOOGLE_CLIENT_ID (if using OAuth)
- [ ] GOOGLE_CLIENT_SECRET
- [ ] RUN_WORKER=true

**Vercel (Frontend):**
- [ ] VITE_API_URL
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID

## Post-Deployment

1. **Monitor Logs**: Check Render and Vercel dashboards for errors
2. **Test All Features**: Ensure all functionality works in production
3. **Set up Monitoring**: Consider error tracking services
4. **Backup Database**: Regular MongoDB backups
5. **Update Documentation**: Keep deployment docs current

## URLs After Deployment

- **Frontend**: `https://your-project-name.vercel.app`
- **Backend**: `https://your-service-name.onrender.com`
- **API Endpoints**: `https://your-service-name.onrender.com/api/...`
