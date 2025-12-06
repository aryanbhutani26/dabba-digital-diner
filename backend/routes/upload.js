import express from 'express';
import imagekit from '../config/imagekit.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get ImageKit authentication parameters (for client-side upload)
router.get('/auth', authenticate, isAdmin, (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image (server-side upload)
router.post('/image', authenticate, isAdmin, async (req, res) => {
  try {
    const { file, fileName, folder } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await imagekit.upload({
      file: file, // base64 encoded file
      fileName: fileName || `menu-item-${Date.now()}`,
      folder: folder || '/menu-items',
      useUniqueFileName: true,
      tags: ['menu', 'restaurant']
    });

    res.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl
    });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete image
router.delete('/image/:fileId', authenticate, isAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    await imagekit.deleteFile(fileId);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('ImageKit delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
