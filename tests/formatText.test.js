// =============================================================================
// tests/formatText.test.js
// Unit tests for the MK-AI markdown → HTML formatter (from mk-ai.js)
// =============================================================================

// Extracted formatText function — mirrors mk-ai.js exactly
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

// -----------------------------------------------------------------------------
describe('formatText()', () => {

  describe('bold formatting', () => {
    test('wraps **text** in <strong>', () => {
      expect(formatText('**hello**')).toContain('<strong>hello</strong>');
    });

    test('handles multiple bold words', () => {
      const result = formatText('**one** and **two**');
      expect(result).toContain('<strong>one</strong>');
      expect(result).toContain('<strong>two</strong>');
    });
  });

  describe('italic formatting', () => {
    test('wraps *text* in <em>', () => {
      expect(formatText('*hello*')).toContain('<em>hello</em>');
    });
  });

  describe('inline code', () => {
    test('wraps `code` in <code>', () => {
      expect(formatText('use `console.log()`')).toContain('<code class="inline-code">console.log()</code>');
    });
  });

  describe('code blocks', () => {
    test('wraps ```code``` in <pre><code>', () => {
      const result = formatText('```\nconsole.log("hi");\n```');
      expect(result).toContain('<pre class="code-block"><code>');
      expect(result).toContain('console.log');
    });

    test('handles language-tagged code blocks', () => {
      const result = formatText('```javascript\nconst x = 1;\n```');
      expect(result).toContain('<pre class="code-block"><code>');
    });
  });

  describe('lists', () => {
    test('converts bullet list to <ul><li>', () => {
      const result = formatText('- item one\n- item two');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>item one</li>');
      expect(result).toContain('<li>item two</li>');
      expect(result).toContain('</ul>');
    });

    test('converts numbered list to <ol><li>', () => {
      const result = formatText('1. first\n2. second');
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>first</li>');
      expect(result).toContain('<li>second</li>');
      expect(result).toContain('</ol>');
    });
  });

  describe('HTML escaping (XSS prevention)', () => {
    test('escapes & character', () => {
      expect(formatText('cats & dogs')).toContain('cats &amp; dogs');
    });

    test('escapes < character', () => {
      expect(formatText('<script>')).toContain('&lt;script&gt;');
    });

    test('escapes > character', () => {
      expect(formatText('1 > 0')).toContain('1 &gt; 0');
    });

    test('prevents XSS injection', () => {
      const result = formatText('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });
  });

  describe('empty / edge cases', () => {
    test('empty string produces a msg-gap div (correct behaviour)', () => {
      // An empty line becomes a spacing div — this is intentional in the formatter
      expect(formatText('')).toContain('msg-gap');
    });

    test('handles plain text with no markdown', () => {
      expect(formatText('Hello world')).toContain('Hello world');
    });
  });
});
