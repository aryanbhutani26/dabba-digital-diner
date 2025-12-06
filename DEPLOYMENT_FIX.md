# 🔧 Fix Deployment Issues - Frontend & Backend Connection

## 🚨 Current Issues

1. **404 Errors** - API endpoints not found
2. **Double Slash in URLs** - `/api//navbar` instead of `/api/navbar`
3. **CORS might need configuration**

## ✅ Step-by-Step Fix

### Step 1: Fix Vercel Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find `VITE_API_URL`
4. Update it to:

```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important Notes:**
- ✅ Must end with `/api` (NO trailing slash)
- ✅ Must be your actual Render backend URL
- ❌ Do NOT add `/api/` (with trailing slash)
- ❌ Do NOT use just the domain without `/api`

**Example:**
```
VITE_API_URL=https://indiya-restaurant-api.onrender.com/api
```

### Step 2: Update Backend CORS

The backend has been updated to accept your Vercel domain. Now you need to:

1. **Add environment variable to Render:**
   - Go to your Render dashboard
   - Navigate to your backend service
   - Go to **Environment** tab
   - Add new variable:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Replace with your actual Vercel URL

2. **Update the CORS origins in code:**
   - The `backend/server.js` has been updated
   - Replace `'https://your-app.vercel.app'` with your actual Vercel URL
   - Commit and push the changes:
     ```bash
     git add backend/server.js
     git commit -m "Update CORS for production"
     git push
     ```

### Step 3: Redeploy

1. **Redeploy Frontend (Vercel):**
   - After updating environment variables in Vercel
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger auto-deploy

2. **Redeploy Backend (Render):**
   - After pushing the CORS changes
   - Render will auto-deploy
   - Or manually trigger deploy from Render dashboard

### Step 4: Verify

1. **Check Backend Health:**
   ```
   https://your-backend.onrender.com/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "message": "Server is running"
   }
   ```

2. **Check API Endpoint:**
   ```
   https://your-backend.onrender.com/api/navbar
   ```
   Should return navbar items (might be empty array)

3. **Check Frontend:**
   - Open your Vercel app
   - Open browser DevTools (F12)
   - Go to **Network** tab
   - Refresh the page
   - Check API calls - should be 200 OK, not 404

## 🔍 Troubleshooting

### Issue: Still getting 404 errors

**Check:**
1. Is `VITE_API_URL` correct in Vercel?
2. Does it end with `/api` (no trailing slash)?
3. Did you redeploy after changing environment variables?

**Test:**
```bash
# Check what URL the frontend is using
# Open browser console and type:
console.log(import.meta.env.VITE_API_URL)
```

### Issue: CORS errors

**Symptoms:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Fix:**
1. Make sure `FRONTEND_URL` is set in Render
2. Make sure the Vercel URL in `backend/server.js` matches your actual URL
3. Redeploy backend after changes

### Issue: Environment variables not updating

**Vercel:**
- Environment variables only apply to NEW deployments
- After changing variables, you MUST redeploy
- Go to Deployments → Click "Redeploy"

**Render:**
- Environment variables apply immediately
- But you may need to restart the service
- Go to your service → Click "Manual Deploy" → "Deploy latest commit"

## 📝 Quick Reference

### Correct Environment Variables

**Vercel (Frontend):**
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_your_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Render (Backend):**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_live_your_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=https://your-app.vercel.app
```

### Backend CORS Configuration

In `backend/server.js`, update this line:
```javascript
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://your-actual-vercel-app.vercel.app', // ← Update this!
  process.env.FRONTEND_URL
].filter(Boolean);
```

## ✅ Checklist

- [ ] Updated `VITE_API_URL` in Vercel (ends with `/api`, no trailing slash)
- [ ] Added `FRONTEND_URL` to Render environment variables
- [ ] Updated CORS origins in `backend/server.js`
- [ ] Committed and pushed backend changes
- [ ] Redeployed frontend on Vercel
- [ ] Verified backend health endpoint works
- [ ] Verified API endpoints return data (not 404)
- [ ] Tested frontend - no CORS errors
- [ ] Tested a full user flow (browse menu, add to cart, etc.)

## 🎯 Expected Results

After following these steps:

✅ No 404 errors
✅ No CORS errors
✅ API calls succeed
✅ Frontend can fetch data from backend
✅ All features work end-to-end

---

**Need more help?** Check the browser console for specific error messages and share them!
