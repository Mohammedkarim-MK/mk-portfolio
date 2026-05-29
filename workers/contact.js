// =============================================================================
// workers/contact.js — MK Portfolio Contact Worker
// Uses Web3Forms API — free, no domain verification needed, instant setup
// Deploy: wrangler deploy --config wrangler-contact.toml
// =============================================================================

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
      return respond({ error: 'Invalid JSON' }, 400);
    }

    const { name, email, subject, message } = body;

    if (!name?.trim())    return respond({ error: 'Name is required' },    400);
    if (!email?.trim())   return respond({ error: 'Email is required' },   400);
    if (!message?.trim()) return respond({ error: 'Message is required' }, 400);
    if (!EMAIL_RE.test(email.trim())) {
      return respond({ error: 'Invalid email address' }, 400);
    }

    // Web3Forms — free service, works without domain verification
    // Get key from: https://web3forms.com (free, instant)
    const WEB3FORMS_KEY = env.WEB3FORMS_KEY;

    // Fallback: also try Resend if configured
    const RESEND_KEY = env.RESEND_API_KEY;

    if (!WEB3FORMS_KEY && !RESEND_KEY) {
      return respond({ error: 'Email service not configured' }, 500);
    }

    try {
      let success = false;
      let errorMsg = '';

      // Try Web3Forms first (most reliable, no domain verification)
      if (WEB3FORMS_KEY) {
        const w3res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key:  WEB3FORMS_KEY,
            name,
            email,
            subject:     subject || 'New Portfolio Contact',
            message:     `From: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
            from_name:   'MK Portfolio Contact Form',
            replyto:     email,
          }),
        });
        const w3data = await w3res.json();
        if (w3res.ok && w3data.success) {
          success = true;
        } else {
          errorMsg = w3data.message || 'Web3Forms error';
          console.error('Web3Forms error:', errorMsg);
        }
      }

      // Fallback to Resend if Web3Forms fails or not configured
      if (!success && RESEND_KEY) {
        const TO_EMAIL   = env.CONTACT_EMAIL || 'mk.insight@outlook.com';
        const FROM_EMAIL = env.FROM_EMAIL    || 'onboarding@resend.dev';

        const html = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0e0e0e;color:#fbfbfb;border-radius:12px;overflow:hidden;">
            <div style="background:#ff2a2a;padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:22px;">📬 New Portfolio Message</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Via mkinsight.pages.dev</p>
            </div>
            <div style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#999;font-size:13px;width:80px;">From</td><td style="color:#fbfbfb;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Email</td><td><a href="mailto:${email}" style="color:#ff5252;">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Subject</td><td style="color:#fbfbfb;">${subject || '(no subject)'}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #222;margin:20px 0;"/>
              <div style="background:#141414;border-left:3px solid #ff2a2a;padding:16px 20px;border-radius:6px;white-space:pre-wrap;">${message}</div>
              <div style="margin-top:24px;">
                <a href="mailto:${email}?subject=Re: ${subject || 'Your message'}"
                   style="display:inline-block;background:#ff2a2a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                  ↩ Reply to ${name}
                </a>
              </div>
            </div>
          </div>`;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from: FROM_EMAIL, to: [TO_EMAIL], reply_to: email,
            subject: `📬 Portfolio Contact: ${subject || 'New message'} — from ${name}`,
            html,
          }),
        });

        if (resendRes.ok) {
          success = true;
        } else {
          const resendErr = await resendRes.text();
          errorMsg = resendErr;
          console.error('Resend error:', resendErr);
        }
      }

      if (success) {
        return respond({ success: true, message: 'Message sent successfully!' });
      } else {
        return respond({ error: `Failed to send: ${errorMsg}` }, 500);
      }

    } catch (err) {
      console.error('Worker error:', err);
      return respond({ error: `Server error: ${err.message}` }, 500);
    }
  },
};
