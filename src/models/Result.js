import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  obtainedMarks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  answers: [{ questionIndex: Number, selectedIndex: Number, correct: Boolean }],
  submittedAt: { type: Date, default: Date.now },
  timeTakenSeconds: { type: Number },
}, { timestamps: true });

resultSchema.index({ student: 1, quiz: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);
