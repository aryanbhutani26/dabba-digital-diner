# 🔍 Debug Login Issue

## Issue Description
Login button causes page refresh without completing authentication.

## Possible Causes

### 1. Backend Not Running ⚠️
**Most Likely Cause**

The backend server needs to be running for login to work.

**Check:**
```bash
# Open http://localhost:5000/health in browser
# Should return: {"status":"ok","message":"Server is running"}
```

**Fix:**
```bash
cd server
npm run dev
```

### 2. CORS Issues
If backend is running but requests fail.

**Check browser console for:**
- "CORS policy" errors
- "Failed to fetch" errors
- Network errors

### 3. MongoDB Not Connected
Backend starts but can't connect to database.

**Check backend terminal for:**
- "MongoDB Connected Successfully" ✅
- "MongoDB Connection Error" ❌

---

## 🔧 Step-by-Step Debug

### Step 1: Check Backend Status

**Open a terminal and run:**
```bash
cd server
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

**If you see errors:**
- Check `server/.env` has correct MongoDB URI
- Verify MongoDB Atlas IP whitelist
- Check if port 5000 is available

### Step 2: Test Backend API

**Open browser and go to:**
```
http://localhost:5000/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

**If page doesn't load:**
- Backend is not running
- Port 5000 is blocked
- Wrong URL

### Step 3: Test Login API Directly

**Open browser console (F12) and run:**
```javascript
fetch('http://localhost:5000/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@indiya.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@indiya.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**If you get an error:**
- "Failed to fetch" = Backend not running
- "Invalid credentials" = Wrong email/password or database not seeded
- "CORS error" = CORS configuration issue

### Step 4: Check Browser Console

**When you click Sign In, check browser console (F12) for:**

**Network Tab:**
- Look for request to `http://localhost:5000/api/auth/signin`
- Check if request is sent
- Check response status (200 = success, 401 = wrong credentials, 500 = server error)

**Console Tab:**
- Look for error messages
- Check for "Failed to fetch" or CORS errors

---

## 🎯 Quick Fix Checklist

- [ ] Backend server is running (`cd server && npm run dev`)
- [ ] Backend shows "MongoDB Connected Successfully"
- [ ] `http://localhost:5000/health` returns success
- [ ] Database is seeded (`npm run seed` in server folder)
- [ ] Admin user exists (email: admin@indiya.com, password: admin123)
- [ ] Frontend `.env` has `VITE_API_URL=http://localhost:5000/api`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows request to `/api/auth/signin`

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause:** Backend not running  
**Fix:** Start backend with `cd server && npm run dev`

### Issue: "Invalid credentials"
**Cause:** Database not seeded or wrong password  
**Fix:** Run `npm run seed` in server folder

### Issue: Page refreshes immediately
**Cause:** Form submission without preventDefault (FIXED in latest code)  
**Fix:** Already fixed in Auth.tsx

### Issue: "Cannot connect to server"
**Cause:** Backend not running or wrong URL  
**Fix:** 
1. Start backend: `cd server && npm run dev`
2. Check `.env` has correct `VITE_API_URL`

### Issue: CORS error
**Cause:** Backend CORS not configured for frontend  
**Fix:** Backend already has CORS enabled, restart backend

---

## 📝 Testing Steps

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```
   Wait for "MongoDB Connected Successfully"

2. **Start Frontend:**
   ```bash
   # In new terminal
   npm run dev
   ```

3. **Test Login:**
   - Go to http://localhost:8080/auth
   - Enter email: `admin@indiya.com`
   - Enter password: `admin123`
   - Click "Sign In"
   - Check browser console (F12) for errors

4. **Expected Behavior:**
   - Toast notification: "Welcome back!"
   - Redirect to homepage
   - Navbar shows admin icon (settings)

---

## 🆘 Still Not Working?

### Check These:

1. **Backend Terminal Output:**
   ```
   ✅ MongoDB Connected Successfully
   🚀 Server running on port 5000
   ```

2. **Browser Console (F12):**
   - No red errors
   - Network tab shows successful POST to `/api/auth/signin`

3. **Database:**
   - MongoDB Atlas cluster is running
   - IP is whitelisted
   - User has correct permissions

### Get More Info:

**Check backend logs when you click Sign In:**
- Backend terminal should show the request
- Look for any error messages

**Check browser network tab:**
- Request URL should be `http://localhost:5000/api/auth/signin`
- Request method should be POST
- Request payload should have email and password
- Response should have token and user

---

## ✅ Verification

After fixing, verify:
- [ ] Can sign in with admin@indiya.com / admin123
- [ ] Redirects to homepage after login
- [ ] Navbar shows admin icon (settings)
- [ ] Can access /admin page
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## 💡 Most Common Solution

**90% of the time, the issue is:**

**Backend is not running!**

**Fix:**
```bash
cd server
npm install  # If not done yet
npm run seed # If not done yet
npm run dev  # Start the server
```

Then try logging in again.
