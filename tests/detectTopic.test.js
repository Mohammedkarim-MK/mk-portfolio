// =============================================================================
// tests/detectTopic.test.js
// Unit tests for MK-AI topic detection logic (from mk-ai.js)
// =============================================================================

// Extracted detectTopic function — mirrors mk-ai.js logic exactly
function detectTopic(q) {
  q = q.toLowerCase();
  if (/\b(hi|hello|hey|sup|yo|howdy|good\s*(morning|afternoon|evening))\b/.test(q)) return 'greet';
  if (/\b(python|pandas|numpy|django|flask|fastapi|pip|venv|\.py)\b/i.test(q)) return 'python';
  if (/\b(javascript|js|typescript|ts|node|npm|react|vue|angular|next\.?js|deno|bun|webpack|vite)\b/i.test(q)) return 'javascript';
  if (/\b(html|css|sass|scss|tailwind|bootstrap|flexbox|grid|dom|browser)\b/i.test(q)) return 'htmlcss';
  if (/\b(sql|mysql|postgres|mongodb|database|db|query|table|join|index)\b/i.test(q)) return 'sql';
  if (/\b(data|analysis|analytics|visuali|chart|graph|dashboard|excel|power\s*bi|tableau|r\b|rstudio)\b/i.test(q)) return 'data';
  if (/\b(api|rest|graphql|endpoint|fetch|axios|request|response|json|http|curl)\b/i.test(q)) return 'api';
  if (/\b(git|github|commit|branch|merge|pull\s*request|pr|push|clone|repo)\b/i.test(q)) return 'git';
  if (/\b(job|career|resume|cv|interview|hire|salary|linkedin|freelance|internship)\b/i.test(q)) return 'career';
  if (/\b(aws|gcp|azure|cloud|lambda|s3|ec2|serverless|render|vercel|netlify)\b/i.test(q)) return 'cloud';
  if (/\b(study|learn|focus|productive|tutorial\s*hell|resources|roadmap)\b/i.test(q)) return 'study';
  if (/\b(project|idea|build|portfolio|app|website|tool)\b/i.test(q)) return 'projects';
  if (/\b(mohammed|karim|\bmk\b|portfolio|about you|who made|who built)\b/i.test(q)) return 'mk';
  if (/\b(thank|thanks|cheers|appreciated|helpful)\b/i.test(q)) return 'thanks';
  if (/\b(bye|goodbye|see you|cya|later|take care)\b/i.test(q)) return 'bye';
  return 'unclear';
}

// -----------------------------------------------------------------------------
describe('detectTopic()', () => {

  describe('greetings', () => {
    test('detects "hi"',           () => expect(detectTopic('hi')).toBe('greet'));
    test('detects "hello there"',  () => expect(detectTopic('hello there')).toBe('greet'));
    test('detects "hey!"',         () => expect(detectTopic('Hey!')).toBe('greet'));
    test('detects "good morning"', () => expect(detectTopic('good morning')).toBe('greet'));
  });

  describe('programming topics', () => {
    test('detects Python',      () => expect(detectTopic('how do I use pandas')).toBe('python'));
    test('detects JavaScript',  () => expect(detectTopic('explain React hooks')).toBe('javascript'));
    test('detects TypeScript',  () => expect(detectTopic('TypeScript generics')).toBe('javascript'));
    test('detects HTML/CSS',    () => expect(detectTopic('flexbox vs grid')).toBe('htmlcss'));
    test('detects SQL',         () => expect(detectTopic('how to write a JOIN query')).toBe('sql'));
    test('detects MongoDB',     () => expect(detectTopic('mongodb aggregation')).toBe('sql'));
    test('detects API topics',  () => expect(detectTopic('how to fetch REST API')).toBe('api'));
    test('detects Git',         () => expect(detectTopic('git merge vs rebase')).toBe('git'));
  });

  describe('data and analytics', () => {
    // NOTE: Python regex fires before data — "data analysis in Python" correctly routes to python
    test('data analysis with Python keyword routes to python', () => expect(detectTopic('data analysis in Python')).toBe('python'));
    test('detects Power BI',        () => expect(detectTopic('power bi dashboard')).toBe('data'));
    test('detects visualisation',   () => expect(detectTopic('how to visualize data')).toBe('data'));
    test('detects pure data query', () => expect(detectTopic('data analysis techniques')).toBe('data'));
  });

  describe('career and cloud', () => {
    test('detects career',    () => expect(detectTopic('how to prepare for a job interview')).toBe('career'));
    test('detects freelance', () => expect(detectTopic('freelance tips for developers')).toBe('career'));
    test('detects AWS',       () => expect(detectTopic('AWS Lambda tutorial')).toBe('cloud'));
    test('detects Netlify',   () => expect(detectTopic('how to deploy to netlify')).toBe('cloud'));
  });

  describe('about MK', () => {
    test('detects "who built this"',  () => expect(detectTopic('who built this')).toBe('mk'));
    test('detects "about you"',       () => expect(detectTopic('tell me about you')).toBe('mk'));
    test('detects "Mohammed Karim"',  () => expect(detectTopic('who is Mohammed Karim')).toBe('mk'));
  });

  describe('social', () => {
    test('detects thanks', () => expect(detectTopic('thanks that was helpful')).toBe('thanks'));
    test('detects bye',    () => expect(detectTopic('bye!')).toBe('bye'));
    test('detects cya',    () => expect(detectTopic('cya later')).toBe('bye'));
  });

  describe('fallback', () => {
    test('returns "unclear" for unknown topics', () => {
      expect(detectTopic('the meaning of life')).toBe('unclear');
    });
    test('returns "unclear" for empty string', () => {
      expect(detectTopic('')).toBe('unclear');
    });
  });
});
