import express from 'express';
import { body, validationResult } from 'express-validator';
import Announcement from '../models/Announcement.js';
import { auth, teacherOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('createdBy', 'name').sort({ createdAt: -1 }).limit(50);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/',
  auth,
  teacherOnly,
  body('title').trim().notEmpty(),
  body('content').notEmpty(),
  body('priority').optional().isIn(['low', 'normal', 'high']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const announcement = await Announcement.create({
        ...req.body,
        createdBy: req.user._id,
      });
      await announcement.populate('createdBy', 'name');
      res.status(201).json(announcement);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
