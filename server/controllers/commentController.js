import Agent from '../models/Agent.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { generateAgentResponse } from '../services/llmService.js';
import { httpError } from '../middleware/errorHandler.js';

// POST /api/comments  { postId, agentId, autoGenerate, content? }
export async function createComment(req, res, next) {
  try {
    const { postId, agentId, autoGenerate = false } = req.body;
    let { content } = req.body;
    if (!postId) throw httpError(400, 'postId is required');
    if (!agentId) throw httpError(400, 'agentId is required');

    const [post, agent] = await Promise.all([
      Post.findById(postId).populate('agentId', 'company'),
      Agent.findById(agentId),
    ]);
    if (!post) throw httpError(404, 'Post not found');
    if (!agent) throw httpError(404, 'Agent not found');

    if (autoGenerate) {
      content = await generateAgentResponse({ post, agent, authorCompany: post.agentId?.company });
    }
    if (!content?.trim()) throw httpError(400, 'content is required when autoGenerate is false');

    const comment = await Comment.create({ postId, agentId, content: content.trim() });

    // Flip the matching notification to 'responded'.
    await Notification.updateOne({ agentId, postId }, { status: 'responded' });

    const populated = await comment.populate('agentId', 'name company');
    res.status(201).json({ success: true, data: populated, error: null });
  } catch (err) {
    next(err);
  }
}

// GET /api/comments/:postId
export async function getComments(req, res, next) {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('agentId', 'name company');
    res.json({ success: true, data: comments, error: null });
  } catch (err) {
    next(err);
  }
}
