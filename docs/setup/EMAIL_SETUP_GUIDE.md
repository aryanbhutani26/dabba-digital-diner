# Email Setup Guide

## Quick Start (Development)

The email system is already configured to work out of the box using Ethereal (test SMTP service).

### How It Works:
1. When an email is sent, check your server console
2. You'll see a preview URL like: `📧 Email Preview URL: https://ethereal.email/message/xxxxx`
3. Click the URL to view the email in your browser
4. No actual emails are sent (perfect for testing!)

---

## Production Setup

### Option 1: Gmail (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Indiya Restaurant"
   - Copy the 16-character password

3. **Update server/.env:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM="Indiya Restaurant <your-email@gmail.com>"
   ```

4. **Restart server:**
   ```bash
   cd server
   npm run dev
   ```

**Limitations:**
- Gmail has sending limits (500 emails/day)
- Not recommended for high-volume production

---

### Option 2: SendGrid (Recommended for Production)

1. **Sign up:** https://sendgrid.com (Free tier: 100 emails/day)

2. **Create API Key:**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key

3. **Install SendGrid:**
   ```bash
   cd server
   npm install @sendgrid/mail
   ```

4. **Update emailService.js:**
   ```javascript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   // In sendOrderConfirmation function:
   const msg = {
     to: orderData.customerEmail,
     from: process.env.EMAIL_FROM,
     subject: `Order Confirmation - #${orderData.orderNumber}`,
     html: // ... your HTML template
   };
   
   await sgMail.send(msg);
   ```

5. **Update server/.env:**
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your-api-key-here
   EMAIL_FROM="Indiya Restaurant <noreply@indiya.com>"
   ```

**Benefits:**
- 100 emails/day free
- Reliable delivery
- Email analytics
- Scalable

---

### Option 3: AWS SES (Best for Scale)

1. **Sign up:** https://aws.amazon.com/ses/

2. **Verify Domain/Email:**
   - Verify your sending domain or email
   - Move out of sandbox mode (request production access)

3. **Get SMTP Credentials:**
   - Go to SMTP Settings
   - Create SMTP credentials
   - Note: server, port, username, password

4. **Update server/.env:**
   ```env
   EMAIL_SERVICE=ses
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASSWORD=your-smtp-password
   EMAIL_FROM="Indiya Restaurant <noreply@indiya.com>"
   ```

5. **Update emailService.js:**
   ```javascript
   const transporter = nodemailer.createTransporter({
     host: process.env.SMTP_HOST,
     port: process.env.SMTP_PORT,
     secure: false,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASSWORD,
     },
   });
   ```

**Benefits:**
- Very cheap ($0.10 per 1,000 emails)
- Highly scalable
- 99.9% uptime SLA
- Best for production

---

## Testing Emails

### Test Order Confirmation:
```bash
1. Place an order through the website
2. Check server console for email preview URL
3. Verify email content
```

### Test Reservation Confirmation:
```bash
1. Submit a reservation
2. Check server console for email preview URL
3. Verify reservation details
```

### Test Delivery Assignment:
```bash
1. Login as admin
2. Assign order to delivery boy
3. Check server console for email preview URL
4. Verify delivery details
```

---

## Customizing Email Templates

Email templates are in `server/services/emailService.js`

### Customize Colors:
```javascript
// Change primary color from orange to your brand color
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Customize Content:
```javascript
// Edit the HTML in each email function
html: `
  <!DOCTYPE html>
  <html>
    <!-- Your custom HTML here -->
  </html>
`
```

### Add Logo:
```javascript
<img src="https://your-domain.com/logo.png" alt="Logo" style="max-width: 200px;" />
```

---

## Troubleshooting

### Emails Not Sending:

1. **Check Console:**
   - Look for error messages
   - Verify email preview URL appears

2. **Verify Credentials:**
   - Double-check EMAIL_USER and EMAIL_PASSWORD
   - Ensure no extra spaces in .env file

3. **Check Spam Folder:**
   - Production emails might go to spam initially
   - Add sender to contacts

4. **Test SMTP Connection:**
   ```bash
   cd server
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransporter({
     service: 'gmail',
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   transporter.verify((error, success) => {
     if (error) console.log(error);
     else console.log('Server is ready to send emails');
   });
   "
   ```

### Gmail "Less Secure Apps" Error:
- Use App Password instead of regular password
- Enable 2FA first
- Don't use "Allow less secure apps" (deprecated)

### SendGrid Not Working:
- Verify API key is correct
- Check sender email is verified
- Review SendGrid activity logs

---

## Email Limits

### Development (Ethereal):
- Unlimited test emails
- No actual delivery
- Perfect for testing

### Gmail:
- 500 emails/day
- Good for small businesses
- Free

### SendGrid Free:
- 100 emails/day
- Good for startups
- Reliable delivery

### SendGrid Paid:
- Starting at $14.95/month
- 40,000 emails/month
- Email analytics

### AWS SES:
- $0.10 per 1,000 emails
- Unlimited (with proper setup)
- Best value for scale

---

## Best Practices

1. **Use Transactional Email Service:**
   - SendGrid, AWS SES, Mailgun
   - Better deliverability than Gmail

2. **Verify Sender Domain:**
   - Add SPF, DKIM, DMARC records
   - Improves deliverability
   - Reduces spam classification

3. **Monitor Bounce Rates:**
   - Keep bounce rate < 5%
   - Remove invalid emails
   - Use email validation

4. **Include Unsubscribe Link:**
   - Required by law (CAN-SPAM)
   - Already implemented in templates
   - Improves sender reputation

5. **Test Before Production:**
   - Send test emails to multiple providers
   - Check Gmail, Outlook, Yahoo
   - Verify mobile rendering

---

## Support

If you need help:
1. Check server console for errors
2. Verify .env configuration
3. Test with Ethereal first
4. Review email service documentation
5. Check spam folder

For production issues:
- Gmail: https://support.google.com/mail
- SendGrid: https://support.sendgrid.com
- AWS SES: https://aws.amazon.com/ses/faqs/
