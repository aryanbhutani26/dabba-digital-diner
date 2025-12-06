# ImageKit Setup Guide

This guide will help you set up ImageKit for image uploads in your restaurant application.

---

## What is ImageKit?

ImageKit is a cloud-based image management service that provides:
- Fast image uploads
- Automatic image optimization
- CDN delivery for fast loading
- Image transformations (resize, crop, etc.)
- Secure storage

---

## Step 1: Create an ImageKit Account

1. Go to [https://imagekit.io/](https://imagekit.io/)
2. Click **Sign Up** (Free plan available)
3. Complete the registration process
4. Verify your email address

---

## Step 2: Get Your API Keys

1. Log in to your ImageKit dashboard
2. Navigate to **Developer Options** → **API Keys**
3. You'll see three important values:
   - **Public Key** (starts with `public_`)
   - **Private Key** (starts with `private_`)
   - **URL Endpoint** (looks like `https://ik.imagekit.io/your_id`)

4. **Important**: Keep your Private Key secure and never commit it to version control!

---

## Step 3: Configure Backend Environment Variables

1. Open `backend/.env` file
2. Add the following variables:

```env
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

3. Replace the placeholder values with your actual ImageKit credentials

---

## Step 4: Configure Frontend Environment Variables

1. Open `frontend/.env` file
2. Add the following variables:

```env
# ImageKit Configuration
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key_here
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

**Note**: Only add the Public Key and URL Endpoint to the frontend. Never add the Private Key!

---

## Step 5: Restart Your Servers

After adding the environment variables:

1. **Stop both servers** (Ctrl+C in both terminals)

2. **Restart Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Restart Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## Step 6: Test the Upload Functionality

1. Log in to your admin panel
2. Navigate to the **Menu** tab
3. Click **Add Menu Item**
4. Fill in the dish details
5. In the image section, click **Click to upload image**
6. Select an image from your computer
7. Wait for the upload to complete
8. You should see a preview of the uploaded image
9. Click **Create Item**

---

## How It Works

### Upload Flow

1. **Admin selects an image** → File is read as base64
2. **Frontend sends to backend** → `/api/upload/image` endpoint
3. **Backend uploads to ImageKit** → Using ImageKit SDK
4. **ImageKit returns secure URL** → Stored in MongoDB
5. **Image displays on website** → Fast CDN delivery

### File Organization

Images are automatically organized in folders:
- `/menu-items/` - All menu item images
- Each file gets a unique name to prevent conflicts

### Image Optimization

ImageKit automatically:
- Compresses images for faster loading
- Converts to modern formats (WebP)
- Serves from global CDN
- Provides responsive images

---

## Features Included

### In Add Menu Item Dialog:
- ✅ Drag & drop or click to upload
- ✅ Image preview before saving
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Upload progress indicator
- ✅ Remove/replace image option
- ✅ Manual URL input as fallback

### In Edit Menu Item Dialog:
- ✅ Same features as Add dialog
- ✅ Shows existing image
- ✅ Can replace existing image
- ✅ Preserves image if not changed

---

## Troubleshooting

### Problem: "Failed to upload image"

**Solutions**:
1. Check that environment variables are set correctly
2. Verify your ImageKit API keys are valid
3. Ensure backend server is running
4. Check browser console for detailed errors
5. Verify file size is under 5MB

### Problem: "Image not displaying"

**Solutions**:
1. Check that the URL was saved to database
2. Verify ImageKit URL endpoint is correct
3. Check browser network tab for 404 errors
4. Ensure image was successfully uploaded to ImageKit dashboard

### Problem: "Authentication failed"

**Solutions**:
1. Verify Private Key is set in backend `.env`
2. Check that Public Key matches in both frontend and backend
3. Restart both servers after changing environment variables
4. Ensure you're logged in as admin

### Problem: "CORS error"

**Solutions**:
1. In ImageKit dashboard, go to **Settings** → **CORS**
2. Add your frontend URL (e.g., `http://localhost:5173`)
3. Save the settings

---

## ImageKit Dashboard Features

### View Uploaded Images
1. Go to **Media Library** in ImageKit dashboard
2. Navigate to `/menu-items/` folder
3. See all uploaded dish images

### Image Transformations
You can transform images on-the-fly by modifying the URL:
- Resize: `?tr=w-400,h-300`
- Quality: `?tr=q-80`
- Format: `?tr=f-webp`

Example:
```
https://ik.imagekit.io/your_id/menu-items/dish.jpg?tr=w-800,h-600,q-85
```

### Storage Management
- Free plan: 20GB storage, 20GB bandwidth/month
- Monitor usage in dashboard
- Delete unused images to free space

---

## Security Best Practices

1. ✅ **Never commit `.env` files** to Git
2. ✅ **Keep Private Key secret** - only in backend
3. ✅ **Use authentication** - only admins can upload
4. ✅ **Validate file types** - only images allowed
5. ✅ **Limit file sizes** - prevent abuse
6. ✅ **Use unique filenames** - prevent overwrites

---

## Cost Considerations

### Free Plan Includes:
- 20GB storage
- 20GB bandwidth per month
- Unlimited image transformations
- Basic support

### When to Upgrade:
- If you exceed 20GB storage
- If you need more bandwidth
- If you need advanced features (video, AI)

---

## Alternative: Manual URL Input

If you prefer not to use ImageKit, you can still:
1. Upload images to any hosting service
2. Copy the image URL
3. Paste it in the "Or paste image URL" field
4. The image will be stored and displayed normally

---

## Support

- **ImageKit Documentation**: [https://docs.imagekit.io/](https://docs.imagekit.io/)
- **ImageKit Support**: [https://imagekit.io/support](https://imagekit.io/support)
- **Community Forum**: [https://community.imagekit.io/](https://community.imagekit.io/)

---

## Summary

You now have a complete image upload system that:
- ✅ Uploads images securely to ImageKit
- ✅ Stores URLs in MongoDB
- ✅ Displays images fast via CDN
- ✅ Validates and optimizes automatically
- ✅ Works in both Add and Edit dialogs
- ✅ Provides great user experience

Happy uploading! 🎉
