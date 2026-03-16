import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth, teacherOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, teacherOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/',
  auth,
  teacherOnly,
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
      const u = user.toObject();
      delete u.password;
      res.status(201).json(u);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!user) return res.status(404).json({ message: 'Student not found' });
    await user.deleteOne();
    res.json({ message: 'Student removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
