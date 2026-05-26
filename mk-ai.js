// =============================================================================
// MK-AI — Universal AI Chat Interface
// Primary:   Backend server (/api/chat) — Groq / Anthropic Claude / Ollama
// Secondary: Direct Groq API (browser fallback) — set GROQ_KEY for standalone
// Fallback:  Built-in response pools for offline mode
// =============================================================================

(function mkAI() {

  // ── Configuration ────────────────────────────────────────────────────────────
  // Groq key enables the AI to work even when the backend server is offline.
  // Get a free key at https://console.groq.com (no credit card needed).
  const GROQ_KEY   = ''; // Key is now handled server-side via Netlify function
  const GROQ_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct';
  const GROQ_MODEL_FALLBACK = 'llama-3.3-70b-versatile';
  const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';

  // Backend URL: update this to your deployed Render URL after deployment
  // e.g. 'https://mkinsight-backend.onrender.com'  — leave '/' for local dev
  const BACKEND_URL = '/api/chat'; // Netlify serverless function

  const SYSTEM_PROMPT = `You are MK-AI, a highly capable, knowledgeable AI assistant built into Mohammed Karim's portfolio website (mkinsight.com). You give direct, accurate, and helpful answers on ANY topic. No question is too simple or too complex.

Topics you handle expertly:
- Programming: Python, JavaScript/TypeScript, HTML/CSS, SQL, Java, C/C++, Rust, Go, PHP, Kotlin, Swift
- Frameworks & runtimes: React 19, Next.js 15, Node.js 22, Bun, Deno 2, Express, FastAPI, Spring Boot, Laravel
- AI & LLM development: prompt engineering, LangChain, LlamaIndex, RAG pipelines, vector databases (Pinecone, Weaviate, Chroma), fine-tuning, Ollama, Hugging Face, OpenAI API, Anthropic API, Groq
- Data & ML: pandas, numpy, scikit-learn, PyTorch, TensorFlow, Power BI, Tableau, Spark
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, Prisma, Mongoose
- DevOps & Cloud: Docker, Kubernetes, GitHub Actions, AWS, GCP, Azure, Vercel, Render, Terraform
- Security, networking, algorithms, computer science theory, mathematics, career advice, and general knowledge

Knowledge & recency:
- The underlying model's training data covers up to approximately early-to-mid 2025. For anything after that, be transparent.
- CRITICAL: If asked about a product, price, event, or release you don't have data on, NEVER say "it doesn't exist" or "there is no X". It may simply be after your training cutoff. Instead say: "I don't have confirmed data on [X] — this may be after my training cutoff. Check [the official source] for the latest pricing and availability."
- iPhone 16 series was released September 2024. iPhone 17 series was released September 2025. If asked about iPhone 17 pricing, say you don't have confirmed data and direct them to apple.com.
- For rapidly changing info (product prices, stock prices, sports scores, election results, new model releases): always defer to official/current sources.

About Mohammed Karim (mention only when asked):
- BSc Computer Science student at Liverpool John Moores University (2025–2028), currently in his second year
- Skills: Python, SQL, JavaScript, HTML/CSS, Java, C/C++, Power BI, Git, MySQL, Cisco, Node.js, Express
- Experience: Freelance web developer & video editor, International Student Ambassador at LJMU, MUN logistics head
- Based in Liverpool, UK. Built this entire portfolio and AI assistant himself.

Response rules (ALWAYS follow):
- Answer DIRECTLY and IMMEDIATELY — never deflect, never ask for clarification on a clear question
- For "what is X": define it clearly first, then practical context
- For "how to": show working code or step-by-step instructions
- Use markdown: **bold**, bullet lists, fenced \`\`\`language\`\`\` code blocks
- Scale length to the question: 2–3 sentences for simple facts, thorough for complex topics
- Give the answer first, context after
- For coding: provide working, runnable, modern examples using current syntax
- If genuinely unsure, say so — never fabricate facts
- Text only — cannot generate images, videos, or audio

CRITICAL: Never say "I'm not sure what you're asking" or "Could you be more specific?" to a clear question. Just answer it.`;

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const chatBox    = document.getElementById('chatBox');
  const chatForm   = document.getElementById('chatForm');
  const chatInput  = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('sendBtn');
  const typingEl   = document.getElementById('typingIndicator');
  const charCount  = document.getElementById('charCount');
  const clearBtn   = document.getElementById('clearBtn');
  const statusLine = document.getElementById('chatStatusLine');
  const scrollFAB  = document.getElementById('scrollToBottom');
  const suggBox    = document.getElementById('suggestedPrompts');

  if (!chatForm) return;

  // ── State ───────────────────────────────────────────────────────────────────
  let history     = [];
  let isBusy      = false;
  let streamAbort = null;

  const welcomeTime = document.getElementById('welcomeTime');
  if (welcomeTime) welcomeTime.textContent = stamp();

  // ── Response rotation tracker ───────────────────────────────────────────────
  const lastIdx = {};
  function pick(pool, key) {
    if (!pool || !pool.length) return null;
    if (pool.length === 1) return pool[0];
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); }
    while (idx === lastIdx[key]);
    lastIdx[key] = idx;
    return pool[idx];
  }

  // ── Response pools ───────────────────────────────────────────────────────────
  const R = {

    greet: [
      "Hey! Great to have you here. I'm **MK-AI** — powered by real AI and built to give you genuinely useful answers on any topic. Coding problems, career strategy, data analysis, algorithms, APIs, networking, or just general knowledge — ask me anything. What's on your mind?",
      "Hello! I'm **MK-AI**, Mohammed Karim's intelligent assistant. Whether you're debugging code, learning something new, or exploring a concept you've never encountered before — ask me anything and I'll give you a real answer. Where shall we start?",
      "Hi there! I'm **MK-AI**. I give direct, expert-level answers on coding, data science, APIs, career advice, algorithms, cloud, security, and more. No filler — just real guidance. What would you like to know?"
    ],

    api: [
      "**API** stands for **Application Programming Interface** — a set of rules that lets two software systems communicate with each other.\n\nThink of it like a restaurant: you (the client) give your order to the waiter (the API), who takes it to the kitchen (the server) and brings back what you ordered (the response). You never go into the kitchen yourself.\n\n**The most common type — REST API over HTTP:**\n```javascript\n// Fetch data from a public API\nconst res = await fetch('https://api.github.com/users/octocat');\nconst data = await res.json();\nconsole.log(data.name);  // 'The Octocat'\n```\n\n**The 4 main HTTP methods:**\n- `GET` → read data (e.g. get a user profile)\n- `POST` → create something (e.g. submit a form)\n- `PUT` / `PATCH` → update something\n- `DELETE` → remove something\n\n**A real-world example — weather API:**\n```\nGET https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY\n```\nYou send a GET request with a city name → API returns temperature, humidity, conditions as JSON.\n\n**Why APIs matter:**\n- Every app you use relies on APIs (Google Maps, payment gateways, login with Google/Facebook)\n- They allow services to work together without sharing source code\n- As a developer, you'll consume APIs constantly and eventually build your own\n\nWant to know how to build your own API, or how to use a specific one?",

      "**API (Application Programming Interface)** is how software talks to other software. It defines *what requests you can make*, *how to make them*, and *what you'll get back*.\n\n**Simple real example — your bank's mobile app:**\n- The app doesn't store your balance — it calls the bank's API\n- API request: `GET /api/accounts/12345/balance`\n- API response: `{ \"balance\": 1234.56, \"currency\": \"GBP\" }`\n\n**Types of APIs:**\n- **REST** (most common) → uses HTTP, returns JSON\n- **GraphQL** → you specify exactly the data shape you want\n- **WebSockets** → real-time, two-way communication (live chat, games)\n- **gRPC** → high performance, used internally between services\n\n**Building a simple REST API with Node.js + Express:**\n```javascript\nconst express = require('express');\nconst app = express();\napp.use(express.json());\n\n// Define an endpoint\napp.get('/api/users/:id', async (req, res) => {\n  const user = await db.find(req.params.id);\n  if (!user) return res.status(404).json({ error: 'Not found' });\n  res.json(user);\n});\n\napp.listen(3000);\n```\n\n**Key concepts:**\n- **Endpoint** → a specific URL that does something (`/api/users`, `/api/login`)\n- **Request** → what you send (method + URL + optional body)\n- **Response** → what you get back (status code + body)\n- **Status codes**: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Server Error`\n- **Authentication**: most APIs require a key or token (`Authorization: Bearer <token>`)\n\nWhat do you want to do with APIs — consume one, build one, or understand a specific concept?"
    ],

    networking: [
      "**Networking fundamentals** — how computers actually talk to each other:\n\n**The OSI model (simplified to what matters):**\n```\nLayer 7 — Application  → HTTP, HTTPS, DNS, FTP (what you use)\nLayer 4 — Transport    → TCP (reliable) / UDP (fast, no guarantee)\nLayer 3 — Network      → IP addresses, routing\nLayer 2 — Data Link    → MAC addresses, Wi-Fi/Ethernet frames\nLayer 1 — Physical     → actual cables, radio waves\n```\n\n**TCP vs UDP — the key difference:**\n- **TCP** → handshake first, guarantees delivery in order. Used for websites, emails, file transfers\n- **UDP** → fire-and-forget, faster, no guarantee. Used for video calls, gaming, live streams\n\n**How HTTP works (every web request):**\n```\n1. You type google.com\n2. DNS lookup → resolves to IP address (e.g. 142.250.184.78)\n3. TCP handshake (SYN → SYN-ACK → ACK)\n4. HTTP GET request sent\n5. Server sends back HTML\n6. Browser renders it\n```\n\n**HTTPS = HTTP + TLS encryption:**\nTLS performs a cryptographic handshake before any data is exchanged, so everything is encrypted. That's the padlock in your browser.\n\n**IP addressing:**\n- `192.168.x.x` / `10.x.x.x` → private (local network only)\n- Everything else → public IP\n- Port `80` = HTTP, `443` = HTTPS, `22` = SSH, `3306` = MySQL\n\n**Useful commands:**\n```bash\nping google.com          # test connectivity\ntraceroute google.com    # see each hop\nnslookup google.com      # DNS lookup\ncurl -I https://google.com  # see HTTP headers\nnetstat -an              # active connections\n```\n\nWhat aspect of networking are you focusing on?"
    ],

    algorithms: [
      "**Algorithms & Data Structures** — the foundation of computer science and every coding interview:\n\n**Big-O notation** — how we measure algorithm efficiency:\n```\nO(1)      → constant time   — array index lookup\nO(log n)  → logarithmic     — binary search\nO(n)      → linear          — loop through array\nO(n log n)→ linearithmic    — efficient sorting (merge sort)\nO(n²)     → quadratic       — nested loops\nO(2ⁿ)     → exponential     — avoid this\n```\n\n**Essential data structures:**\n\n```python\n# Hash Map — O(1) lookup\nfrequency = {}\nfor char in 'hello': frequency[char] = frequency.get(char, 0) + 1\n# {'h':1, 'e':1, 'l':2, 'o':1}\n\n# Stack — LIFO (Last In, First Out)\nstack = []\nstack.append(1)  # push\nstack.pop()       # pop → 1\n\n# Queue — FIFO (First In, First Out)\nfrom collections import deque\nq = deque()\nq.append(1)      # enqueue\nq.popleft()       # dequeue → 1\n```\n\n**Binary search — O(log n):**\n```python\ndef binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1\n```\n\n**Two-pointer pattern — most common interview technique:**\n```python\n# Find pair summing to target\ndef two_sum_sorted(arr, target):\n    l, r = 0, len(arr) - 1\n    while l < r:\n        s = arr[l] + arr[r]\n        if s == target: return [l, r]\n        elif s < target: l += 1\n        else: r -= 1\n    return []\n```\n\nWhat specific algorithm or data structure would you like to explore?"
    ],

    linux: [
      "**Linux & the terminal** — essential for any developer:\n\n**Navigation & files:**\n```bash\npwd                   # where am I?\nls -la                # list files (including hidden, with permissions)\ncd ~/projects         # change directory\nmkdir my-project      # create folder\nrm -rf folder/        # delete folder (careful — no undo!)\ncp file.txt backup/   # copy\nmv old.txt new.txt    # rename/move\n```\n\n**File content:**\n```bash\ncat file.txt          # print file\nless file.txt         # scroll through (q to quit)\nhead -20 file.txt     # first 20 lines\ntail -f app.log       # follow live log output\ngrep -r 'error' logs/ # search recursively\n```\n\n**Process management:**\n```bash\nps aux                # list all processes\nkill -9 <PID>         # force kill process by ID\nlsof -i :3000         # what's using port 3000?\nhtop                  # interactive process viewer\n```\n\n**Permissions:**\n```bash\nchmod 755 script.sh   # rwxr-xr-x (owner can execute)\nchmod +x deploy.sh    # make executable\nsudo command          # run as root\n```\n\n**SSH:**\n```bash\nssh user@192.168.1.1  # connect to remote server\nssh -i key.pem ubuntu@ec2-ip  # connect with key file (AWS)\nscp file.txt user@server:~/   # copy file to server\n```\n\n**Package management:**\n```bash\n# Ubuntu/Debian\nsudo apt update && sudo apt install nodejs\n\n# macOS (Homebrew)\nbrew install python\n```\n\nWhat Linux task are you trying to accomplish?"
    ],

    devops: [
      "**Docker & containers** — package once, run anywhere:\n\n**Core concepts:**\n- **Image** → a blueprint (like a class in OOP)\n- **Container** → a running instance of an image (like an object)\n- **Dockerfile** → instructions to build an image\n- **Registry** → where images are stored (Docker Hub, AWS ECR)\n\n**A production-ready Node.js Dockerfile:**\n```dockerfile\nFROM node:20-alpine\nWORKDIR /app\n\n# Install deps first (layer caching — only re-runs when package.json changes)\nCOPY package*.json ./\nRUN npm ci --only=production\n\nCOPY . .\nEXPOSE 3001\n\n# Run as non-root user (security best practice)\nRUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser\n\nCMD [\"node\", \"server.js\"]\n```\n\n**Docker Compose — multi-container setup:**\n```yaml\nversion: '3.9'\nservices:\n  app:\n    build: .\n    ports: ['3001:3001']\n    environment:\n      - NODE_ENV=production\n      - MONGODB_URI=mongodb://mongo:27017/myapp\n    depends_on: [mongo]\n  \n  mongo:\n    image: mongo:7\n    volumes:\n      - mongo_data:/data/db\n\nvolumes:\n  mongo_data:\n```\n\n**CI/CD with GitHub Actions:**\n```yaml\nname: Deploy\non: push: branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm test\n      - run: docker build -t myapp . && docker push myapp\n```\n\nWhat are you trying to containerise or automate?"
    ],

    aidev: [
      "**Building AI-powered apps** — the modern LLM stack:\n\n**Architecture options:**\n```\nSimple:   API call → LLM → text response\nRAG:      Query → embed → vector DB search → context + LLM → grounded answer\nAgent:    LLM + tools (web search, code exec, DB) → autonomous task completion\nFine-tune: Custom training data → adapted model weights\n```\n\n**RAG pipeline with LangChain + Chroma:**\n```python\nfrom langchain_community.vectorstores import Chroma\nfrom langchain_openai import OpenAIEmbeddings, ChatOpenAI\nfrom langchain.chains import RetrievalQA\nfrom langchain.document_loaders import PyPDFLoader\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter\n\n# 1. Load and chunk documents\nloader = PyPDFLoader('knowledge.pdf')\ndocs = loader.load()\nchunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(docs)\n\n# 2. Embed and store\nvectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())\n\n# 3. Retrieval chain\nqa = RetrievalQA.from_chain_type(\n    llm=ChatOpenAI(model='gpt-4o-mini'),\n    retriever=vectorstore.as_retriever(search_kwargs={'k': 4})\n)\n\n# 4. Query\nresult = qa.invoke('What is the refund policy?')\nprint(result['result'])\n```\n\n**Direct API call (Groq — fast, free tier):**\n```python\nfrom groq import Groq\nclient = Groq(api_key='your_key')\n\nresponse = client.chat.completions.create(\n    model='llama-3.3-70b-versatile',\n    messages=[\n        {'role': 'system', 'content': 'You are a helpful assistant.'},\n        {'role': 'user', 'content': 'Explain quantum entanglement simply.'}\n    ],\n    temperature=0.7, max_tokens=512\n)\nprint(response.choices[0].message.content)\n```\n\n**Prompt engineering best practices:**\n- Be specific about format: \"Reply in JSON with keys: title, summary, tags\"\n- Use system prompt for persona/rules, user message for the actual task\n- Few-shot examples improve consistency dramatically\n- Chain of thought: add \"Think step by step\" to improve reasoning\n- Temperature: 0.0–0.3 for factual/code, 0.6–0.9 for creative\n\n**Local models with Ollama:**\n```bash\nollama pull llama3.3  # download model\nollama run llama3.3   # interactive chat\n```\n```python\nimport ollama\nresponse = ollama.chat(model='llama3.3', messages=[{'role':'user','content':'Hello'}])\nprint(response['message']['content'])\n```\n\n**Model comparison (2026):**\n| Model | Best for | Speed | Cost |\n|---|---|---|---|\n| GPT-4o | Complex reasoning | Moderate | $$ |\n| Claude Sonnet 4.6 | Long context, coding | Fast | $$ |\n| Llama 4 Maverick | Open source, local | Fast | Free |\n| Gemini 2.0 Flash | Multimodal | Very fast | $ |\n| Groq + Llama 3.3 | Lowest latency | Ultra fast | Free tier |\n\nWhat are you building — a chatbot, RAG system, agent, or something else?"
    ],

    security: [
      "**Web Security** — the OWASP Top 10 and how to defend against them:\n\n**1. SQL Injection (most critical)**\n```javascript\n// VULNERABLE — never do this\nconst query = `SELECT * FROM users WHERE email = '${userInput}'`;\n\n// SAFE — always use parameterised queries\nconst result = await db.query('SELECT * FROM users WHERE email = $1', [userInput]);\n```\nAttacker types: `' OR '1'='1` — which becomes a query that returns all users.\n\n**2. XSS (Cross-Site Scripting)**\n```javascript\n// VULNERABLE\ndiv.innerHTML = userProvidedContent;\n\n// SAFE — escape HTML or use textContent\ndiv.textContent = userProvidedContent;\n// Or use a library like DOMPurify for rich content:\ndiv.innerHTML = DOMPurify.sanitize(userContent);\n```\n\n**3. Authentication basics**\n```javascript\nconst bcrypt = require('bcrypt');\n\n// Store passwords hashed (never plain text)\nconst hash = await bcrypt.hash(password, 12);\n\n// Verify\nconst valid = await bcrypt.compare(inputPassword, storedHash);\n```\n\n**4. JWT tokens**\n```javascript\nconst jwt = require('jsonwebtoken');\nconst token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });\n// Verify:\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\n```\n\n**Security checklist for any web app:**\n- Use HTTPS everywhere\n- Hash passwords with bcrypt (cost factor 10-12)\n- Validate and sanitise all user input\n- Use parameterised queries\n- Set security headers (use `helmet` in Express)\n- Rate limit sensitive endpoints\n- Never store secrets in code — use environment variables\n\nWhat specific security topic do you need help with?"
    ],

    database: [
      "**Database design** — building data models that scale:\n\n**Relational (SQL) vs Non-relational (NoSQL):**\n\n| | SQL (PostgreSQL/MySQL) | NoSQL (MongoDB) |\n|---|---|---|\n| Structure | Tables, rows, columns | Documents (JSON) |\n| Schema | Fixed | Flexible |\n| Relationships | JOINs | Embedding or referencing |\n| Best for | Complex queries, transactions | Flexible data, rapid dev |\n| ACID | Full | Partial (MongoDB 4+) |\n\n**SQL schema design:**\n```sql\nCREATE TABLE users (\n  id       SERIAL PRIMARY KEY,\n  email    VARCHAR(255) UNIQUE NOT NULL,\n  name     VARCHAR(100) NOT NULL,\n  created  TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE orders (\n  id       SERIAL PRIMARY KEY,\n  user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,\n  total    DECIMAL(10,2) NOT NULL,\n  status   VARCHAR(20) DEFAULT 'pending',\n  created  TIMESTAMP DEFAULT NOW()\n);\n\nCREATE INDEX idx_orders_user ON orders(user_id);  -- critical for JOIN performance\n```\n\n**MongoDB schema (Mongoose):**\n```javascript\nconst orderSchema = new mongoose.Schema({\n  user:    { type: mongoose.ObjectId, ref: 'User', required: true },\n  items:   [{ product: String, qty: Number, price: Number }],\n  total:   { type: Number, required: true },\n  status:  { type: String, enum: ['pending','paid','shipped'], default: 'pending' }\n}, { timestamps: true });\n```\n\n**When to embed vs reference in MongoDB:**\n- **Embed** → data is accessed together, small, doesn't change much (e.g. order items inside order)\n- **Reference** → data is large, shared across documents, or changes independently (e.g. user referenced in orders)\n\nWhat database design problem are you working on?"
    ],

    python: [
      "**Python** is the most versatile language in modern tech. Here's a comprehensive breakdown:\n\n**Core you can't skip:**\n- Data types, control flow, functions, list/dict comprehensions\n- OOP: classes, inheritance, `__init__`, `@property`\n- Error handling: `try/except/finally` with specific exception types\n- File I/O: always use `with open(...)` — the context manager handles cleanup\n\n**A real data analysis workflow:**\n```python\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('sales.csv')\ndf.dropna(subset=['revenue'], inplace=True)\ndf['profit_margin'] = (df['profit'] / df['revenue']) * 100\n\nmonthly = df.groupby('month')['profit_margin'].mean()\nmonthly.plot(kind='bar', color='#ff2a2a', title='Monthly Profit Margin')\nplt.tight_layout(); plt.show()\n```\n\n**Common pitfalls:**\n- Mutable default arguments: use `def fn(data=None)` not `def fn(data=[])`\n- Not using virtual environments — always isolate with `venv` or `conda`\n- `import *` pollutes the namespace — import explicitly\n\n**Learning path:** CS50P (Harvard, free) → *Automate the Boring Stuff* → Real Python → build a real project\n\nWhat specific Python problem or goal are you working towards?",

      "**Python for different goals:**\n\n**Data Analysis → pandas + numpy + matplotlib**\n```python\nimport pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.describe())  # instant statistical summary\ncorr = df[['age','income','score']].corr()\nprint(corr)\n```\n\n**Web Backend → Flask or FastAPI**\n```python\nfrom fastapi import FastAPI\napp = FastAPI()\n\n@app.get('/api/users/{user_id}')\nasync def get_user(user_id: int):\n    return {'id': user_id, 'name': 'Karim'}\n```\n\n**Automation → requests + schedule**\n```python\nimport requests, schedule, time\n\ndef daily_report():\n    data = requests.get('https://api.example.com/stats').json()\n    print(f\"Daily users: {data['users']}\")\n\nschedule.every().day.at('09:00').do(daily_report)\nwhile True: schedule.run_pending(); time.sleep(60)\n```\n\n**Machine Learning → scikit-learn**\n```python\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\nprint(f'Accuracy: {model.score(X_test, y_test):.2f}')\n```\n\nWhich direction are you heading?"
    ],

    javascript: [
      "**JavaScript** is the only language that runs natively in the browser — and with Node.js, it runs everywhere.\n\n**The fundamentals you must understand deeply:**\n- Closures: functions that remember their outer scope\n- `this` binding: arrow functions fix the confusing `this` behaviour\n- The event loop: JS is single-threaded but non-blocking\n- Prototypal inheritance vs ES6 classes\n\n**Async patterns — all three:**\n```javascript\n// Promises\nfetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// async/await (cleanest)\nasync function loadUser(id) {\n  try {\n    const res = await fetch(`/api/users/${id}`);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return await res.json();\n  } catch (err) {\n    console.error('Failed:', err.message);\n  }\n}\n\n// Parallel fetching\nconst [users, posts] = await Promise.all([\n  fetch('/api/users').then(r => r.json()),\n  fetch('/api/posts').then(r => r.json())\n]);\n```\n\n**ES6+ features worth mastering:**\n- Destructuring: `const { name, age } = user`\n- Optional chaining: `user?.address?.city`\n- Nullish coalescing: `value ?? 'default'`\n- Spread: `[...arr1, ...arr2]`\n\nWhat are you building or what concept needs untangling?"
    ],

    htmlcss: [
      "**HTML & CSS** — the foundation of the web. Let me give you the parts that actually matter:\n\n**HTML you should actually know:**\n- Semantic elements: `<header>`, `<main>`, `<article>`, `<section>` — these matter for accessibility and SEO\n- Forms: `required`, `pattern`, `aria-label`\n- `<picture>` and `srcset` for responsive images\n\n**How to print 'Hello World' in HTML:**\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Hello World</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>This is my first webpage.</p>\n</body>\n</html>\n```\nSave as `index.html`, open in browser — done.\n\n**CSS Flexbox:**\n```css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}\n```\n\n**CSS Grid — responsive with no media queries:**\n```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 24px;\n}\n```\n\n**Fluid typography with clamp():**\n```css\nfont-size: clamp(1rem, 2.5vw, 1.5rem); /* min, responsive, max */\n```\n\nWhat are you building or stuck on?"
    ],

    sql: [
      "**SQL** is non-negotiable for any data role. Here's the core:\n\n**Aggregations:**\n```sql\nSELECT\n  category,\n  COUNT(*) AS order_count,\n  SUM(revenue) AS total_revenue,\n  AVG(revenue) AS avg_value\nFROM orders\nWHERE status = 'completed'\nGROUP BY category\nHAVING COUNT(*) > 10\nORDER BY total_revenue DESC;\n```\n\n**JOINs:**\n```sql\n-- Find customers who have NEVER placed an order\nSELECT u.name\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE o.id IS NULL;  -- anti-join pattern\n```\n\n**Window functions — interview gold:**\n```sql\nSELECT\n  name, department, salary,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,\n  SUM(salary) OVER (ORDER BY hire_date) AS running_total\nFROM employees;\n```\n\n**CTEs for readable complex queries:**\n```sql\nWITH monthly AS (\n  SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue\n  FROM orders GROUP BY 1\n)\nSELECT month, revenue,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS growth\nFROM monthly;\n```\n\nQuery execution order (crucial): `FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`\n\nWhat SQL concept or problem are you working on?"
    ],

    career: [
      "**Breaking into tech** — what actually moves the needle:\n\n**Your priority stack:**\n1. **Portfolio projects** → real code on GitHub, deployed and working. This is the #1 thing for junior roles.\n2. **Technical fundamentals** → data structures, algorithms, system design basics\n3. **LinkedIn presence** → active, not passive. Recruiters search it constantly.\n4. **Tailored applications** → 10 quality applications beat 100 generic ones\n5. **Networking** → 70-80% of tech jobs come through referrals\n\n**CV structure (one page always):**\n- Contact + LinkedIn/GitHub at top\n- Skills: categorised (Languages, Frameworks, Tools, Cloud)\n- Projects: 2-3 with bullet points describing *impact*, not just what you built\n- Education + Experience\n- Quantify: *\"reduced load time by 40%\"* beats *\"improved performance\"*\n\n**Technical interview prep:**\n- LeetCode Easy/Medium (NeetCode roadmap is excellent)\n- SQL on LeetCode or Mode Analytics\n- System design basics: databases, caching, load balancing\n\n**STAR method for behavioural questions:**\n- **S**ituation → brief context\n- **T**ask → your specific responsibility\n- **A**ction → what *you* did\n- **R**esult → measurable outcome\n\nWhat role are you targeting? I can give much more specific advice."
    ],

    data: [
      "**Data Analysis / Data Science** — comprehensive roadmap:\n\n**Core skills — non-negotiable:**\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv('data.csv')\nprint(df.info())           # data types + nulls\nprint(df.describe())       # statistical summary\n\n# Data cleaning\ndf.dropna(subset=['age'], inplace=True)\ndf['income'].fillna(df['income'].median(), inplace=True)\n\n# Analysis\ncorr = df[['age', 'income', 'score']].corr()\nmonthly = df.groupby(df['date'].dt.month)['revenue'].sum()\n```\n\n**What separates a good analyst from a great one:**\n- Good: knows the tools\n- Great: asks *\"What decision does this analysis need to inform?\"* before touching data\n- Translates numbers into business language non-technical stakeholders care about\n\n**The complete analysis workflow:**\n```\n1. Define the question  → \"Why did sales drop 18% in March?\"\n2. Identify data sources → orders, marketing spend, inventory\n3. Explore            → summary stats, distributions, missing data\n4. Clean + analyse    → segment by region, product, channel\n5. Visualise          → clear charts with clear labels\n6. Communicate        → finding + evidence + recommended action\n```\n\n**Tools:** pandas + SQL + Power BI/Tableau + matplotlib/seaborn\n\nAre you focusing on the analyst path or data science/ML path?"
    ],

    cloud: [
      "**Cloud Computing** — what it means and how to start:\n\n**The three major platforms:**\n- **AWS** → largest ecosystem (200+ services), most job demand globally. Start here.\n- **GCP** → strongest for data and ML (BigQuery is exceptional)\n- **Azure** → dominant in enterprise, especially Microsoft shops\n\n**AWS core services:**\n```\nCompute:    EC2 (VMs), Lambda (serverless functions)\nStorage:    S3 (files/objects), EBS (disk for EC2)\nDatabase:   RDS (managed SQL), DynamoDB (managed NoSQL)\nNetworking: VPC (private network), CloudFront (CDN)\nSecurity:   IAM (access control) — the most critical service\n```\n\n**A complete serverless stack (near-zero cost):**\n`S3` (host static site) + `CloudFront` (CDN) + `API Gateway` + `Lambda` (functions) + `DynamoDB` (database)\n\n**Lambda function example:**\n```python\nimport json\nimport boto3\n\ndef lambda_handler(event, context):\n    body = json.loads(event['body'])\n    # ... your logic here\n    return {\n        'statusCode': 200,\n        'body': json.dumps({'result': 'success'})\n    }\n```\n\n**Certification path:** Cloud Practitioner (2-3 weeks) → Solutions Architect Associate (2-3 months)\n\nWhat's drawing you to cloud — career, a project, or curiosity?"
    ],

    git: [
      "**Git** — what you actually need to know:\n\n**Daily commands:**\n```bash\ngit status                    # what's changed?\ngit log --oneline --graph     # visual history\ngit stash                     # save work temporarily\ngit stash pop                 # restore saved work\ngit diff --staged             # review what you're about to commit\n```\n\n**The professional workflow:**\n```bash\ngit checkout -b feat/user-auth  # always branch from main\n# make changes...\ngit add -p                       # stage selectively\ngit commit -m \"feat(auth): add JWT token validation\"\ngit push origin feat/user-auth\n# Open Pull Request → review → merge\n```\n\n**Commit message format:** `type(scope): description`\n- `feat(api): add rate limiting`\n- `fix(auth): handle expired token`\n- `docs(readme): add deployment steps`\n\n**Undoing mistakes:**\n```bash\ngit reset HEAD~1 --soft   # undo last commit, keep changes staged\ngit reset HEAD~1 --mixed  # undo last commit, keep changes unstaged\ngit revert <hash>         # safe undo — creates a new commit\n```\n\n**Rule:** `revert` is always safer than `reset` on shared branches. Never force-push to `main`.\n\nWhat Git scenario are you dealing with?"
    ],

    react: [
      "**React** — the dominant frontend framework:\n\n**Hooks — the modern React API:**\n```jsx\nimport { useState, useEffect } from 'react';\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    async function fetchUser() {\n      setLoading(true);\n      const res = await fetch(`/api/users/${userId}`);\n      setUser(await res.json());\n      setLoading(false);\n    }\n    fetchUser();\n  }, [userId]);\n\n  if (loading) return <div>Loading...</div>;\n  return <div>{user?.name}</div>;\n}\n```\n\n**State management:**\n- `useState` → local component state\n- `useContext` → share state without prop drilling\n- Zustand/Jotai → lightweight global state\n- Redux Toolkit → large apps with complex state\n\n**Performance:**\n- `React.memo` → skip re-render if props unchanged\n- `useMemo` → memoize expensive calculations\n- `useCallback` → stable function reference\n\n**Data fetching (use React Query, not raw useEffect):**\n```jsx\nconst { data, isLoading, error } = useQuery({\n  queryKey: ['users'],\n  queryFn: () => fetch('/api/users').then(r => r.json())\n});\n```\n\nWhat are you building with React?"
    ],

    study: [
      "**Evidence-backed study strategies:**\n\n**Active Recall** — most powerful technique:\nClose your notes and try to recall what you learned. Stronger than re-reading. After learning a concept, explain it out loud without looking.\n\n**Spaced Repetition:**\n```\nDay 1:  Learn\nDay 2:  Review (30% already forgotten)\nDay 7:  Review again\nDay 21: Review again\nDay 60: Review again\n```\nAnki automates this for free. Extremely effective for syntax, algorithms, SQL.\n\n**The Feynman Technique:**\n1. Learn the concept\n2. Explain it as if teaching a complete beginner\n3. The gaps in your explanation = gaps in your understanding\n4. Go back and fill the gaps\n\n**For coding specifically:**\n- Build projects, don't just follow tutorials\n- Type examples manually (never copy-paste)\n- 45 minutes daily beats 6-hour weekend sessions\n\nWhat are you currently trying to master?"
    ],

    projects: [
      "**Project ideas by level:**\n\n**Beginner:**\n- Weather App — `fetch()`, async/await, DOM manipulation\n- Expense Tracker — CRUD, localStorage\n- Portfolio site — HTML/CSS/JS, fully responsive\n\n**Intermediate:**\n- Task Management API — Express, SQLite, JWT auth\n- Data Dashboard — Python + pandas + matplotlib\n- Personal Finance Analyser — import bank CSV, visualise spending\n\n**Advanced:**\n- ML model + API — train classifier, deploy with FastAPI, build UI\n- Real-time Chat — WebSockets, Node.js, MongoDB\n- URL Shortener with analytics — Redis caching, click tracking\n\n**What makes a portfolio project stand out:**\n1. It solves a real problem\n2. It's deployed and publicly accessible\n3. README tells a story: problem → approach → result\n4. Has error handling and edge cases\n5. Has a live demo URL\n\n**MVP first:** build the smallest useful version, deploy it, then add features.\n\nWhat technologies do you want to use?"
    ],

    powerbi: [
      "**Power BI** — what actually matters:\n\n**Data modelling first (everything depends on this):**\n- Star schema: fact tables (transactions) + dimension tables (products, dates, customers)\n- One-to-many relationships are standard\n- Never use many-to-many unless unavoidable\n\n**DAX — the essential functions:**\n```dax\n-- CALCULATE: the most important DAX function\nRevenue Last Year = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[Date]))\n\n-- Running total\nYTD Revenue = TOTALYTD([Total Revenue], 'Date'[Date])\n\n-- Percent of total\nProduct % = DIVIDE([Product Revenue], CALCULATE([Total Revenue], ALL('Product')))\n\n-- Variables (best practice)\nRevenue Gap =\nVAR current = [Total Revenue]\nVAR target  = [Revenue Target]\nRETURN current - target\n```\n\n**Report design principles:**\n- One key insight per page\n- Consistent colour palette\n- Filters at top or left\n- Every chart needs a title and clear labels\n\nWhat are you trying to build or analyse in Power BI?"
    ],

    php: [
      "**PHP** powers ~77% of the web (including WordPress). Modern PHP 8.x is a capable language.\n\n```php\n<?php\n// Connect to MySQL safely with PDO\n$pdo = new PDO('mysql:host=localhost;dbname=myapp', 'user', 'pass');\n\n// Prepared statements — ALWAYS use these (prevents SQL injection)\n$stmt = $pdo->prepare('SELECT name, email FROM users WHERE id = ?');\n$stmt->execute([$id]);\n$user = $stmt->fetch(PDO::FETCH_ASSOC);\n\n// PHP 8 features\n$status = match($code) {\n    200 => 'OK',\n    404 => 'Not Found',\n    500 => 'Server Error',\n    default => 'Unknown'\n};\n\n// Null safe operator\n$city = $user?->address?->city ?? 'Unknown';\n```\n\n**Laravel** is the reason to learn PHP today — elegant, full-featured:\n```php\n// Eloquent ORM\n$users = User::where('active', true)->with('orders')->paginate(20);\n\n// Routes\nRoute::get('/api/users/{id}', [UserController::class, 'show']);\n```\n\nAre you using PHP for WordPress, Laravel, or something else?"
    ],

    java: [
      "**Java** — enterprise backend, Android, and big data:\n\n```java\n// Spring Boot REST API\n@RestController\n@RequestMapping(\"/api/users\")\npublic class UserController {\n    @Autowired private UserRepository repo;\n\n    @GetMapping\n    public List<User> all() { return repo.findAll(); }\n\n    @GetMapping(\"/{id}\")\n    public ResponseEntity<User> one(@PathVariable Long id) {\n        return repo.findById(id)\n            .map(ResponseEntity::ok)\n            .orElse(ResponseEntity.notFound().build());\n    }\n\n    @PostMapping\n    public ResponseEntity<User> create(@Valid @RequestBody User user) {\n        return ResponseEntity.status(201).body(repo.save(user));\n    }\n}\n```\n\n**Java 8+ you must know:**\n- Streams: `list.stream().filter(...).map(...).collect(...)`\n- Lambdas: `(x) -> x * 2`\n- Optional: `Optional.ofNullable(value).orElse(\"default\")`\n- Records (Java 16+): `record Point(int x, int y) {}`\n\n**Where Java is used:** enterprise backends (Spring Boot), Android, Kafka, Spark, financial systems.\n\nAre you learning Java for Android, enterprise backend, or university?"
    ],

    languages: [
      "**Language guide by goal:**\n\n- **Web backend** → Go (fast, simple, built-in concurrency) or Rust (memory safe, blazing fast)\n- **Android** → Kotlin (official, modern Java replacement)\n- **iOS / macOS** → Swift (Apple's language, clean syntax)\n- **Systems / OS / embedded** → C++, then Rust\n- **Data science** → Python (already covers it)\n\n**Go in 30 seconds:**\n```go\npackage main\nimport \"fmt\"\nfunc main() { fmt.Println(\"Hello, World!\") }\n// Compile + run: go run main.go\n// Build binary: go build -o app main.go\n```\n\n**Rust in 30 seconds:**\n```rust\nfn main() {\n    let s = String::from(\"hello\"); // owned\n    let r = &s;                    // borrow (no copy, no clone)\n    println!(\"{}\", r);\n} // s is automatically freed here\n```\nRust prevents memory bugs at compile time — no garbage collector, no use-after-free.\n\nWhich language are you exploring and what's the goal?"
    ],

    mk: [
      "**Mohammed Karim** is a second-year Computer Science student at Liverpool John Moores University (BSc, 2025–2028), based in Liverpool, UK.\n\nTechnical skills: Python, SQL, JavaScript, HTML/CSS, Java, C/C++, Power BI, Git, MySQL, Cisco, Node.js, Express\n\nExperience: freelance web developer & video editor, International Student Ambassador at LJMU, Head of Logistics & Security for MUN events.\n\nThis entire portfolio — the dark neon design, animations, Node.js backend, and the AI assistant you're talking to — was built by Mohammed from scratch.\n\nTo get in touch, head to the **Contact** page.",

      "Mohammed Karim built this portfolio to showcase his full-stack capabilities. Everything here — the dark neon aesthetic, the animated backgrounds, the AI chat interface, the email verification system — is his original work built with HTML/CSS/JavaScript and a Node.js + MongoDB backend.\n\n- Currently studying: BSc Computer Science at LJMU (graduating 2028), second year\n- Strongest areas: Python (data analysis, automation), SQL, JavaScript (frontend + Node.js), AI integrations\n- Currently exploring: LLM development, vector databases, cloud infrastructure\n\nWant to know anything specific about his experience or skills?"
    ],

    thanks: [
      "You're welcome! Come back whenever you need guidance — debugging at midnight, career questions, or concept deep-dives. Happy to help.",
      "Glad that was useful! Feel free to dig deeper into any of those points.",
      "Happy to help! Ask anything else anytime."
    ],

    bye: [
      "Take care! Come back whenever something comes up. Good luck with what you're building.",
      "Goodbye! Whatever you're working on — keep pushing through the difficult parts. That's where real progress happens.",
      "See you! Every day you spend building something, even imperfectly, compounds. Keep going."
    ],

    image: [
      "I'm text-only — no image or video generation. But I can help you code image-heavy UIs in CSS, process images with Python (Pillow/OpenCV), generate SVG graphics programmatically, or call an external image API like DALL-E. What are you actually trying to create?"
    ],

    unclear: [
      "I can answer that — could you type a bit more so I get the full context? I cover any topic: programming, APIs, networking, databases, algorithms, career advice, maths, science, and more.",
      "Happy to help with that. Give me the full question and I'll give you a complete answer.",
      "Tell me more and I'll answer directly — no topic is off limits."
    ]
  };

  // ── Follow-up suggestion chips ───────────────────────────────────────────────
  const SUGG = {
    api:        ['How to build a REST API?', 'What are API rate limits?', 'REST vs GraphQL explained'],
    networking: ['TCP vs UDP explained?', 'How does DNS work?', 'What is HTTPS/TLS?'],
    algorithms: ['Binary search explained', 'Big-O notation guide', 'Common interview patterns'],
    linux:      ['Useful terminal commands', 'How to SSH into a server?', 'File permissions explained'],
    aidev:      ['RAG vs fine-tuning explained', 'Best LLM for my project?', 'How to build a chatbot with LangChain?'],
    devops:     ['Docker basics explained', 'What is CI/CD?', 'Kubernetes vs Docker Compose?'],
    security:   ['Prevent SQL injection', 'How JWT auth works', 'Password hashing best practice'],
    database:   ['SQL vs NoSQL comparison', 'When to embed vs reference MongoDB?', 'Database indexing explained'],
    python:     ['Python for data analysis?', 'Best Python project ideas', 'Python libraries to learn first'],
    javascript: ['JavaScript vs TypeScript?', 'How does async/await work?', 'Best JS framework to learn?'],
    htmlcss:    ['CSS Grid vs Flexbox?', 'How to make a site mobile-friendly?', 'CSS animations tips'],
    sql:        ['SQL window functions explained', 'SQL vs pandas for data?', 'MySQL vs PostgreSQL?'],
    career:     ['How to prepare for tech interviews?', 'What should my CV include?', 'Best platforms to find tech jobs'],
    data:       ['What tools do data analysts use?', 'How to start with machine learning?', 'SQL vs Python for data?'],
    cloud:      ['AWS vs GCP vs Azure?', 'What is serverless computing?', 'Best cloud cert to get first?'],
    git:        ['Git branching strategies?', 'How to write good commit messages?', 'Git rebase vs merge?'],
    react:      ['React hooks explained', 'React vs Vue comparison', 'State management in React?'],
    study:      ['How to avoid tutorial hell?', 'Best resources to learn coding?', 'Study planning tips'],
    projects:   ['Best beginner project ideas?', 'How to build a data portfolio?', 'Project ideas for my CV?'],
    powerbi:    ['Power BI DAX basics', 'Power BI vs Tableau?', 'How to build a dashboard?'],
    php:        ['PHP vs Python for web?', 'Laravel getting started', 'PHP and MySQL tutorial'],
    java:       ['Java vs Python?', 'Spring Boot basics', 'Java for Android development?'],
    languages:  ['Rust vs C++ differences?', 'Should I learn Go?', 'Best language for my goal?']
  };

  // ── Topic detection ──────────────────────────────────────────────────────────
  function detectTopic(q) {
    const t = q.trim().toLowerCase();
    if (/^(hi|hello|hey|yo|sup|howdy|greetings)\b/i.test(q))                return 'greet';
    if (/\b(generate|create|make|draw).{0,20}(image|photo|picture|video|film)/i.test(q)) return 'image';
    // AI / LLM development
    if (/\b(llm|large\s*language\s*model|rag|retrieval.{0,10}augmented|langchain|llamaindex|vector\s*(db|database|store)|pinecone|weaviate|chroma|embeddings|prompt\s*engineer|fine.?tun|ollama|hugging\s*face|openai\s*api|anthropic\s*api|groq\s*api|chatgpt\s*api|llama\s*4|gpt.4o|claude\s*(sonnet|opus|haiku)|gemini|ai\s*agent|function\s*calling|tool\s*(use|calling))\b/i.test(q)) return 'aidev';
    // APIs
    if (/\b(api|endpoint|rest\s*api|http\s*(request|method|verb)|webhook|json\s*(api|endpoint)|swagger|openapi|postman|curl|axios)\b/i.test(q)) return 'api';
    // Networking / web
    if (/\b(tcp|udp|ip\s*address|dns|https?(?!\/)|ssl|tls|firewall|bandwidth|protocol|latency|ping|subnet|network|packet|socket|websocket)\b/i.test(q)) return 'networking';
    // Security
    if (/\b(security|hacking|cybersecurity|sql\s*injection|xss|csrf|authentication|authorization|oauth|jwt|encrypt|bcrypt|password\s*(hash|store))\b/i.test(q)) return 'security';
    // Algorithms / DS
    if (/\b(algorithm|big.?o|time\s*complexity|sorting|binary\s*search|tree|graph\s*(traversal|algorithm)|linked\s*list|hash\s*(map|table)|dynamic\s*program)\b/i.test(q)) return 'algorithms';
    // Linux / terminal
    if (/\b(linux|terminal|bash|shell|command\s*line|ubuntu|chmod|grep|sudo|unix|cli|ssh|scp)\b/i.test(q)) return 'linux';
    // DevOps
    if (/\b(docker|container|kubernetes|k8s|ci.cd|github\s*actions|jenkins|pipeline|devops|microservice|nginx|reverse\s*proxy)\b/i.test(q)) return 'devops';
    // Database
    if (/\b(mongodb|redis|elasticsearch|firebase|supabase|nosql|orm|schema|migration|mongoose|sequelize|prisma)\b/i.test(q)) return 'database';
    // Power BI / Excel
    if (/\b(power\s*bi|powerbi|tableau|excel|vlookup|xlookup|pivot|dax)\b/i.test(q)) return 'powerbi';
    // Data / ML
    if (/\b(data\s+anal|data\s+sci|dataset|kaggle|pandas|numpy|matplotlib|seaborn|scikit|sklearn|machine\s*learn)\b/i.test(q)) return 'data';
    // Python
    if (/\bpython\b/i.test(q)) return 'python';
    // React / framework
    if (/\b(react|vue\.?js|angular|next\.?js|svelte|nuxt)\b/i.test(q)) return 'react';
    // JavaScript
    if (/\b(javascript|typescript|node\.?js|npm|webpack|vite|deno)\b/i.test(q)) return 'javascript';
    // HTML/CSS
    if (/\b(html|css|flexbox|grid|sass|tailwind|bootstrap|print.*html|hello.*html)\b/i.test(q)) return 'htmlcss';
    if (/print.{0,15}hello\s*world/i.test(q)) return 'htmlcss';
    // SQL
    if (/\b(sql|mysql|postgresql|sqlite|database|query|join|select|insert|update|delete)\b/i.test(q)) return 'sql';
    // PHP
    if (/\b(php|laravel|symfony|wordpress)\b/i.test(q)) return 'php';
    // Java
    if (/\bjava\b(?!script)/i.test(q)) return 'java';
    // Other languages
    if (/\b(c\+\+|c\s*lang|cpp|rust|golang|go\s+lang|kotlin|swift)\b/i.test(q)) return 'languages';
    // Career
    if (/\b(career|job|interview|cv|resume|linkedin|salary|hire|employ|internship)\b/i.test(q)) return 'career';
    // Git
    if (/\b(git|github|gitlab|commit|branch|merge|rebase|push|pull\s*request)\b/i.test(q)) return 'git';
    // Cloud
    if (/\b(aws|gcp|azure|cloud|lambda|s3|ec2|serverless|render|vercel|netlify)\b/i.test(q)) return 'cloud';
    // Study
    if (/\b(study|learn|focus|productive|tutorial\s*hell|resources|roadmap)\b/i.test(q)) return 'study';
    // Projects
    if (/\b(project|idea|build|portfolio|app|website|tool)\b/i.test(q)) return 'projects';
    // MK
    if (/\b(mohammed|karim|\bmk\b|portfolio|about you|who made|who built)\b/i.test(q)) return 'mk';
    // Social
    if (/\b(thank|thanks|cheers|appreciated|helpful)\b/i.test(q)) return 'thanks';
    if (/\b(bye|goodbye|see you|cya|later|take care)\b/i.test(q)) return 'bye';
    return 'unclear';
  }

  // ── Contextual fallback ──────────────────────────────────────────────────────
  function fallback(msg, priorHistory) {
    const topic = detectTopic(msg);

    if (topic === 'unclear') {
      const trimmed = msg.trim();
      const wordCount = trimmed.split(/\s+/).length;
      const isNewQuestion = /^(what|who|how|why|when|where|explain|define|tell\s+me\s+about|describe|give\s+me)\b/i.test(trimmed);

      if (!isNewQuestion && wordCount <= 5 && priorHistory.length > 0) {
        const recentText = priorHistory.slice(-6).map(h => h.content).join(' ').toLowerCase();
        if (/python/i.test(recentText))         return pick(R.python, 'python');
        if (/javascript/i.test(recentText))     return pick(R.javascript, 'javascript');
        if (/\b(html|css)\b/i.test(recentText)) return pick(R.htmlcss, 'htmlcss');
        if (/\bsql\b/i.test(recentText))        return pick(R.sql, 'sql');
        if (/\bdata\b/i.test(recentText))       return pick(R.data, 'data');
        if (/\bapi\b/i.test(recentText))        return pick(R.api, 'api');
        if (/career|job/i.test(recentText))     return pick(R.career, 'career');
      }
    }

    return pick(R[topic] || R.unclear, topic);
  }

  // ── Direct Groq API call (browser fallback — no server needed) ───────────────
  async function callGroqDirect(text, priorHistory) {
    if (!GROQ_KEY) return null;
    try {
      const msgs = [{ role: 'system', content: SYSTEM_PROMPT }];
      priorHistory.forEach(m => {
        if ((m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string') {
          if (!msgs.length || msgs[msgs.length - 1].role !== m.role) {
            msgs.push({ role: m.role, content: m.content.slice(0, 2000) });
          }
        }
      });
      if (!msgs.length || msgs[msgs.length - 1].role !== 'user') {
        msgs.push({ role: 'user', content: text });
      } else {
        msgs[msgs.length - 1].content = text;
      }
      // Try primary model first, fall back to secondary on error
      let res = await fetchWithTimeout(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages: msgs, temperature: 0.7, top_p: 0.9, max_tokens: 1024 })
      }, 30000);
      if (!res.ok) {
        res = await fetchWithTimeout(GROQ_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({ model: GROQ_MODEL_FALLBACK, messages: msgs, temperature: 0.7, top_p: 0.9, max_tokens: 1024 })
        }, 30000);
      }
      if (!res.ok) return null;
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    }
  }

  // ── Core send flow ───────────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (isBusy) return;
    isBusy = true;
    clearSuggestions();
    resetInput();
    appendMsg('user', text);

    const priorHistory = history.slice(-10);

    showTyping();
    setStatus('Thinking…', true);

    let reply;

    // 1. Try backend server
    try {
      const backendBase = BACKEND_URL || '';
      const res = await fetchWithTimeout(`${backendBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: priorHistory })
      }, 12000);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      reply = data.reply || null;
    } catch {
      reply = null;
    }

    // 2. Browser-side Groq (works even without the backend server)
    if (!reply) {
      reply = await callGroqDirect(text, priorHistory);
    }

    // 3. Built-in topic pools (offline)
    if (!reply) {
      reply = fallback(text, priorHistory);
    }

    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: reply });

    hideTyping();
    setStatus('Online', false);
    await appendMsg('ai', reply);

    const topic = detectTopic(text);
    if (SUGG[topic]) showSuggestions(SUGG[topic]);

    isBusy = false;
  }

  // ── Append a message bubble ──────────────────────────────────────────────────
  async function appendMsg(role, text) {
    const isAI = role === 'ai';
    const div = document.createElement('div');
    div.className = `chat-msg ${isAI ? 'ai-msg' : 'user-msg'}`;

    const textId = `msg-text-${Date.now()}`;
    div.innerHTML = `
      <div class="msg-avatar-wrap">
        <div class="msg-av ${isAI ? 'ai-av' : 'user-av'}"><span>${isAI ? 'AI' : 'You'}</span></div>
      </div>
      <div class="msg-bubble">
        <div class="msg-sender">${isAI ? 'MK-AI' : 'You'}</div>
        <div class="msg-text" id="${textId}"></div>
        <div class="msg-foot">
          <span class="msg-time">${stamp()}</span>
          ${isAI ? `<button class="msg-copy" title="Copy message" data-target="${textId}" aria-label="Copy message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>` : ''}
        </div>
      </div>
    `;

    chatBox.appendChild(div);
    scrollBottom();

    const textEl = document.getElementById(textId);
    if (isAI) {
      await streamText(textEl, text);
    } else {
      textEl.innerHTML = formatText(text);
    }

    scrollBottom();

    const copyBtn = div.querySelector('.msg-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => copyMessage(copyBtn, text));
    }
  }

  // ── Typewriter stream effect ─────────────────────────────────────────────────
  function streamText(el, rawText) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.innerHTML = formatText(rawText);
      return Promise.resolve();
    }

    return new Promise(resolve => {
      const cursor = document.createElement('span');
      cursor.className = 'stream-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      el.appendChild(cursor);

      const len = rawText.length;
      const chunkSize = len > 400 ? 6 : len > 150 ? 4 : 2;
      const baseDelay = len > 400 ? 12 : len > 150 ? 18 : 28;
      let i = 0;

      streamAbort = () => { i = rawText.length; };

      function step() {
        const end = Math.min(i + chunkSize, rawText.length);
        cursor.remove();
        el.textContent = rawText.slice(0, end);
        el.appendChild(cursor);
        i = end;

        if (i < rawText.length) {
          setTimeout(step, baseDelay + Math.floor(Math.random() * 8));
        } else {
          cursor.remove();
          el.innerHTML = formatText(rawText);
          streamAbort = null;
          scrollBottom();
          resolve();
        }
      }
      step();
    });
  }

  // ── Suggestion chips ─────────────────────────────────────────────────────────
  function showSuggestions(chips) {
    if (!suggBox || !chips.length) return;
    suggBox.innerHTML = chips.map(c =>
      `<button class="sugg-chip" type="button">${c}</button>`
    ).join('');
    suggBox.style.display = 'flex';
    suggBox.querySelectorAll('.sugg-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isBusy) return;
        chatInput.value = btn.textContent;
        chatInput.dispatchEvent(new Event('input'));
        sendMessage(btn.textContent);
      });
    });
  }

  function clearSuggestions() {
    if (suggBox) { suggBox.innerHTML = ''; suggBox.style.display = 'none'; }
  }

  // ── Copy to clipboard ────────────────────────────────────────────────────────
  async function copyMessage(btn, text) {
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      btn.title = 'Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.title = 'Copy message'; }, 1800);
    } catch { /* clipboard unavailable */ }
  }

  // ── Typing indicator ─────────────────────────────────────────────────────────
  function showTyping() {
    typingEl.style.display = 'flex';
    sendBtn.disabled = true;
    chatInput.disabled = true;
    scrollBottom();
  }

  function hideTyping() {
    typingEl.style.display = 'none';
    chatInput.disabled = false;
    sendBtn.disabled = chatInput.value.trim().length === 0;
    chatInput.focus();
  }

  function resetInput() {
    chatInput.value = '';
    chatInput.style.height = 'auto';
    charCount.textContent = '0 / 2000';
    charCount.style.color = '';
    sendBtn.disabled = true;
  }

  function setStatus(text, thinking) {
    if (!statusLine) return;
    statusLine.innerHTML = `<span class="chat-status-dot${thinking ? ' thinking' : ''}"></span>${text}`;
  }

  function scrollBottom() {
    requestAnimationFrame(() => {
      chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    });
  }

  // ── Scroll-to-bottom FAB ─────────────────────────────────────────────────────
  if (scrollFAB) {
    chatBox.addEventListener('scroll', () => {
      const gap = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
      scrollFAB.classList.toggle('visible', gap > 120);
    });
    scrollFAB.addEventListener('click', scrollBottom);
  }

  // ── Input events ─────────────────────────────────────────────────────────────
  chatInput.addEventListener('input', () => {
    const len = chatInput.value.length;
    charCount.textContent = `${len} / 2000`;
    charCount.style.color = len > 1800 ? 'var(--neon-bright)' : '';
    sendBtn.disabled = chatInput.value.trim().length === 0 || isBusy;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 130) + 'px';
  });

  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled && !isBusy) chatForm.dispatchEvent(new Event('submit'));
    }
    if (streamAbort) { streamAbort(); streamAbort = null; }
  });

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || isBusy) return;
    sendMessage(text);
  });

  clearBtn && clearBtn.addEventListener('click', () => {
    if (isBusy) return;
    chatBox.querySelectorAll('.chat-msg:not(#welcomeMsg)').forEach(m => m.remove());
    history = [];
    clearSuggestions();
  });

  // ── Markdown → HTML formatter ────────────────────────────────────────────────
  function formatText(raw) {
    let s = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
      `\x00PRE\x00${code.trim()}\x00ENDPRE\x00`
    );

    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    s = s.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

    const lines = s.split('\n');
    const out   = [];
    let inUl = false, inOl = false;

    for (const line of lines) {
      const ul = line.match(/^[-•]\s+(.+)/);
      const ol = line.match(/^\d+\.\s+(.+)/);

      if (ul) {
        if (inOl) { out.push('</ol>'); inOl = false; }
        if (!inUl) { out.push('<ul>'); inUl = true; }
        out.push(`<li>${ul[1]}</li>`);
      } else if (ol) {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (!inOl) { out.push('<ol>'); inOl = true; }
        out.push(`<li>${ol[1]}</li>`);
      } else {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
        out.push(line === '' ? '<div class="msg-gap"></div>' : line);
      }
    }
    if (inUl) out.push('</ul>');
    if (inOl) out.push('</ol>');

    s = out.join('\n').replace(/\n(?!<\/?(ul|ol|li|div))/g, '<br>');
    s = s.replace(/\x00PRE\x00([\s\S]*?)\x00ENDPRE\x00/g,
      (_, code) => `<pre class="code-block"><code>${code}</code></pre>`
    );

    return s;
  }

  // ── Utilities ────────────────────────────────────────────────────────────────
  function stamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function fetchWithTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
  }

})();
