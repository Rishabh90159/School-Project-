import express from 'express';
import { body, validationResult } from 'express-validator';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { auth, teacherOnly, studentOnly } from '../middleware/auth.js';
import { upload, uploadBufferToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('createdBy', 'name').sort({ dueDate: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (req.user.role === 'student') {
      const submission = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
      return res.json({ assignment, submission });
    }
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/submissions', auth, teacherOnly, async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email rollNumber class')
      .populate('gradedBy', 'name')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/',
  auth,
  teacherOnly,
  upload.single('file'),
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('subject').optional().trim(),
  body('dueDate').isISO8601(),
  body('totalMarks').optional().isInt({ min: 0 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { title, description, subject, dueDate, totalMarks } = req.body;
      let fileUrl, fileName;
      if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'student-portal/assignments', {
          resource_type: 'raw',
          public_id: `${Date.now()}-${req.file.originalname.replace(/\s/g, '_')}`,
        });
        fileUrl = result.secure_url;
        fileName = req.file.originalname;
      }
      const assignment = await Assignment.create({
        title,
        description,
        subject,
        dueDate: new Date(dueDate),
        fileUrl,
        fileName,
        totalMarks: totalMarks || 100,
        createdBy: req.user._id,
      });
      await assignment.populate('createdBy', 'name');
      res.status(201).json(assignment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post('/:id/submit',
  auth,
  studentOnly,
  upload.single('file'),
  async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
      if (new Date() > new Date(assignment.dueDate)) return res.status(400).json({ message: 'Due date passed' });
      const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
      if (existing) return res.status(400).json({ message: 'Already submitted' });
      if (!req.file) return res.status(400).json({ message: 'File required' });
      let fileUrl, fileName;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'student-portal/submissions', {
          resource_type: 'raw',
          public_id: `${Date.now()}-${req.user._id}-${req.file.originalname.replace(/\s/g, '_')}`,
        });
        fileUrl = result.secure_url;
        fileName = req.file.originalname;
      } else {
        fileUrl = '/placeholder';
        fileName = req.file.originalname;
      }
      const submission = await Submission.create({
        assignment: assignment._id,
        student: req.user._id,
        fileUrl,
        fileName,
      });
      await submission.populate('student', 'name email');
      res.status(201).json(submission);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.patch('/:id/grade',
  auth,
  teacherOnly,
  body('submissionId').notEmpty(),
  body('marks').isInt({ min: 0 }),
  body('feedback').optional().trim(),
  async (req, res) => {
    try {
      const submission = await Submission.findOne({
        _id: req.body.submissionId,
        assignment: req.params.id,
      });
      if (!submission) return res.status(404).json({ message: 'Submission not found' });
      submission.marks = req.body.marks;
      submission.feedback = req.body.feedback;
      submission.gradedBy = req.user._id;
      submission.gradedAt = new Date();
      await submission.save();
      await submission.populate('student', 'name email');
      res.json(submission);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
