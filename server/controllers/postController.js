import Agent from '../models/Agent.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { findRelevantAgents, explainRelevance } from '../services/relevanceEngine.js';
import { httpError } from '../middleware/errorHandler.js';

// POST /api/posts  { agentId, content }
export async function createPost(req, res, next) {
  try {
    const { agentId, content } = req.body;
    if (!agentId) throw httpError(400, 'agentId is required');
    if (!content?.trim()) throw httpError(400, 'content is required');

    const author = await Agent.findById(agentId);
    if (!author) throw httpError(404, 'Author agent not found');

    const post = await Post.create({ agentId, content: content.trim() });

    // Find relevant agents (never the author) and notify them.
    const allAgents = await Agent.find();
    const relevant = (await findRelevantAgents(post, allAgents)).filter(
      (r) => String(r.agent._id) !== String(author._id)
    );

    if (relevant.length > 0) {
      await Notification.insertMany(
        relevant.map((r) => ({ agentId: r.agent._id, postId: post._id })),
        { ordered: false }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        post,
        notifiedAgents: relevant.map((r) => ({
          _id: r.agent._id,
          name: r.agent.name,
          company: r.agent.company,
          score: r.score,
        })),
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/posts?page&limit   (each post includes relevantCount)
export async function listPosts(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('agentId', 'name company')
        .lean(),
      Post.countDocuments(),
    ]);

    const counts = await Notification.aggregate([
      { $match: { postId: { $in: posts.map((p) => p._id) } } },
      { $group: { _id: '$postId', n: { $sum: 1 } } },
    ]);
    const countByPost = new Map(counts.map((c) => [String(c._id), c.n]));

    const data = posts.map((p) => ({ ...p, relevantCount: countByPost.get(String(p._id)) || 0 }));
    res.json({ success: true, data, error: null, meta: { page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/:id  -> post + comments + relevance explanation for every agent
export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate('agentId', 'name company').lean();
    if (!post) throw httpError(404, 'Post not found');

    const [comments, agents] = await Promise.all([
      Comment.find({ postId: post._id }).sort({ createdAt: 1 }).populate('agentId', 'name company').lean(),
      Agent.find().lean(),
    ]);

    const authorId = String(post.agentId._id);
    const relevance = agents
      .filter((a) => String(a._id) !== authorId)
      .map((agent) => {
        const e = explainRelevance(post, agent);
        return {
          agent: { _id: agent._id, name: agent.name, company: agent.company },
          matchedInterests: e.matchedInterests,
          matchedMentions: e.matchedMentions,
          score: e.score,
          relevant: e.score >= 1,
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({ success: true, data: { post, comments, relevance }, error: null });
  } catch (err) {
    next(err);
  }
}
