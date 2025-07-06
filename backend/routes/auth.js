const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
// Apple login would require additional setup and a package like 'passport-apple'
const { body, validationResult } = require('express-validator');
const router = express.Router();

// In-memory user store (replace with DB in production)
const users = [];

// Passport serialization (for session support, not used with JWT but required by passport)
passport.serializeUser((user, done) => done(null, user.email));
passport.deserializeUser((email, done) => {
  const user = users.find(u => u.email === email);
  done(null, user || false);
});

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
  callbackURL: '/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  let user = users.find(u => u.email === profile.emails[0].value);
  if (!user) {
    user = { email: profile.emails[0].value, googleId: profile.id };
    users.push(user);
  }
  return done(null, user);
}));

// Facebook OAuth
passport.use(new FacebookStrategy({
  clientID: process.env.FB_CLIENT_ID || 'FB_CLIENT_ID',
  clientSecret: process.env.FB_CLIENT_SECRET || 'FB_CLIENT_SECRET',
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name']
}, (accessToken, refreshToken, profile, done) => {
  let email = (profile.emails && profile.emails[0].value) || `${profile.id}@facebook.com`;
  let user = users.find(u => u.email === email);
  if (!user) {
    user = { email, facebookId: profile.id };
    users.push(user);
  }
  return done(null, user);
}));

// Twitter OAuth
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY || 'TWITTER_CONSUMER_KEY',
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'TWITTER_CONSUMER_SECRET',
  callbackURL: '/api/auth/twitter/callback',
  includeEmail: true
}, (token, tokenSecret, profile, done) => {
  let email = (profile.emails && profile.emails[0].value) || `${profile.id}@twitter.com`;
  let user = users.find(u => u.email === email);
  if (!user) {
    user = { email, twitterId: profile.id };
    users.push(user);
  }
  return done(null, user);
}));
// Social login routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  // Issue JWT
  const token = jwt.sign({ email: req.user.email }, JWT_SECRET, { expiresIn: '2h' });
  res.redirect(`/auth-success?token=${token}`);
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ email: req.user.email }, JWT_SECRET, { expiresIn: '2h' });
  res.redirect(`/auth-success?token=${token}`);
});

router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { session: false, failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ email: req.user.email }, JWT_SECRET, { expiresIn: '2h' });
  res.redirect(`/auth-success?token=${token}`);
});

// Apple login would require a developer account and additional setup (see passport-apple)
// router.get('/apple', passport.authenticate('apple'));
// router.get('/apple/callback', passport.authenticate('apple', { session: false, failureRedirect: '/' }), (req, res) => { ... });
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Register
router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 12);
    users.push({ email, password: hash });
    res.json({ message: 'Registered successfully' });
  }
);

// Login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  }
);

// JWT Auth middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Example protected route
router.get('/me', authenticateJWT, (req, res) => {
  res.json({ email: req.user.email });
});

module.exports = router;
