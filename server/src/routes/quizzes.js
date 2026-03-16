import express from 'express';
import { body, validationResult } from 'express-validator';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import { auth, teacherOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { isPublished: true } : {};
    const quizzes = await Quiz.find(filter).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role === 'student' && !quiz.isPublished) return res.status(403).json({ message: 'Quiz not available' });
    const payload = quiz.toObject();
    if (req.user.role === 'student') {
      payload.questions = payload.questions.map((q, i) => ({
        questionIndex: i,
        question: q.question,
        options: q.options,
        marks: q.marks,
      }));
      payload.questions.forEach((q) => delete q.correctIndex);
    }
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/',
  auth,
  teacherOnly,
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('subject').optional().trim(),
  body('totalMarks').isInt({ min: 1 }),
  body('durationMinutes').optional().isInt({ min: 1 }),
  body('questions').isArray(),
  body('questions.*.question').notEmpty(),
  body('questions.*.options').isArray({ min: 2 }),
  body('questions.*.correctIndex').isInt({ min: 0 }),
  body('questions.*.marks').optional().isInt({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { title, description, subject, totalMarks, durationMinutes, questions } = req.body;
      const quiz = await Quiz.create({
        title,
        description,
        subject,
        totalMarks,
        durationMinutes: durationMinutes || 30,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          marks: q.marks || 1,
        })),
        createdBy: req.user._id,
      });
      await quiz.populate('createdBy', 'name');
      res.status(201).json(quiz);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.patch('/:id/publish', auth, teacherOnly, body('isPublished').isBoolean(), async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, { isPublished: req.body.isPublished }, { new: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/submit',
  auth,
  studentOnly,
  body('answers').isArray(),
  body('answers.*.questionIndex').isInt({ min: 0 }),
  body('answers.*.selectedIndex').isInt({ min: 0 }),
  body('timeTakenSeconds').optional().isInt({ min: 0 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      if (!quiz.isPublished) return res.status(403).json({ message: 'Quiz not available' });
      const existing = await Result.findOne({ student: req.user._id, quiz: quiz._id });
      if (existing) return res.status(400).json({ message: 'Already submitted' });
      let obtainedMarks = 0;
      const answers = req.body.answers.map((a) => {
        const q = quiz.questions[a.questionIndex];
        const correct = q && q.correctIndex === a.selectedIndex;
        if (correct) obtainedMarks += q.marks || 1;
        return { questionIndex: a.questionIndex, selectedIndex: a.selectedIndex, correct };
      });
      const result = await Result.create({
        student: req.user._id,
        quiz: quiz._id,
        obtainedMarks,
        totalMarks: quiz.totalMarks,
        answers,
        timeTakenSeconds: req.body.timeTakenSeconds,
      });
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
