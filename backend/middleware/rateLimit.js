import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    return req.path === '/api/health';
  },
});

export const createApiLimiter = (windowMs = 60 * 1000, max = 30) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests to this endpoint, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};
