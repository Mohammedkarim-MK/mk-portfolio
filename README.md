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

Personal portfolio website for Mohammed Karim — BSc Computer Science student at Liverpool John Moores University (LJMU). Built from scratch with vanilla HTML, CSS, and JavaScript. Features an AI assistant (MK-AI), animated UI, and free contact form via Formspree.

---

## Features

- **MK-AI Assistant** — AI chat powered by Groq (Llama 4)
- **Animated Hero** — Decoder-style typewriter, floating particles, 3D tilt
- **Dark / Light Theme** — Persistent toggle with smooth transitions
- **Experience Timeline** — Interactive modals for each role
- **Skills Dashboard** — Animated progress rings and skill bars
- **Contact Form** — Submissions stored via Formspree, delivered to email
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
| Contact Form | EmailJS (sends to mk.insight@outlook.com) (free, GitHub Pages compatible) |
| Hosting | GitHub Pages (free, unlimited) |
| CI/CD | GitHub Actions |
| Tooling | ESLint, Prettier, Jest |

---

## Project Structure

```
mk-portfolio/
├── index.html                  # Home page
├── about.html                  # About Me
├── contact.html                # Contact form (Formspree)
├── MK-AI.html                  # AI Chat assistant
├── living-core.html            # Generative animation
├── profile-frame.html          # Profile showcase
├── styles.css                  # Global stylesheet
├── script.js                   # Main JS logic
├── mk-ai.js                    # MK-AI assistant logic
├── favicon.svg                 # MK brand favicon
├── mklogo.png                  # Logo
├── karim_png.png               # Profile photo
├── robots.txt                  # Search engine guidance
├── sitemap.xml                 # Site map for Google
├── netlify.toml                # Netlify config (kept for future use)
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
├── netlify/functions/
│   ├── chat.js                 # AI proxy (for future backend)
│   └── contact.js              # Contact handler (for future backend)
└── tests/
    ├── README.md
    ├── email.test.js
    ├── detectTopic.test.js
    ├── formatText.test.js
    ├── contactForm.test.js
    └── netlify-chat.test.js
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

## Contact Form Setup (Formspree)

1. Go to [formspree.io/new](https://formspree.io/new)
2. Create a free form → copy your Form ID
3. Open `script.js` → find `YOUR_FORMSPREE_ID` → replace with your ID
4. Push to GitHub — contact form is live!

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made by **Mohammed Karim** · Liverpool, UK · BSc Computer Science, LJMU

[Live Site](https://mohammedkarim-mk.github.io/mk-portfolio/) · [GitHub](https://github.com/Mohammedkarim-MK/mk-portfolio)

</div>
