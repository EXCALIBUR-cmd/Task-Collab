# Deployment Guide - Render

This guide will help you deploy the Task Collaboration Platform to Render.

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Git** - Ensure your code is committed and pushed to GitHub

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all your code is committed:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. The following files have been created for deployment:
   - `render.yaml` - Render Blueprint configuration
   - `frontend/.env.production` - Frontend production environment variables
   - `frontend/.env.example` - Frontend environment template
   - `backend/.env.example` - Backend environment template

### Step 2: Deploy to Render

#### Option A: Deploy with Blueprint (Recommended - Easiest)

This will deploy everything (backend, frontend, and database) in one go:

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"** to deploy all services
6. Wait 5-10 minutes for deployment to complete

#### Option B: Manual Deployment

If you prefer to deploy services individually:

##### Deploy Database First:
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `taskcollab-db`
3. Database: `taskcollab`
4. User: `taskcollab`
5. Plan: **Free**
6. Click **"Create Database"**
7. Copy the **Internal Database URL** (starts with `postgresql://`)

##### Deploy Backend:
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `taskcollab-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run migrate`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DATABASE_URL` = [Paste Internal Database URL from database]
   - `JWT_SECRET` = [Generate a random string - at least 32 characters]
   - `FRONTEND_URL` = `https://taskcollab-frontend.onrender.com` (will be your frontend URL)
5. Click **"Create Web Service"**
6. Copy the backend URL (e.g., `https://taskcollab-backend.onrender.com`)

##### Deploy Frontend:
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `taskcollab-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free
4. Add Environment Variables:
   - `REACT_APP_API_URL` = [Paste backend URL from previous step]
   - `REACT_APP_WS_URL` = [Same backend URL]
5. Click **"Create Static Site"**

##### Update Backend FRONTEND_URL:
1. Go back to your backend service
2. Update `FRONTEND_URL` environment variable with your actual frontend URL
3. Save and redeploy

### Step 3: Verify Deployment

1. Visit your frontend URL (e.g., `https://taskcollab-frontend.onrender.com`)
2. Test the following:
   - Sign up for a new account
   - Create a board
   - Create lists and tasks
   - Test drag-and-drop functionality
   - Test real-time updates (open in two browser tabs)
   - Assign users to tasks

## Important Notes

### Free Tier Limitations

Render's free tier has some limitations:
- **Spin down after inactivity**: Services sleep after 15 minutes of inactivity
- **First request after sleep**: Takes 30-60 seconds to wake up
- **Database**: 90 days of inactivity will pause the database (but it's plenty for testing)

### Custom Domain (Optional)

To add a custom domain:
1. Go to your service settings
2. Click **"Custom Domain"**
3. Follow the instructions to configure DNS

### Environment Variables

You can update environment variables anytime:
1. Go to service → **"Environment"** tab
2. Add/Edit variables
3. Click **"Save Changes"** (will trigger redeployment)

### Monitoring

Monitor your services:
- **Logs**: Click service → **"Logs"** tab to see real-time logs
- **Metrics**: View CPU, memory, and request metrics
- **Events**: See deployment history and events

## Troubleshooting

### Issue: "Cannot connect to database"
- Verify `DATABASE_URL` is correctly set in backend environment variables
- Ensure database service is running

### Issue: "CORS error" in browser console
- Verify `FRONTEND_URL` in backend matches your actual frontend URL
- Check that both services are deployed and running

### Issue: "Socket.io connection failed"
- Verify `REACT_APP_WS_URL` matches your backend URL
- Render supports WebSockets natively, no special configuration needed

### Issue: "Module not found" errors
- Check that all dependencies are in `package.json`
- Verify build commands are correct in render.yaml

### Issue: First load is very slow
- This is expected on free tier after inactivity
- Services "wake up" on first request (30-60 seconds)
- Consider upgrading to paid tier for always-on services

## Costs

- **Current Setup**: $0/month (all free tier)
- **Upgrade Options**:
  - Backend/Frontend: $7/month each for always-on
  - Database: $7/month for 1GB RAM, better performance

## Next Steps

After successful deployment:
1. Share your app URL with users
2. Monitor logs for any issues
3. Consider setting up a custom domain
4. Optionally upgrade services for better performance

## Support

- **Render Docs**: https://render.com/docs
- **Community Forum**: https://community.render.com
- **Status Page**: https://status.render.com

---

**Your URLs** (update these after deployment):
- Frontend: `https://taskcollab-frontend.onrender.com`
- Backend API: `https://taskcollab-backend.onrender.com`
- Database: Internal access only (connected to backend automatically)
