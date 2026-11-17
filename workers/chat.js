// =============================================================================
// workers/chat.js — MK-AI Cloudflare Worker
// Proxies requests to Groq API — keeps your key safe server-side
// Deploy: wrangler deploy workers/chat.js --name mk-ai-chat
// =============================================================================

const GROQ_URL            = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL          = 'meta-llama/llama-4-maverick-17b-128e-instruct';
const GROQ_MODEL_FALLBACK = 'llama-3.3-70b-versatile';

// Browser origins allowed to call this worker (plus *.mkinsight.pages.dev previews)
const ALLOWED_ORIGINS = [
  'https://mkinsight.pages.dev',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const MAX_MESSAGES       = 24;
const MAX_MESSAGE_CHARS  = 4000;
const MAX_HISTORY        = 20;
const ALLOWED_ROLES      = ['system', 'user', 'assistant'];

// Copy of the SYSTEM_PROMPT in mk-ai.js — keep the two in sync
const SYSTEM_PROMPT = `You are MK-AI, a highly capable, knowledgeable AI assistant built into Mohammed Karim's portfolio website (mkinsight.com). You give direct, accurate, and helpful answers on ANY topic. No question is too simple or too complex.

Topics you handle expertly:
- Programming: Python, JavaScript/TypeScript, HTML/CSS, SQL, Java, C/C++, Rust, Go, PHP, Kotlin, Swift
- Frameworks & runtimes: React 19, Next.js 15, Node.js 22, Bun, Deno 2, Express, FastAPI, Spring Boot, Laravel
- AI & LLM development: prompt engineering, LangChain, LlamaIndex, RAG pipelines, vector databases (Pinecone, Weaviate, Chroma), fine-tuning, Ollama, Hugging Face, OpenAI API, Anthropic API, Groq
- Data & ML: pandas, numpy, scikit-learn, PyTorch, TensorFlow, Power BI, Tableau, Spark
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, Prisma, Mongoose
- DevOps & Cloud: Docker, Kubernetes, GitHub Actions, AWS, GCP, Azure, Vercel, Render, Terraform
- Security, networking, algorithms, computer science theory, mathematics, career advice, and general knowledge

Knowledge & recency:
- The underlying model's training data covers up to approximately early-to-mid 2025. For anything after that, be transparent.
- CRITICAL: If asked about a product, price, event, or release you don't have data on, NEVER say "it doesn't exist" or "there is no X". It may simply be after your training cutoff. Instead say: "I don't have confirmed data on [X] — this may be after my training cutoff. Check [the official source] for the latest pricing and availability."
- iPhone 16 series was released September 2024. iPhone 17 series was released September 2025. If asked about iPhone 17 pricing, say you don't have confirmed data and direct them to apple.com.
- For rapidly changing info (product prices, stock prices, sports scores, election results, new model releases): always defer to official/current sources.

About Mohammed Karim (mention only when asked):
- BSc Computer Science student at Liverpool John Moores University (2025–2028), currently in his second year
- Skills: Python, SQL, JavaScript, HTML/CSS, Java, C/C++, Power BI, Git, MySQL, Cisco, Node.js, Express
- Experience: Freelance web developer & video editor, International Student Ambassador at LJMU, MUN logistics head
- Based in Liverpool, UK. Built this entire portfolio and AI assistant himself.

Response rules (ALWAYS follow):
- Answer DIRECTLY and IMMEDIATELY — never deflect, never ask for clarification on a clear question
- For "what is X": define it clearly first, then practical context
- For "how to": show working code or step-by-step instructions
- Use markdown: **bold**, bullet lists, fenced \`\`\`language\`\`\` code blocks
- Scale length to the question: 2–3 sentences for simple facts, thorough for complex topics
- Give the answer first, context after
- For coding: provide working, runnable, modern examples using current syntax
- If genuinely unsure, say so — never fabricate facts
- Text only — cannot generate images, videos, or audio

CRITICAL: Never say "I'm not sure what you're asking" or "Could you be more specific?" to a clear question. Just answer it.`;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Cloudflare Pages preview deployments: https://<hash-or-branch>.mkinsight.pages.dev
  return /^https:\/\/[a-z0-9-]+\.mkinsight\.pages\.dev$/i.test(origin);
}

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type':                 'application/json',
    'Vary':                         'Origin',
  };
  if (isAllowedOrigin(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}

// Build messages server-side from { message, history } so the system prompt can't be overridden
function buildMessages(message, history) {
  const msgs = [{ role: 'system', content: SYSTEM_PROMPT }];
  const hist = Array.isArray(history) ? history.slice(-MAX_HISTORY) : [];
  for (const m of hist) {
    if (m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
        && msgs[msgs.length - 1].role !== m.role) {
      msgs.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) });
    }
  }
  if (msgs[msgs.length - 1].role === 'user') msgs.pop();
  msgs.push({ role: 'user', content: message });
  return msgs;
}

// Validate a client-supplied messages array; returns null when invalid
function validateMessages(messages) {
  if (!Array.isArray(messages) || !messages.length || messages.length > MAX_MESSAGES) return null;
  for (const m of messages) {
    if (!m || !ALLOWED_ROLES.includes(m.role) || typeof m.content !== 'string') return null;
    if (m.content.length > MAX_MESSAGE_CHARS && m.role !== 'system') return null;
  }
  return messages.map(m => ({ role: m.role, content: m.content }));
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
    const origin = request.headers.get('Origin') || '';

    // Only allow the portfolio's own origins
    if (!isAllowedOrigin(origin)) {
      return json({ error: 'Origin not allowed' }, 403, origin);
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }

    // Parse request body: accepts { message, history } (preferred) or { messages }
    let messages;
    try {
      const body = await request.json();
      if (body && typeof body.message === 'string') {
        const message = body.message.trim();
        if (!message) return json({ error: 'message is required' }, 400, origin);
        if (message.length > MAX_MESSAGE_CHARS) return json({ error: 'message is too long' }, 400, origin);
        messages = buildMessages(message, body.history);
      } else if (body && body.messages !== undefined) {
        messages = validateMessages(body.messages);
        if (!messages) return json({ error: 'Invalid messages array' }, 400, origin);
        // Never let a client-supplied system prompt replace MK-AI's own
        messages = [{ role: 'system', content: SYSTEM_PROMPT },
          ...messages.filter(m => m.role !== 'system')];
        if (messages.length < 2) return json({ error: 'message is required' }, 400, origin);
      }
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, origin);
    }

    if (!messages) {
      return json({ error: 'message is required' }, 400, origin);
    }

    // Get key from Cloudflare environment secret (never exposed to browser)
    const GROQ_KEY = env.GROQ_API_KEY;
    if (!GROQ_KEY) {
      return json({ error: 'Server configuration error' }, 500, origin);
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
        console.error(`Groq API error ${response.status}: ${err}`);
        return json({ error: 'AI service unavailable' }, 502, origin);
      }

      const data  = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();

      return json({ reply }, 200, origin);

    } catch (err) {
      console.error('Worker error:', err);
      return json({ error: 'Worker error' }, 500, origin);
    }
  },
};
