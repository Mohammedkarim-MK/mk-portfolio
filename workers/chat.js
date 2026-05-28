// =============================================================================
// workers/chat.js — MK-AI Cloudflare Worker
// Proxies requests to Groq API — keeps your key safe server-side
// Deploy: wrangler deploy workers/chat.js --name mk-ai-chat
// =============================================================================

const GROQ_URL            = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL          = 'meta-llama/llama-4-maverick-17b-128e-instruct';
const GROQ_MODEL_FALLBACK = 'llama-3.3-70b-versatile';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

async function callGroq(model, messages, key) {
  return fetch(GROQ_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      top_p:       0.9,
      max_tokens:  1024,
    }),
  });
}

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // Parse request body
    let messages;
    try {
      const body = await request.json();
      messages   = body.messages;
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!messages || !Array.isArray(messages)) {
      return json({ error: 'messages array is required' }, 400);
    }

    // Get key from Cloudflare environment secret (never exposed to browser)
    const GROQ_KEY = env.GROQ_API_KEY;
    if (!GROQ_KEY) {
      return json({ error: 'Server configuration error' }, 500);
    }

    try {
      // Try primary model first
      let response = await callGroq(GROQ_MODEL, messages, GROQ_KEY);

      // Fallback to secondary model if primary fails
      if (!response.ok) {
        response = await callGroq(GROQ_MODEL_FALLBACK, messages, GROQ_KEY);
      }

      if (!response.ok) {
        const err = await response.text();
        return json({ error: `Groq API error: ${err}` }, response.status);
      }

      const data  = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();

      return json({ reply });

    } catch (err) {
      return json({ error: `Worker error: ${err.message}` }, 500);
    }
  },
};
