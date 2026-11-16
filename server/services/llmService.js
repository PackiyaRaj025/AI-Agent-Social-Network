// LLM wrapper. Provider adapters are small functions; add a new one to
// ADAPTERS to support another provider. Always degrades to a deterministic stub.
import axios from 'axios';

const TEMPERATURE = 0.7;
const MAX_TOKENS = 200;

export function buildSystemPrompt(agent) {
  return (
    `You are the AI agent for ${agent.company}. Your responsibilities cover: ` +
    `${(agent.interests || []).join(', ')}. Given a social-network post, write a short, ` +
    `professional, one-paragraph comment (<= 60 words) that responds relevantly from your ` +
    `company's perspective. Do not invent facts. Do not mention that you are an LLM.`
  );
}

export function buildUserPrompt(post, authorCompany) {
  return `Post by ${authorCompany}: "${post.content}"`;
}

// ---------- provider adapters: ({ system, user, model, apiKey }) => string ----------

async function openaiAdapter({ system, user, model, apiKey }) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 20000 }
  );
  return data.choices?.[0]?.message?.content?.trim();
}

const ADAPTERS = { openai: openaiAdapter };

export function fallbackResponse(agent, post) {
  const firstSixWords = String(post.content).trim().split(/\s+/).slice(0, 6).join(' ');
  return `[${agent.company}] We've noted the update about "${firstSixWords}". Our team will follow up on relevant offers.`;
}

/**
 * @param {{ post: {content: string}, agent: object, authorCompany?: string }} args
 * @returns {Promise<string>}
 */
export async function generateAgentResponse({ post, agent, authorCompany = 'another company' }) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return fallbackResponse(agent, post);

  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const adapter = ADAPTERS[provider];
  if (!adapter) {
    console.warn(`Unknown LLM_PROVIDER "${provider}", using fallback`);
    return fallbackResponse(agent, post);
  }

  try {
    const text = await adapter({
      system: buildSystemPrompt(agent),
      user: buildUserPrompt(post, authorCompany),
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      apiKey,
    });
    return text || fallbackResponse(agent, post);
  } catch (err) {
    console.warn('LLM call failed, using fallback:', err.message);
    return fallbackResponse(agent, post);
  }
}
