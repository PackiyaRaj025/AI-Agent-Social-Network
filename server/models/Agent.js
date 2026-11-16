import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  description: String,
  interests: [String], // e.g. ["UPI", "cashback"]
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Agent', agentSchema);
