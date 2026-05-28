// =============================================================================
// tests/email.test.js
// Unit tests for email validation logic (from script.js contactForm)
// =============================================================================

// The same regex used in script.js — extracted for testability
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function isValidEmail(v) {
  return EMAIL_RE.test(String(v).trim());
}

// -----------------------------------------------------------------------------
describe('isValidEmail()', () => {

  // ── Valid emails ─────────────────────────────────────────────────────────────
  describe('accepts valid email addresses', () => {
    const validEmails = [
      'mk@gmail.com',
      'mohammed.karim@outlook.com',
      'user+tag@domain.co.uk',
      'test123@example.org',
      'a@b.io',
      'UPPER@CASE.COM',
      'under_score@domain.net',
      'hyphen-name@my-domain.com',
    ];

    validEmails.forEach(email => {
      test(`✅ "${email}"`, () => {
        expect(isValidEmail(email)).toBe(true);
      });
    });
  });

  // ── Invalid emails ────────────────────────────────────────────────────────────
  describe('rejects invalid email addresses', () => {
    const invalidEmails = [
      'notanemail',
      'missing@tld',
      '@nodomain.com',
      'no spaces @domain.com',
      '',
      '   ',
      'double@@domain.com',
      'nodot@domaincom',
    ];

    invalidEmails.forEach(email => {
      test(`❌ "${email}"`, () => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────────
  describe('handles edge cases', () => {
    test('trims whitespace before validating', () => {
      expect(isValidEmail('  mk@gmail.com  ')).toBe(true);
    });

    test('handles null gracefully (converts to string)', () => {
      expect(isValidEmail(null)).toBe(false);
    });

    test('handles undefined gracefully', () => {
      expect(isValidEmail(undefined)).toBe(false);
    });

    test('handles number input', () => {
      expect(isValidEmail(12345)).toBe(false);
    });
  });
});
