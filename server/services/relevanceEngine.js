// Relevance engine: decides which agents should be notified about a post.
//   Step 1 (always): keyword match on interests + company/name mentions.
//   Step 2 (optional, USE_EMBEDDINGS=true): blend in embedding cosine similarity.
import axios from 'axios';

const KEYWORD_WEIGHT = 0.6;
const SEMANTIC_WEIGHT = 0.4;
const SEMANTIC_THRESHOLD = 0.3;

// Lowercase and strip punctuation so phrases can be matched on word boundaries.
export function normalize(text = '') {
  return ` ${String(text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

export function tokenize(text = '') {
  return normalize(text).trim().split(' ').filter(Boolean);
}

// True if the (possibly multi-word) phrase appears as whole words in the text.
function containsPhrase(normalizedText, phrase) {
  const p = normalize(phrase).trim();
  return p.length > 0 && normalizedText.includes(` ${p} `);
}

/**
 * Debug helper (used by the Post Details page): which keywords matched?
 * @returns {{ matchedInterests: string[], matchedMentions: string[], score: number }}
 */
export function explainRelevance(post, agent) {
  const text = normalize(post.content);

  const matchedInterests = (agent.interests || []).filter((i) => containsPhrase(text, i));
  const matchedMentions = [agent.company, agent.name].filter((m) => m && containsPhrase(text, m));

  return {
    matchedInterests,
    matchedMentions: [...new Set(matchedMentions)],
    score: matchedInterests.length + new Set(matchedMentions).size,
  };
}

// ---------- optional embeddings ----------

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

async function embed(inputs) {
  const url = process.env.EMBEDDINGS_URL || 'https://api.openai.com/v1/embeddings';
  const model = process.env.EMBEDDINGS_MODEL || 'text-embedding-3-small';
  const { data } = await axios.post(
    url,
    { model, input: inputs },
    { headers: { Authorization: `Bearer ${process.env.LLM_API_KEY}` }, timeout: 15000 }
  );
  return data.data.map((d) => d.embedding);
}

async function semanticScores(post, agents) {
  const texts = [post.content, ...agents.map((a) => `${a.description || ''} ${(a.interests || []).join(' ')}`.trim())];
  const vectors = await embed(texts);
  const [postVec, ...agentVecs] = vectors;
  return agentVecs.map((v) => Math.max(0, cosine(postVec, v)));
}

/**
 * @param {{content: string}} post
 * @param {Array} allAgents
 * @returns {Promise<Array<{agent: object, score: number}>>} sorted by score desc
 */
export async function findRelevantAgents(post, allAgents) {
  const keyword = allAgents.map((agent) => ({ agent, score: explainRelevance(post, agent).score }));

  let results;
  if (process.env.USE_EMBEDDINGS === 'true' && process.env.LLM_API_KEY) {
    try {
      const semantic = await semanticScores(post, allAgents);
      results = keyword
        .map((k, i) => ({ agent: k.agent, score: KEYWORD_WEIGHT * k.score + SEMANTIC_WEIGHT * semantic[i] }))
        .filter((r) => r.score >= SEMANTIC_THRESHOLD);
    } catch (err) {
      console.warn('Embeddings failed, using keyword matching only:', err.message);
    }
  }

  if (!results) results = keyword.filter((r) => r.score >= 1);

  return results.sort((a, b) => b.score - a.score);
}
