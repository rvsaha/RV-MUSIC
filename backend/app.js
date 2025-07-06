// Advanced logging
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create a write stream (in append mode) for logs
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();
const xss = require('xss-clean');
const hpp = require('hpp');
const slowDown = require('express-slow-down');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const musicRouter = require('./routes/music');
const authRouter = require('./routes/auth');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));

// Rate limiting and slow down to prevent DDoS
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(slowDown({ windowMs: 60 * 1000, delayAfter: 50, delayMs: 500 }));

// Log to file and console
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));
// Simple authentication middleware (demo, replace with real auth in prod)
app.use((req, res, next) => {
  // Example: block requests with suspicious user-agents or missing headers
  const ua = req.headers['user-agent'] || '';
  if (/sqlmap|nikto|fuzz|curl|wget|nmap/i.test(ua)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/music', musicRouter);
app.use('/api/auth', authRouter);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
