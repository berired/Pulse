import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing authorization header',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Note: In production, verify JWT with Supabase public key
    // For now, we'll pass the token to Supabase for verification
    req.token = token;

    // Decode token to get user ID (without verification for now)
    try {
      const decoded = jwt.decode(token);
      req.userId = decoded?.sub; // Supabase uses 'sub' for user ID
      req.userEmail = decoded?.email;
    } catch (decodeError) {
      console.error('Token decode error:', decodeError.message);
    }

    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      req.token = token;

      try {
        const decoded = jwt.decode(token);
        req.userId = decoded?.sub;
        req.userEmail = decoded?.email;
      } catch (decodeError) {
        console.error('Token decode error:', decodeError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};
