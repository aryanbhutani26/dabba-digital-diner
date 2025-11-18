import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const isDeliveryBoy = (req, res, next) => {
  if (req.user.role !== 'delivery_boy' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Delivery access required' });
  }
  next();
};

export const isAdminOrDeliveryBoy = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'delivery_boy') {
    return res.status(403).json({ error: 'Delivery or admin access required' });
  }
  next();
};
