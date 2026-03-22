import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth, createAccessToken, createRefreshToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

function sendTokens(res, user, status = 200) {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);
  res.status(status).json({ user: u, accessToken, refreshToken });
}

router.post('/register',
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('rollNumber').optional().trim(),
  body('class').optional().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, email, password, rollNumber, class: className } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });
      const user = await User.create({ name, email, password, role: 'student', rollNumber, class: className });
      sendTokens(res, user, 201);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
      sendTokens(res, user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post('/refresh',
  body('refreshToken').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: 'Refresh token required' });
      const { refreshToken } = req.body;
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      if (decoded.type !== 'refresh') return res.status(401).json({ message: 'Invalid refresh token' });
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'User not found' });
      const accessToken = createAccessToken(user._id);
      res.json({ accessToken });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }
);

router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

router.post('/register-teacher',
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    try {
      const teacherCount = await User.countDocuments({ role: 'teacher' });
      if (teacherCount > 0 && process.env.ALLOW_TEACHER_REGISTER !== 'true')
        return res.status(403).json({ message: 'Teacher already exists' });
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });
      const user = await User.create({ name, email, password, role: 'teacher' });
      sendTokens(res, user, 201);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
