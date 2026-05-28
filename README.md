<div align="center">

# MK Portfolio

**Mohammed Karim — Data Analyst · Web Developer · Content Creator**

[![Live Site](https://img.shields.io/badge/Live%20Site-mk--portfolio.netlify.app-ff2a2a?style=for-the-badge&logo=netlify)](https://mk-portfolio.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-Mohammedkarim--MK-181717?style=for-the-badge&logo=github)](https://github.com/Mohammedkarim-MK)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## About

Personal portfolio website for Mohammed Karim — BSc Computer Science student at Liverpool John Moores University. Built from scratch with vanilla HTML, CSS, and JavaScript. Features an AI assistant (MK-AI), animated UI, and a secure Netlify backend.

---

## Features

- **MK-AI Assistant** — AI chat powered by Groq (Llama 4), proxied securely via Netlify Functions
- **Animated Hero** — Decoder-style typewriter, floating particles, 3D tilt effects
- **Dark / Light Theme** — Persistent theme toggle with smooth transitions
- **Experience Timeline** — Interactive modals for each role
- **Skills Dashboard** — Animated progress rings and skill bars
- **Contact Form** — Email verification flow via `/api/contact`
- **Living Core** — Generative canvas animation page
- **Fully Responsive** — Mobile-first, works on all devices
- **Accessible** — Skip-to-content, ARIA labels, keyboard navigation
- **SEO Ready** — Open Graph, Twitter Card, canonical URLs, meta descriptions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic, accessible) |
| Styling | CSS3 (custom properties, animations, grid, flexbox) |
| Logic | Vanilla JavaScript (ES2021, IIFEs, async/await) |
| AI | Groq API — Llama 4 Maverick |
| Backend | Netlify Functions (Node.js serverless) |
| Hosting | Netlify (primary) + GitHub Pages |
| Fonts | Google Fonts — Syne, DM Sans, Cormorant Garamond |
| Tooling | ESLint, Prettier, live-server |

---

## Project Structure

```
mk-portfolio/
├── index.html                  # Home — hero, skills, experience, projects
├── about.html                  # About Me — bio, photo, education
├── contact.html                # Contact — form with email verification
├── MK-AI.html                  # AI Chat assistant interface
├── living-core.html            # Generative canvas animation
├── profile-frame.html          # Profile showcase embed
│
├── styles.css                  # Global stylesheet (19 sections, documented)
├── script.js                   # Shared JS — animations, modals, forms
├── mk-ai.js                    # MK-AI logic — streaming, history, UI
│
├── netlify/
│   └── functions/
│       └── chat.js             # Serverless proxy — keeps Groq key secret
│
├── netlify.toml                # Netlify config — redirects, headers, functions
├── package.json                # Dev tooling — ESLint, Prettier, live-server
├── .eslintrc.json              # JavaScript linting rules
├── .prettierrc                 # Code formatting config
├── .gitignore                  # Excludes secrets, node_modules, OS files
├── CHANGELOG.md                # Version history
├── SECURITY.md                 # Security practices
└── README.md                   # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Mohammedkarim-MK/mk-portfolio.git
cd mk-portfolio

# 2. Install dev tools
npm install

# 3. Add your Groq key to mk-ai.js (local only — never commit)
# Find: const GROQ_KEY = '';
# Replace with: const GROQ_KEY = 'your_key_here';

# 4. Start local server
npm run dev
# Opens at http://localhost:3000
```

### Deploy to Netlify

1. Push to GitHub
2. Connect repo on [netlify.com](https://netlify.com)
3. Add environment variable: `GROQ_API_KEY` = your Groq key
4. Deploy — MK-AI will work fully on the live site

---

## Environment Variables

| Variable | Description | Where to set |
|---|---|---|
| `GROQ_API_KEY` | Groq API key for MK-AI | Netlify → Environment Variables |

**Never commit API keys.** See [SECURITY.md](SECURITY.md) for full security policy.

---

## Scripts

```bash
npm run dev       # Start local dev server on port 3000
npm run lint      # Lint JavaScript with ESLint
npm run format    # Format all files with Prettier
npm run validate  # Validate HTML files
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

```
Copyright (c) 2025 Mohammed Karim
```

---

<div align="center">

Made with ❤️ by **Mohammed Karim** · Liverpool, UK

[Portfolio](https://mk-portfolio.netlify.app) · [GitHub](https://github.com/Mohammedkarim-MK) · [Contact](https://mk-portfolio.netlify.app/contact.html)

</div>
