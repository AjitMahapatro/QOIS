#!/bin/bash

echo "🚀 AUTO DEPLOYMENT SCRIPT - QOIS"
echo "=================================="

# Step 1: Set permanent environment variables
echo "📝 Setting up environment variables..."

# Backend .env file
cat > backend/.env << EOF
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://qois.vercel.app
BE_BASE_URL=https://qois-backend.onrender.com
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=super_secret_jwt_key_$(date +%s)
JWT_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ajitmahapatro12@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
FROM_NAME=Quantum Job Tracker
FROM_EMAIL=ajitmahapatro12@gmail.com
RUN_WORKER=true
EOF

# Frontend .env file
cat > frontend/.env << EOF
VITE_API_URL=https://qois-backend.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF

echo "✅ Environment files created"

# Step 2: Commit and push
echo "📤 Committing changes..."
git add .
git commit -m "Auto-deploy: Fix environment variables and CORS"
git push

echo "✅ Code pushed to GitHub"

# Step 3: Instructions for manual steps
echo ""
echo "🔧 MANUAL STEPS (Do these ONCE):"
echo "=================================="
echo ""
echo "1️⃣ VERCEL:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Your project → Settings → Domains"
echo "   - Add domain: qois.vercel.app"
echo "   - Add environment variable: VITE_API_URL=https://qois-backend.onrender.com"
echo ""
echo "2️⃣ RENDER:"
echo "   - Go to: https://render.com/dashboard"
echo "   - Your backend service → Environment"
echo "   - Add ALL variables from backend/.env file"
echo "   - Click 'Manual Deploy'"
echo ""
echo "3️⃣ GMAIL:"
echo "   - Enable 2-Step Verification"
echo "   - Generate App Password"
echo "   - Replace 'YOUR_GMAIL_APP_PASSWORD_HERE' in Render"
echo ""
echo "4️⃣ MONGODB:"
echo "   - Create free cluster at: https://mongodb.com/atlas"
echo "   - Get connection string"
echo "   - Replace MONGO_URI in Render"
echo ""
echo "🎯 YOUR APP WILL WORK AT: https://qois.vercel.app"
echo ""
echo "⚡  After these steps, your deployment is DONE!"
