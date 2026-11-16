import Agent from '../models/Agent.js';
import { httpError } from '../middleware/errorHandler.js';

// POST /api/agents
export async function createAgent(req, res, next) {
  try {
    const { name, company, description, interests } = req.body;

    if (!name?.trim()) throw httpError(400, 'name is required');
    if (!company?.trim()) throw httpError(400, 'company is required');
    if (!Array.isArray(interests) || interests.length === 0) {
      throw httpError(400, 'interests must be a non-empty array');
    }
    const cleaned = interests.map((i) => String(i).trim()).filter(Boolean);
    if (cleaned.length === 0) throw httpError(400, 'interests must contain at least one non-empty value');

    const agent = await Agent.create({ name, company, description, interests: cleaned });
    res.status(201).json({ success: true, data: agent, error: null });
  } catch (err) {
    next(err);
  }
}

// GET /api/agents?page&limit
export async function listAgents(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const [agents, total] = await Promise.all([
      Agent.find().sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit),
      Agent.countDocuments(),
    ]);
    res.json({ success: true, data: agents, error: null, meta: { page, limit, total } });
  } catch (err) {
    next(err);
  }
}

// GET /api/agents/:id
export async function getAgent(req, res, next) {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) throw httpError(404, 'Agent not found');
    res.json({ success: true, data: agent, error: null });
  } catch (err) {
    next(err);
  }
}
