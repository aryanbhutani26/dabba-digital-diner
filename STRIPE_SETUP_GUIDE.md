# Stripe Payment Setup Guide

## Overview
The Dabba subscription system uses Stripe for secure payment processing. You need to configure Stripe API keys to enable payments.

## Setup Steps

### 1. Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete account verification

### 2. Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 3. Configure Environment Variables

#### Frontend (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

#### Backend (.env)
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 4. Test Configuration
1. Restart both frontend and backend servers
2. Try subscribing to a Dabba service
3. Use Stripe test card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002

## Production Setup
1. Switch to live mode in Stripe Dashboard
2. Get live API keys (start with `pk_live_` and `sk_live_`)
3. Update environment variables with live keys
4. Enable webhooks for production (optional)

## Troubleshooting

### Error: "clientSecret is required"
- Check that STRIPE_SECRET_KEY is set in backend .env
- Restart backend server after adding the key

### Error: "Invalid publishable key"
- Check that VITE_STRIPE_PUBLISHABLE_KEY is set in frontend .env
- Restart frontend server after adding the key

### Payment fails
- Ensure you're using test card numbers in test mode
- Check Stripe Dashboard logs for detailed error messages

## Security Notes
- Never commit real API keys to version control
- Use test keys for development
- Use live keys only in production
- Keep secret keys secure and never expose them in frontend code

## Support
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe Dashboard](https://dashboard.stripe.com)