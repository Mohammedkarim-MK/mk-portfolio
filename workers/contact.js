// =============================================================================
// workers/contact.js — MK Portfolio Contact Worker
// Receives contact form submissions and forwards to Mohammed's email via Resend
// Deploy: wrangler deploy --config wrangler-contact.toml
// Secrets: wrangler secret put RESEND_API_KEY --name mk-contact
//          wrangler secret put CONTACT_EMAIL  --name mk-contact
//          wrangler secret put FROM_EMAIL     --name mk-contact
// =============================================================================

const RESEND_URL = 'https://api.resend.com/emails';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
  async fetch(request, env) {

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return respond({ error: 'Method not allowed' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return respond({ error: 'Invalid JSON body' }, 400);
    }

    const { name, email, subject, message } = body;

    if (!name?.trim())    return respond({ error: 'Name is required' },    400);
    if (!email?.trim())   return respond({ error: 'Email is required' },   400);
    if (!message?.trim()) return respond({ error: 'Message is required' }, 400);

    if (!EMAIL_RE.test(email.trim())) {
      return respond({ error: 'Invalid email address' }, 400);
    }

    const RESEND_API_KEY = env.RESEND_API_KEY;
    const TO_EMAIL       = env.CONTACT_EMAIL || 'mohammed.kareem7707@gmail.com';
    const FROM_EMAIL     = env.FROM_EMAIL    || 'onboarding@resend.dev';

    if (!RESEND_API_KEY) {
      return respond({ error: 'Email service not configured' }, 500);
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0e0e0e;color:#fbfbfb;border-radius:12px;overflow:hidden;">
        <div style="background:#ff2a2a;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">📬 New Portfolio Message</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Someone contacted you via mkinsight.pages.dev</p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#999;font-size:13px;width:80px;">From</td>
              <td style="padding:8px 0;color:#fbfbfb;font-size:15px;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#999;font-size:13px;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#ff5252;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#999;font-size:13px;">Subject</td>
              <td style="padding:8px 0;color:#fbfbfb;">${subject || '(no subject)'}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #222;margin:20px 0;"/>
          <h3 style="color:#ff5252;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Message</h3>
          <div style="background:#141414;border-left:3px solid #ff2a2a;padding:16px 20px;border-radius:6px;color:#fbfbfb;line-height:1.7;white-space:pre-wrap;">${message}</div>
          <div style="margin-top:24px;">
            <a href="mailto:${email}?subject=Re: ${subject || 'Your message'}"
               style="display:inline-block;background:#ff2a2a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              ↩ Reply to ${name}
            </a>
          </div>
        </div>
        <div style="padding:16px 32px;background:#050505;color:#666;font-size:12px;">
          Sent from your portfolio contact form · mkinsight.pages.dev
        </div>
      </div>`;

    try {
      const res = await fetch(RESEND_URL, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from:     FROM_EMAIL,
          to:       [TO_EMAIL],
          reply_to: email,
          subject:  `📬 Portfolio Contact: ${subject || 'New message'} — from ${name}`,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', err);
        return respond({ error: 'Failed to send. Please try again later.' }, 500);
      }

      return respond({ success: true, message: 'Message sent successfully!' });

    } catch (err) {
      console.error('Worker error:', err);
      return respond({ error: `Server error: ${err.message}` }, 500);
    }
  },
};
