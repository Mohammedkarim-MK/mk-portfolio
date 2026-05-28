# Changelog

All notable changes to MK Portfolio are documented here.

---

## [2.0.0] — 2025

### Added
- ✅ Netlify serverless backend for secure Groq API proxying
- ✅ `package.json` with ESLint, Prettier, and live-server scripts
- ✅ `.eslintrc.json` — JavaScript linting rules
- ✅ `.prettierrc` — consistent code formatting
- ✅ `.gitignore` — excludes secrets, node_modules, OS files
- ✅ `SECURITY.md` — documents security practices
- ✅ `CHANGELOG.md` — version history
- ✅ CSS section headers for maintainability
- ✅ Fixed image filename bug (`karim.png.png` → `karim_png.png`)
- ✅ SEO meta tags (description, Open Graph, Twitter Card)
- ✅ Canonical URL tags on all pages
- ✅ Accessibility improvements (ARIA labels, skip-to-content)

### Changed
- ✅ Groq API key moved from client-side JS to Netlify environment variable
- ✅ `mk-ai.js` updated to call `/api/chat` backend instead of Groq directly
- ✅ README rewritten with professional structure

### Security
- ✅ Removed hardcoded API key from `mk-ai.js`
- ✅ Added model fallback logic in Netlify function

---

## [1.0.0] — 2024

### Initial Release
- Portfolio homepage with hero, skills, experience, projects
- About Me page with 3D photo frame
- Contact page with form and email verification
- MK-AI chat assistant
- Dark/light theme toggle
- Responsive mobile design
