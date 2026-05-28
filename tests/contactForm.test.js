// =============================================================================
// tests/contactForm.test.js
// Unit tests for contact form payload validation logic
// =============================================================================

// Extracted validation logic from script.js — mirrors it exactly
function validatePayload({ name, email, message }) {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!name || !name.trim())         return { valid: false, error: 'Name is required' };
  if (!email || !email.trim())       return { valid: false, error: 'Email is required' };
  if (!EMAIL_RE.test(email.trim()))  return { valid: false, error: 'Invalid email address' };
  if (!message || !message.trim())   return { valid: false, error: 'Message is required' };

  return { valid: true, error: null };
}

// -----------------------------------------------------------------------------
describe('Contact form payload validation', () => {

  describe('valid payloads', () => {
    test('accepts a complete valid payload', () => {
      const result = validatePayload({
        name: 'John Smith',
        email: 'john@example.com',
        message: 'Hello Mohammed, great portfolio!'
      });
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('accepts payload without optional subject field', () => {
      const result = validatePayload({
        name: 'Jane',
        email: 'jane@test.org',
        message: 'Looking to hire you!'
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('missing required fields', () => {
    test('rejects when name is empty', () => {
      const result = validatePayload({ name: '', email: 'test@test.com', message: 'Hi' });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/name/i);
    });

    test('rejects when name is only whitespace', () => {
      const result = validatePayload({ name: '   ', email: 'test@test.com', message: 'Hi' });
      expect(result.valid).toBe(false);
    });

    test('rejects when email is missing', () => {
      const result = validatePayload({ name: 'MK', email: '', message: 'Hello' });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/email/i);
    });

    test('rejects when message is empty', () => {
      const result = validatePayload({ name: 'MK', email: 'mk@test.com', message: '' });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/message/i);
    });

    test('rejects when message is only whitespace', () => {
      const result = validatePayload({ name: 'MK', email: 'mk@test.com', message: '   ' });
      expect(result.valid).toBe(false);
    });
  });

  describe('invalid email formats', () => {
    const badEmails = ['notanemail', 'missing@tld', '@nodomain.com', 'double@@domain.com'];

    badEmails.forEach(email => {
      test(`rejects invalid email: "${email}"`, () => {
        const result = validatePayload({ name: 'MK', email, message: 'Hello' });
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/email/i);
      });
    });
  });
});
