# 🚀 Deployment Guide

This guide covers deploying the Indiya Restaurant application to production.

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change default admin credentials
- [ ] Update JWT_SECRET to a strong random string
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domains only
- [ ] Review and secure all API endpoints
- [ ] Enable rate limiting
- [ ] Set secure cookie flags

### Environment Variables
- [ ] All production environment variables set
- [ ] MongoDB connection string updated
- [ ] Stripe keys switched to live mode
- [ ] Email credentials configured
- [ ] Google OAuth redirect URIs updated

### Code
- [ ] Remove console.logs from production code
- [ ] Run production build and test
- [ ] Check for TypeScript errors
- [ ] Run linting
- [ ] Optimize images and assets

### Database
- [ ] MongoDB Atlas cluster configured
- [ ] Database indexes created
- [ ] Backup strategy in place
- [ ] Connection pooling configured

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
vercel --prod
```

4. **Environment Variables**
Set in Vercel Dashboard:
- `VITE_API_URL` - Your backend API URL
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

### Option 2: Netlify

1. **Build the project**
```bash
npm run build
```

2. **Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Configure in netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Manual Deployment

1. Build: `npm run build`
2. Upload `dist/` folder to your web server
3. Configure web server to serve `index.html` for all routes

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway account** at railway.app

2. **Create new project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

3. **Set Environment Variables** in Railway Dashboard:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_jwt_secret
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=production
```

4. **Configure Start Command**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Option 2: Render

1. **Create Render account** at render.com

2. **Create Web Service**
- Connect your GitHub repository
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

3. **Set Environment Variables** in Render Dashboard

### Option 3: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login and create app**
```bash
heroku login
heroku create your-app-name
```

3. **Set environment variables**
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set all other variables
```

4. **Deploy**
```bash
git subtree push --prefix server heroku main
```

### Option 4: VPS (DigitalOcean, AWS, etc.)

1. **SSH into your server**
```bash
ssh user@your-server-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2**
```bash
sudo npm install -g pm2
```

4. **Clone and setup**
```bash
git clone your-repo-url
cd your-repo/server
npm install
```

5. **Create .env file**
```bash
nano .env
# Add all environment variables
```

6. **Start with PM2**
```bash
pm2 start server.js --name "indiya-api"
pm2 startup
pm2 save
```

7. **Setup Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🗄️ Database Setup

### MongoDB Atlas

1. **Create Cluster**
- Go to mongodb.com/cloud/atlas
- Create a free cluster
- Choose a region close to your users

2. **Configure Network Access**
- Add IP: `0.0.0.0/0` (allow from anywhere)
- Or add specific IPs of your hosting providers

3. **Create Database User**
- Username: `indiya_admin`
- Password: Generate strong password
- Role: `readWrite` on your database

4. **Get Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/indiya_restaurant?retryWrites=true&w=majority
```

5. **Create Indexes** (for performance)
```javascript
// In MongoDB Compass or Atlas UI
db.menu_items.createIndex({ category: 1, isActive: 1 })
db.orders.createIndex({ status: 1, createdAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
db.reservations.createIndex({ date: 1, status: 1 })
```

## 🔐 SSL/HTTPS Setup

### Using Cloudflare (Free)
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### Using Let's Encrypt (VPS)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_STRIPE_PUBLIC_KEY: ${{ secrets.VITE_STRIPE_PUBLIC_KEY }}
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

## 📊 Monitoring

### Error Tracking
- **Sentry**: Add error tracking
```bash
npm install @sentry/react @sentry/node
```

### Performance Monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure monitoring

### Uptime Monitoring
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring

## 🔧 Post-Deployment

1. **Test all features**
   - User registration/login
   - Menu browsing
   - Cart and checkout
   - Payment processing
   - Order management
   - Admin dashboard

2. **Monitor logs**
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# PM2
pm2 logs
```

3. **Setup backups**
   - MongoDB Atlas automatic backups
   - Database export scripts
   - Code repository backups

4. **Performance optimization**
   - Enable CDN for static assets
   - Implement caching strategies
   - Optimize images
   - Enable gzip compression

## 🆘 Troubleshooting

### Common Issues

**CORS Errors**
```javascript
// server/server.js
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

**Environment Variables Not Loading**
- Check variable names match exactly
- Restart the server after changes
- Verify in hosting dashboard

**Database Connection Fails**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check network access settings

**Build Fails**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Review build logs for specific errors

## 📞 Support

For deployment issues:
1. Check hosting provider documentation
2. Review application logs
3. Test locally with production build
4. Contact hosting support if needed

---

**Ready to launch! 🚀**
