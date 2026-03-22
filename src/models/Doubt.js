import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, trim: true },
  question: { type: String, required: true },
  answer: { type: String },
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answeredAt: { type: Date },
  status: { type: String, enum: ['open', 'answered'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('Doubt', doubtSchema);
