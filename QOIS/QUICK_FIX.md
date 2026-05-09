# QUICK FIX - DO THIS NOW

## STEP 1: VERCEL (2 minutes)
1. Go to: https://vercel.com/dashboard
2. Your project → Settings → Domains
3. Add domain: `qois.vercel.app`
4. Environment variables → Add: `VITE_API_URL=https://qois-backend.onrender.com`

## STEP 2: RENDER (3 minutes)
1. Go to: https://render.com/dashboard
2. Your backend service → Environment
3. Add these EXACT values:

```
FRONTEND_URL=https://qois.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ajitmahapatro12@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_NAME=Quantum Job Tracker
FROM_EMAIL=ajitmahapatro12@gmail.com
NODE_ENV=production
PORT=10000
JWT_SECRET=super_secret_key_12345
RUN_WORKER=true
MONGO_URI=your_mongodb_connection_string
```

4. Click "Manual Deploy"

## STEP 3: GMAIL (2 minutes)
1. Google Account → Security → 2-Step Verification
2. App passwords → Generate new
3. Use that 16-character password for SMTP_PASS

## STEP 4: MONGODB (2 minutes)
1. Go to: https://mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Add to MONGO_URI in Render

## THAT'S IT! 
Your app will work at: https://qois.vercel.app

**Execution engine will work after these steps.**
