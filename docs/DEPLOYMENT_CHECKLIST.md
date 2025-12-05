# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## 📋 Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Production build tested locally (`npm run build`)
- [ ] All features tested in development
- [ ] Console.logs removed from production code
- [ ] Error handling implemented
- [ ] Loading states added

### Security
- [ ] Default admin password changed
- [ ] JWT_SECRET is strong and unique
- [ ] API endpoints secured with authentication
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS protection enabled

### Environment Variables

#### Frontend (.env)
- [ ] `VITE_API_URL` - Production API URL
- [ ] `VITE_STRIPE_PUBLIC_KEY` - Live Stripe key
- [ ] `VITE_GOOGLE_CLIENT_ID` - Google OAuth ID

#### Backend (server/.env)
- [ ] `PORT` - Server port (usually 5000)
- [ ] `MONGODB_URI` - Production MongoDB connection
- [ ] `JWT_SECRET` - Strong random string
- [ ] `STRIPE_SECRET_KEY` - Live Stripe secret key
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `EMAIL_USER` - Email for notifications
- [ ] `EMAIL_PASS` - Email app password
- [ ] `NODE_ENV=production`

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string tested
- [ ] Indexes created for performance
- [ ] Initial data seeded (if needed)
- [ ] Backup strategy configured

### Third-Party Services

#### Stripe
- [ ] Account verified
- [ ] Live mode enabled
- [ ] Webhook endpoint configured
- [ ] Test payment successful
- [ ] Refund policy configured

#### Google OAuth (if using)
- [ ] OAuth consent screen configured
- [ ] Authorized redirect URIs updated
- [ ] Production domain added

#### Email Service
- [ ] SMTP credentials configured
- [ ] Test email sent successfully
- [ ] Email templates reviewed

## 🌐 Deployment

### Frontend Deployment

#### Vercel
- [ ] Project connected to Git repository
- [ ] Environment variables set
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Domain configured
- [ ] SSL certificate active

#### Netlify
- [ ] Site created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Redirects configured (_redirects or netlify.toml)
- [ ] Domain configured
- [ ] SSL certificate active

### Backend Deployment

#### Railway
- [ ] Project created
- [ ] GitHub repository connected
- [ ] Environment variables set
- [ ] Start command: `npm start`
- [ ] Domain configured
- [ ] Health check endpoint working

#### Render
- [ ] Web service created
- [ ] Root directory: `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables set
- [ ] Health check configured

#### VPS (DigitalOcean, AWS, etc.)
- [ ] Server provisioned
- [ ] Node.js installed
- [ ] PM2 installed and configured
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Firewall configured
- [ ] Auto-restart on reboot configured

## ✅ Post-Deployment

### Testing
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works (if enabled)
- [ ] Menu browsing works
- [ ] Add to cart works
- [ ] Checkout process works
- [ ] Payment processing works (test with real card)
- [ ] Order confirmation email received
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] Menu management works
- [ ] Order management works
- [ ] Delivery boy features work
- [ ] Mobile responsiveness verified
- [ ] All pages load without errors

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] CDN configured (if applicable)
- [ ] Caching headers set
- [ ] Gzip compression enabled
- [ ] Lighthouse score > 90

### Monitoring
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Analytics installed (Google Analytics, etc.)
- [ ] Log aggregation setup
- [ ] Performance monitoring active

### Documentation
- [ ] README.md updated with production URLs
- [ ] API documentation current
- [ ] Admin credentials documented securely
- [ ] Deployment process documented
- [ ] Rollback procedure documented

### Legal & Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented (if required)
- [ ] GDPR compliance (if applicable)
- [ ] Payment processing compliance (PCI DSS)

## 🔄 Continuous Deployment

### CI/CD Setup
- [ ] GitHub Actions configured
- [ ] Automated tests run on PR
- [ ] Automatic deployment on merge to main
- [ ] Staging environment setup
- [ ] Production deployment approval required

### Backup Strategy
- [ ] Database backups automated
- [ ] Backup retention policy defined
- [ ] Backup restoration tested
- [ ] Code repository backed up

## 📞 Emergency Contacts

Document these for quick access:

- [ ] Hosting provider support
- [ ] Database provider support
- [ ] Payment processor support
- [ ] Domain registrar support
- [ ] SSL certificate provider
- [ ] Development team contacts

## 🎯 Launch Day

### Final Checks (1 hour before)
- [ ] All systems operational
- [ ] Database connection stable
- [ ] Payment processing tested
- [ ] Email notifications working
- [ ] Admin access verified
- [ ] Backup taken
- [ ] Rollback plan ready

### Go Live
- [ ] DNS updated (if changing)
- [ ] SSL certificate verified
- [ ] All services started
- [ ] Monitoring active
- [ ] Team on standby

### Post-Launch (First 24 hours)
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify payment processing
- [ ] Monitor user registrations
- [ ] Check email delivery
- [ ] Review analytics
- [ ] Respond to user feedback

## 🆘 Rollback Plan

If issues occur:

1. **Immediate Actions**
   - [ ] Notify team
   - [ ] Stop new deployments
   - [ ] Assess impact

2. **Rollback Steps**
   - [ ] Revert to previous deployment
   - [ ] Restore database backup (if needed)
   - [ ] Clear CDN cache
   - [ ] Verify rollback successful

3. **Post-Rollback**
   - [ ] Document issue
   - [ ] Fix in development
   - [ ] Test thoroughly
   - [ ] Plan re-deployment

## ✨ Success Criteria

Deployment is successful when:

- ✅ All features work as expected
- ✅ No critical errors in logs
- ✅ Performance meets targets
- ✅ Payments processing correctly
- ✅ Users can register and login
- ✅ Admin panel accessible
- ✅ Mobile experience smooth
- ✅ Monitoring shows healthy metrics

---

**Good luck with your deployment! 🚀**

*Last updated: [Date]*
