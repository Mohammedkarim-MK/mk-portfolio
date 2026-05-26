// ============================================================
// MK-AI Backend — Netlify Serverless Function
// Proxies requests to Groq API — keeps your key safe server-side
// ============================================================

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct';
const GROQ_MODEL_FALLBACK = 'llama-3.3-70b-versatile';

exports.handler = async (event) => {

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // CORS headers — allow your GitHub Pages site
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request — messages array required' })
      };
    }

    // Get key from Netlify environment variable (never exposed to browser)
    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Try primary model
    let response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1024
      })
    });

    // Fallback model if primary fails
    if (!response.ok) {
      response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL_FALLBACK,
          messages,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024
        })
      });
    }

    if (!response.ok) {
      const err = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `Groq API error: ${err}` })
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Server error: ${err.message}` })
    };
  }
};
