import express from 'express';
import { body, validationResult } from 'express-validator';
import Doubt from '../models/Doubt.js';
import { auth, teacherOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'teacher' ? {} : { student: req.user._id };
    const doubts = await Doubt.find(filter)
      .populate('student', 'name email')
      .populate('answeredBy', 'name')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/',
  auth,
  body('subject').optional().trim(),
  body('question').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
      const doubt = await Doubt.create({
        student: req.user._id,
        subject: req.body.subject,
        question: req.body.question,
      });
      await doubt.populate('student', 'name email');
      res.status(201).json(doubt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.patch('/:id/answer',
  auth,
  teacherOnly,
  body('answer').trim().notEmpty(),
  async (req, res) => {
    try {
      const doubt = await Doubt.findById(req.params.id);
      if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
      doubt.answer = req.body.answer;
      doubt.answeredBy = req.user._id;
      doubt.answeredAt = new Date();
      doubt.status = 'answered';
      await doubt.save();
      await doubt.populate('student', 'name email').populate('answeredBy', 'name');
      res.json(doubt);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
