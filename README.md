<div align="center">

# MK Portfolio

**Mohammed Karim — Data Analyst · Web Developer · Content Creator**

[![Live Site](https://img.shields.io/badge/Live%20Site-mohammedkarim--mk.github.io-ff2a2a?style=for-the-badge&logo=github)](https://mohammedkarim-mk.github.io/mk-portfolio/)
[![GitHub](https://img.shields.io/badge/GitHub-Mohammedkarim--MK-181717?style=for-the-badge&logo=github)](https://github.com/Mohammedkarim-MK/mk-portfolio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-73%20passing-brightgreen?style=for-the-badge&logo=jest)](tests/)

</div>

---

## About

Personal portfolio website for Mohammed Karim — BSc Computer Science student at Liverpool John Moores University (LJMU). Built from scratch with vanilla HTML, CSS, and JavaScript. Features an AI assistant (MK-AI), animated UI, and a secure Netlify serverless backend.

---

## Features

- **MK-AI Assistant** — AI chat powered by Groq (Llama 4), proxied securely via Netlify Functions
- **Animated Hero** — Decoder-style typewriter, floating particles, 3D tilt on hover
- **Dark / Light Theme** — Persistent toggle with smooth transitions
- **Experience Timeline** — Interactive modals for each role
- **Skills Dashboard** — Animated progress rings and skill bars
- **Contact Form** — Submissions delivered to email via Resend API
- **Living Core** — Generative canvas animation page
- **Fully Responsive** — Mobile-first, works across all devices
- **Accessible** — Skip-to-content, ARIA labels, keyboard navigation
- **SEO Ready** — Open Graph, Twitter Card, canonical URLs, meta descriptions
- **CI/CD** — GitHub Actions runs 73 tests on every push

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, animations, grid, flexbox) |
| Logic | Vanilla JavaScript (ES2021) |
| AI | Groq API — Llama 4 Maverick |
| Backend | Netlify Functions (Node.js serverless) |
| Email | Resend API |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Tooling | ESLint, Prettier, Jest |

---

## Project Structure

```
mk-portfolio/
├── index.html                  # Home — hero, skills, experience, projects
├── about.html                  # About Me — bio, photo, education
├── contact.html                # Contact — form with email delivery
├── MK-AI.html                  # AI Chat assistant interface
├── living-core.html            # Generative canvas animation
├── profile-frame.html          # Profile showcase
├── styles.css                  # Global stylesheet (documented sections)
├── script.js                   # Shared JS — animations, modals, forms
├── mk-ai.js                    # MK-AI logic — streaming, history, UI
├── favicon.svg                 # MK brand favicon
├── mklogo.png                  # MK logo image
├── karim_png.png               # Profile photo
├── netlify.toml                # Netlify config — redirects, headers
├── package.json                # Dev tooling — ESLint, Prettier, Jest
├── .eslintrc.json              # JS linting rules
├── .prettierrc                 # Code formatting config
├── .gitignore                  # Excludes secrets and build files
├── README.md                   # This file
├── LICENSE                     # MIT License
├── CHANGELOG.md                # Version history
├── SECURITY.md                 # Security practices
├── .github/
│   └── workflows/
│       └── test.yml            # CI/CD — runs tests on every push
├── netlify/
│   └── functions/
│       ├── chat.js             # AI proxy — Groq API (key server-side only)
│       └── contact.js          # Contact form — email delivery via Resend
└── tests/
    ├── README.md               # Test documentation
    ├── email.test.js           # Email validation tests
    ├── detectTopic.test.js     # AI topic detection tests
    ├── formatText.test.js      # Markdown formatter tests
    ├── contactForm.test.js     # Form validation tests
    └── netlify-chat.test.js    # Netlify function tests
```

---

## Getting Started

### Prerequisites
- Node.js 18+

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Mohammedkarim-MK/mk-portfolio.git
cd mk-portfolio

# 2. Install dev tools
npm install

# 3. Start local server
npm run dev
# Opens at http://localhost:3000
```

### Run Tests

```bash
npm test
```

---

## Environment Variables

All secrets are stored server-side via Netlify — never in the codebase.

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for MK-AI assistant |
| `RESEND_API_KEY` | Resend API key for contact form emails |
| `CONTACT_EMAIL` | Your email to receive contact messages |
| `FROM_EMAIL` | Sender address (use Resend verified domain) |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made by **Mohammed Karim** · Liverpool, UK · BSc Computer Science, LJMU

</div>
