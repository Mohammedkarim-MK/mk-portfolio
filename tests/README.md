# 🧪 MK Portfolio — Test Suite

This folder contains the automated test suite for MK Portfolio.
All tests are written with **Jest** and run automatically via GitHub Actions on every push.

---

## Test Files

| File | What It Tests | Tests |
|---|---|---|
| `email.test.js` | Email validation — valid formats, invalid formats, edge cases | 20 |
| `detectTopic.test.js` | MK-AI topic detection — all 14 topic categories | 25 |
| `formatText.test.js` | Markdown → HTML formatter — bold, italic, code, lists, XSS prevention | 18 |
| `contactForm.test.js` | Contact form payload validation — required fields, bad inputs | 10 |
| `netlify-chat.test.js` | Netlify serverless function — HTTP methods, auth, fallback model | 12 |
| **Total** | | **85 tests** |

---

## Run Tests Locally

```bash
# Install dependencies first
npm install

# Run all tests once
npm test

# Run with detailed coverage report
npm run test:coverage

# Watch mode — reruns on every file save
npm run test:watch
```

---

## CI/CD

Tests run automatically via **GitHub Actions** on every push to `main`.
See `.github/workflows/test.yml` for the full pipeline configuration.

The pipeline runs three jobs:
1. **Jest Tests** — runs all 85 tests + generates coverage report
2. **ESLint** — checks JavaScript code quality
3. **HTML Check** — verifies all required HTML files exist

---

## Coverage

After running `npm run test:coverage`, open `coverage/lcov-report/index.html`
in your browser to see a full line-by-line coverage breakdown.
