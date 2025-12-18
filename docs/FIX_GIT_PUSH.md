# 🔐 Fix Git Push - Secret Detected

## Problem
GitHub detected a Stripe test API key in your git history and blocked the push.

**File**: `PAYMENT_ISSUE_FIX.md` (in commit 3714cb2)
**Secret**: Stripe Test API Secret Key

## ✅ Solution (Choose One)

### Option 1: Revoke Old Key & Allow Push (RECOMMENDED)

This is the safest and easiest option.

**Steps:**

1. **Revoke the old Stripe test key**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Find the key starting with `sk_test_51SRv7G7G0s7d6TeR...`
   - Click "Delete" or "Revoke"
   - Generate a new test key if needed

2. **Allow the push via GitHub**
   - Click this URL: https://github.com/aryanbhutani26/dabba-digital-diner/security/secret-scanning/unblock-secret/36Q8qKHjqNXPabigz33hsOfe1X2
   - Click "Allow secret"
   - Push again: `git push --set-upstream origin final-deploy`

### Option 2: Use GitHub's Allow URL (Quick)

If you're sure the key is already revoked or is just a test key:

1. Click: https://github.com/aryanbhutani26/dabba-digital-diner/security/secret-scanning/unblock-secret/36Q8qKHjqNXPabigz33hsOfe1X2
2. Click "Allow secret"
3. Push again: `git push --set-upstream origin final-deploy`

### Option 3: Remove from Git History (Advanced)

Only use this if you want to completely remove the secret from git history.

**Using BFG Repo Cleaner:**

```bash
# Download BFG
# https://rpo.github.io/bfg-repo-cleaner/

# Create a file with the secret
echo "sk_test_51SRv7G7G0s7d6TeRKTQ4Ez9tHfrhqwKtXSEvZsEmXqGQOeuic4ARv3rlND0HP2XEPynncBzW7klHElCabf6VAE0800TwgaQk2p" > secrets.txt

# Run BFG
java -jar bfg.jar --replace-text secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push --force
```

**Using git filter-branch:**

```bash
# Remove the file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PAYMENT_ISSUE_FIX.md" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history)
git push --force
```

## 🚨 Important Notes

### About Test Keys
- Test keys (sk_test_*) are for development only
- They cannot process real payments
- Still should be kept private
- Should be revoked if exposed

### About Force Push
- **Never force push to main/master** if others are using the repo
- Force push rewrites history
- Can cause issues for collaborators
- Only use if you understand the implications

## ✅ Recommended Action

**For this situation, do this:**

1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/apikeys
2. Delete the exposed test key
3. Generate a new test key
4. Update your `backend/.env` with the new key
5. Click GitHub's allow URL: https://github.com/aryanbhutani26/dabba-digital-diner/security/secret-scanning/unblock-secret/36Q8qKHjqNXPabigz33hsOfe1X2
6. Push again: `git push --set-upstream origin final-deploy`

## 🔒 Prevention

To prevent this in the future:

1. **Never commit .env files**
   - Already in .gitignore ✅
   
2. **Never put real keys in markdown files**
   - Use placeholders like `sk_test_YOUR_KEY_HERE`
   
3. **Use .env.example files**
   - Show structure without real values
   
4. **Enable Secret Scanning**
   - Go to: https://github.com/aryanbhutani26/dabba-digital-diner/settings/security_analysis
   - Enable "Secret scanning"

## 📝 After Fixing

Once you've allowed the push:

```bash
# Push again
git push --set-upstream origin final-deploy

# Or if you're on the branch already
git push
```

## ✅ Verification

After pushing successfully:

1. Check GitHub repository
2. Verify all files are there
3. Check that secrets are not visible
4. Update any documentation with placeholder keys

---

**Need help? Check the GitHub documentation:**
https://docs.github.com/code-security/secret-scanning/working-with-secret-scanning-and-push-protection
