import express from 'express';
import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { auth, teacherOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', auth, studentOnly, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title subject totalMarks')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/leaderboard', auth, async (req, res) => {
  try {
    const results = await Result.aggregate([
      { $group: { _id: '$student', totalObtained: { $sum: '$obtainedMarks' }, totalMax: { $sum: '$totalMarks' }, count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.role': 'student' } },
      { $project: { name: '$user.name', email: '$user.email', rollNumber: '$user.rollNumber', totalObtained: 1, totalMax: 1, count: 1 } },
      { $sort: { totalObtained: -1 } },
      { $limit: 50 },
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/quiz/:quizId', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const results = await Result.find({ quiz: quiz._id })
      .populate('student', 'name email rollNumber class')
      .sort({ obtainedMarks: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
