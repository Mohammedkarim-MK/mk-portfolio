<div align="center">

# MK Portfolio

**Mohammed Karim — Data Analyst · Web Developer · Content Creator**

[![Live Site](https://img.shields.io/badge/Live%20Site-mkinsight.pages.dev-ff2a2a?style=for-the-badge&logo=cloudflare)](https://mkinsight.pages.dev)
[![GitHub](https://img.shields.io/badge/GitHub-Mohammedkarim--MK-181717?style=for-the-badge&logo=github)](https://github.com/Mohammedkarim-MK/mk-portfolio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-73%20passing-brightgreen?style=for-the-badge&logo=jest)](tests/)

</div>

---

## About

Personal portfolio website for Mohammed Karim — BSc Computer Science student at Liverpool John Moores University (LJMU). Built from scratch with vanilla HTML, CSS, and JavaScript. Features an AI assistant (MK-AI), animated UI, and free contact form via EmailJS.

---

## Features

- **MK-AI Assistant** — AI chat powered by Groq (Llama 4)
- **Animated Hero** — Decoder-style typewriter, floating particles, 3D tilt
- **Dark / Light Theme** — Persistent toggle with smooth transitions
- **Experience Timeline** — Interactive modals for each role
- **Skills Dashboard** — Animated progress rings and skill bars
- **Contact Form** — Submissions sent via EmailJS, delivered to email
- **Living Core** — Generative canvas animation page
- **Fully Responsive** — Mobile-first, works across all devices
- **Accessible** — Skip-to-content, ARIA labels, keyboard navigation
- **SEO Ready** — Open Graph, Twitter Card, canonical URLs, sitemap, robots.txt
- **CI/CD** — GitHub Actions runs 73 tests on every push

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, animations, grid, flexbox) |
| Logic | Vanilla JavaScript (ES2021) |
| AI | Groq API — Llama 4 Maverick |
| Contact Form | EmailJS (sends to mk.insight@outlook.com) |
| Hosting | Cloudflare Pages (static) + Cloudflare Workers (`workers/chat.js` Groq proxy, `workers/contact.js` Resend) |
| CI/CD | GitHub Actions |
| Tooling | ESLint, Prettier, Jest |

---

## Project Structure

```
mk-portfolio/
├── index.html                  # Home page
├── about.html                  # About Me
├── contact.html                # Contact form (EmailJS)
├── MK-AI.html                  # AI Chat assistant
├── living-core.html            # Generative animation
├── profile-frame.html          # Profile showcase
├── 404.html                    # Custom error page
├── styles.css                  # Global stylesheet
├── script.js                   # Main JS logic
├── mk-ai.js                    # MK-AI assistant logic
├── favicon.svg                 # MK brand favicon
├── mklogo.png                  # Logo
├── karim_png.png               # Profile photo
├── robots.txt                  # Search engine guidance
├── sitemap.xml                 # Site map for Google
├── wrangler.toml               # Cloudflare Worker config (chat)
├── wrangler-contact.toml       # Cloudflare Worker config (contact)
├── package.json                # Dev tooling
├── .eslintrc.json              # JS linting
├── .prettierrc                 # Code formatting
├── .gitignore                  # Excludes secrets
├── README.md                   # This file
├── LICENSE                     # MIT License
├── CHANGELOG.md                # Version history
├── SECURITY.md                 # Security policy
├── CONTRIBUTING.md             # Contribution guide
├── .github/workflows/
│   └── test.yml                # CI/CD pipeline
├── workers/
│   ├── chat.js                 # Cloudflare Worker — MK-AI Groq proxy
│   └── contact.js              # Cloudflare Worker — contact handler (Resend)
└── tests/
    ├── README.md
    ├── email.test.js
    ├── detectTopic.test.js
    ├── formatText.test.js
    └── contactForm.test.js
```

---

## Getting Started

```bash
git clone https://github.com/Mohammedkarim-MK/mk-portfolio.git
cd mk-portfolio
npm install
npm run dev
```

---

## Contact Form Setup (EmailJS)

1. Create a free account at [emailjs.com](https://www.emailjs.com/)
2. Add an email service and an email template
3. Open `script.js` → update `service_id`, `template_id` and `user_id` (your EmailJS public key) in the `api.emailjs.com` requests
4. Push to GitHub — Cloudflare Pages redeploys and the contact form is live!

---

## Cloudflare Workers

```bash
npx wrangler login

# MK-AI chat proxy (workers/chat.js)
npx wrangler secret put GROQ_API_KEY
npx wrangler deploy

# Contact worker (workers/contact.js)
npx wrangler secret put RESEND_API_KEY -c wrangler-contact.toml
npx wrangler secret put CONTACT_EMAIL  -c wrangler-contact.toml
npx wrangler secret put FROM_EMAIL     -c wrangler-contact.toml
npx wrangler deploy -c wrangler-contact.toml
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made by **Mohammed Karim** · Liverpool, UK · BSc Computer Science, LJMU

[Live Site](https://mkinsight.pages.dev) · [GitHub](https://github.com/Mohammedkarim-MK/mk-portfolio)

</div>
