import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  status: { type: String, enum: ['unread', 'read', 'responded'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
});

// One notification per (agent, post)
notificationSchema.index({ agentId: 1, postId: 1 }, { unique: true });

export default mongoose.model('Notification', notificationSchema);
