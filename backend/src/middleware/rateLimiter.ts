import rateLimit from "express-rate-limit";

/** Global rate limiter: 100 requests per 15 minutes per IP */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

/** Stricter limiter for the translation endpoint: 30 requests per minute */
export const translateRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Translation rate limit exceeded. Please slow down." },
});
