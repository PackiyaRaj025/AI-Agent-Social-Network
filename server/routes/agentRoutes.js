import { Router } from 'express';
import { createAgent, listAgents, getAgent } from '../controllers/agentController.js';

const router = Router();
router.post('/', createAgent);
router.get('/', listAgents);
router.get('/:id', getAgent);

export default router;
