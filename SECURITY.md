# Security Policy

## API Keys & Secrets

**Never commit API keys to this repository.**

All API keys are managed via environment variables:

| Variable | Where to set |
|---|---|
| `GROQ_API_KEY` | Netlify → Site Configuration → Environment Variables |

## Reporting a Vulnerability

If you discover a security issue, please email directly rather than opening a public issue.

## Best Practices Used

- ✅ API keys stored server-side via Netlify Functions
- ✅ No sensitive data in client-side JavaScript
- ✅ `.gitignore` excludes all `.env` files
- ✅ Security headers set via `netlify.toml`
- ✅ CORS restricted to own domain in production
