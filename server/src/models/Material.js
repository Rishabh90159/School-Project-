import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['pdf', 'notes', 'link'], default: 'pdf' },
  fileUrl: { type: String },
  fileName: { type: String },
  linkUrl: { type: String },
  subject: { type: String, trim: true },
  topic: { type: String, trim: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Material', materialSchema);
