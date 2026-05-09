@echo off
echo 🚀 AUTO DEPLOYMENT SCRIPT - QOIS
echo ==================================

echo 📝 Setting up environment variables...

echo Backend .env file created
(
echo NODE_ENV=production
echo PORT=10000
echo FRONTEND_URL=https://qois.vercel.app
echo BE_BASE_URL=https://qois-backend.onrender.com
echo MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
echo JWT_SECRET=super_secret_jwt_key_%random%
echo JWT_EXPIRE=30d
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=ajitmahapatro12@gmail.com
echo SMTP_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
echo FROM_NAME=Quantum Job Tracker
echo FROM_EMAIL=ajitmahapatro12@gmail.com
echo RUN_WORKER=true
) > backend\.env

echo Frontend .env file created
(
echo VITE_API_URL=https://qois-backend.onrender.com
echo VITE_FIREBASE_API_KEY=your_firebase_api_key
echo VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
echo VITE_FIREBASE_PROJECT_ID=your_project_id
echo VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
echo VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
echo VITE_FIREBASE_APP_ID=your_app_id
) > frontend\.env

echo ✅ Environment files created

echo 📤 Committing changes...
git add .
git commit -m "Auto-deploy: Fix environment variables and CORS"
git push

echo ✅ Code pushed to GitHub

echo.
echo 🔧 MANUAL STEPS (Do these ONCE):
echo ==================================
echo.
echo 1️⃣ VERCEL:
echo    - Go to: https://vercel.com/dashboard
echo    - Your project → Settings → Domains
echo    - Add domain: qois.vercel.app
echo    - Add environment variable: VITE_API_URL=https://qois-backend.onrender.com
echo.
echo 2️⃣ RENDER:
echo    - Go to: https://render.com/dashboard
echo    - Your backend service → Environment
echo    - Add ALL variables from backend\.env file
echo    - Click 'Manual Deploy'
echo.
echo 3️⃣ GMAIL:
echo    - Enable 2-Step Verification
echo    - Generate App Password
echo    - Replace YOUR_GMAIL_APP_PASSWORD_HERE in Render
echo.
echo 4️⃣ MONGODB:
echo    - Create free cluster at: https://mongodb.com/atlas
echo    - Get connection string
echo    - Replace MONGO_URI in Render
echo.
echo 🎯 YOUR APP WILL WORK AT: https://qois.vercel.app
echo.
echo ⚡  After these steps, your deployment is DONE!
pause
