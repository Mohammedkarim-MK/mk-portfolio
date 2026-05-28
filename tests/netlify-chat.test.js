// =============================================================================
// tests/netlify-chat.test.js
// Unit tests for the Netlify serverless function (netlify/functions/chat.js)
// =============================================================================

const { handler } = require('../netlify/functions/chat');

// Mock the global fetch used inside the handler
global.fetch = jest.fn();

// Helper to build a fake event object
function makeEvent(method = 'POST', body = {}) {
  return {
    httpMethod: method,
    body: JSON.stringify(body),
  };
}

// -----------------------------------------------------------------------------
describe('Netlify chat handler', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Set a fake API key in the environment
    process.env.GROQ_API_KEY = 'test-groq-key-123';
  });

  afterEach(() => {
    delete process.env.GROQ_API_KEY;
  });

  // ── Method validation ────────────────────────────────────────────────────────
  describe('HTTP method validation', () => {
    test('returns 405 for GET requests', async () => {
      const res = await handler(makeEvent('GET'));
      expect(res.statusCode).toBe(405);
    });

    test('returns 405 for PUT requests', async () => {
      const res = await handler(makeEvent('PUT'));
      expect(res.statusCode).toBe(405);
    });

    test('accepts POST requests', async () => {
      // Mock a successful Groq response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello from MK-AI!' } }]
        })
      });

      const res = await handler(makeEvent('POST', {
        messages: [{ role: 'user', content: 'Hello' }]
      }));

      expect(res.statusCode).toBe(200);
    });
  });

  // ── Input validation ─────────────────────────────────────────────────────────
  describe('input validation', () => {
    test('returns 400 when messages is missing', async () => {
      const res = await handler(makeEvent('POST', {}));
      expect(res.statusCode).toBe(400);
    });

    test('returns 400 when messages is not an array', async () => {
      const res = await handler(makeEvent('POST', { messages: 'hello' }));
      expect(res.statusCode).toBe(400);
    });

    test('returns 400 when messages is empty object', async () => {
      const res = await handler(makeEvent('POST', { messages: {} }));
      expect(res.statusCode).toBe(400);
    });
  });

  // ── Missing API key ───────────────────────────────────────────────────────────
  describe('environment configuration', () => {
    test('returns 500 when GROQ_API_KEY is not set', async () => {
      delete process.env.GROQ_API_KEY;
      const res = await handler(makeEvent('POST', {
        messages: [{ role: 'user', content: 'Hello' }]
      }));
      expect(res.statusCode).toBe(500);
    });
  });

  // ── Successful response ───────────────────────────────────────────────────────
  describe('successful AI response', () => {
    test('returns 200 with reply from Groq', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello! I am MK-AI.' } }]
        })
      });

      const res = await handler(makeEvent('POST', {
        messages: [{ role: 'user', content: 'Who are you?' }]
      }));

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.reply).toBe('Hello! I am MK-AI.');
    });

    test('response includes CORS headers', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test reply' } }]
        })
      });

      const res = await handler(makeEvent('POST', {
        messages: [{ role: 'user', content: 'Test' }]
      }));

      expect(res.headers['Access-Control-Allow-Origin']).toBeDefined();
    });
  });

  // ── Groq API failure + fallback ───────────────────────────────────────────────
  describe('Groq API failure handling', () => {
    test('tries fallback model when primary fails', async () => {
      // First call (primary model) fails
      global.fetch.mockResolvedValueOnce({ ok: false, status: 503 });
      // Second call (fallback model) succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Fallback response' } }]
        })
      });

      const res = await handler(makeEvent('POST', {
        messages: [{ role: 'user', content: 'Hello' }]
      }));

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(res.statusCode).toBe(200);
    });

    test('returns error when both models fail', async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 503 });

      const res = await handler(makeEvent('POST', {
        messages: [{ role: 'user', content: 'Hello' }]
      }));

      expect(res.statusCode).not.toBe(200);
    });
  });
});
