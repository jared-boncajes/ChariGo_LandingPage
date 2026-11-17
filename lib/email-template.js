const assets = require('./email-assets');

const SUBJECT = "You're subscribed to ChariGo updates";

const COLORS = {
  pink: '#f77492',
  soft: '#feb5c6',
  blush: '#fff5f7',
  green: '#03541c',
  text: '#151515',
  muted: '#535353',
};

const FONT = "Inter, 'Segoe UI', Helvetica, Arial, sans-serif";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateRow(title, text) {
  return `
              <tr>
                <td width="44" valign="top" style="padding:0 14px 18px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td width="40" height="40" align="center" valign="middle" style="width:40px;height:40px;background-color:${COLORS.blush};border:1.5px solid ${COLORS.soft};border-radius:12px;color:${COLORS.green};font:700 18px/1 ${FONT};">&#10003;</td>
                  </tr></table>
                </td>
                <td valign="top" style="padding:0 0 18px 0;font:400 15px/1.55 ${FONT};color:${COLORS.muted};">
                  <strong style="display:block;color:${COLORS.green};font-size:16px;font-weight:700;">${title}</strong>
                  ${text}
                </td>
              </tr>`;
}

function buildSubscriptionEmail({ email, siteUrl }) {
  const safeEmail = escapeHtml(email);
  const year = new Date().getFullYear();
  const visitLink = siteUrl
    ? `
          <tr>
            <td align="center" style="padding:0 32px 36px 32px;background-color:#ffffff;">
              <a href="${escapeHtml(siteUrl)}" style="display:inline-block;padding:14px 36px;border-radius:999px;background-color:${COLORS.pink};color:#252025;font:700 16px/1.3 ${FONT};text-decoration:none;">Visit ChariGo</a>
            </td>
          </tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.blush};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Thank you for subscribing. Small acts, a bigger change.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.blush};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1.5px solid ${COLORS.soft};border-radius:20px;overflow:hidden;">

        <!-- Banner -->
        <tr>
          <td style="padding:22px 32px;background-color:#ffffff;border-bottom:2px solid ${COLORS.soft};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle" style="padding-right:10px;">
                <img src="cid:${assets.logo.cid}" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border-radius:50%;">
              </td>
              <td valign="middle" style="font:700 20px/1 ${FONT};color:${COLORS.text};">ChariGo</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="${COLORS.soft}" style="padding:40px 28px 32px 28px;background-color:${COLORS.soft};background-image:linear-gradient(135deg,${COLORS.soft} 0%,#ffd3dd 100%);">
            <div style="font:700 13px/1.4 ${FONT};color:${COLORS.green};letter-spacing:1.5px;text-transform:uppercase;">Subscription confirmed</div>
            <h1 style="margin:10px 0 0 0;font:800 36px/1.1 ${FONT};color:${COLORS.text};letter-spacing:-1px;">Small Acts.<br>A Bigger Change.</h1>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
              <tr>
                <td width="50%" valign="top" style="padding-right:6px;">
                  <img src="cid:${assets.photoTall.cid}" width="260" alt="Young people planting a tree together" style="display:block;width:100%;height:auto;border:4px solid #ffffff;border-radius:72px 20px 20px 20px;box-sizing:border-box;">
                </td>
                <td width="50%" valign="top" style="padding-left:6px;">
                  <img src="cid:${assets.photoA.cid}" width="260" alt="Volunteers sharing time with children in a community" style="display:block;width:100%;height:auto;border:4px solid #ffffff;border-radius:20px;box-sizing:border-box;">
                  <div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>
                  <img src="cid:${assets.photoB.cid}" width="260" alt="Children washing their hands at a water source" style="display:block;width:100%;height:auto;border:4px solid #ffffff;border-radius:20px 20px 52px 20px;box-sizing:border-box;">
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:36px 32px 8px 32px;background-color:#ffffff;">
            <h2 style="margin:0 0 14px 0;font:700 24px/1.25 ${FONT};color:${COLORS.green};letter-spacing:-0.5px;">You're on the list!</h2>
            <p style="margin:0 0 14px 0;font:400 16px/1.6 ${FONT};color:${COLORS.text};">Thank you for subscribing to ChariGo. We've added <strong style="color:${COLORS.green};">${safeEmail}</strong> to our mailing list, and we're glad to have you with us.</p>
            <p style="margin:0 0 24px 0;font:400 16px/1.6 ${FONT};color:${COLORS.muted};">ChariGo connects people with charities, meaningful donations, and volunteer opportunities in Filipino communities. From now on, here's what you can expect in your inbox:</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${updateRow(
              'New causes',
              'Be the first to hear about causes and charitable organizations joining ChariGo.'
            )}${updateRow(
              'Fundraising campaigns',
              'Find campaigns that matter to you and see where your support can go.'
            )}${updateRow(
              'Volunteer opportunities',
              'Get notified about ways to offer your time and skills near you.'
            )}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 32px 32px;background-color:#ffffff;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" style="padding:22px 20px;background-color:${COLORS.blush};border:1.5px solid ${COLORS.soft};border-radius:20px;font:400 16px/1.55 ${FONT};color:#3d2530;">
                Your time, generosity, and support can help create meaningful change in communities.<br><strong style="color:${COLORS.green};">Thank you for being part of something good!</strong>
              </td>
            </tr></table>
          </td>
        </tr>${visitLink}

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:22px 32px 26px 32px;background-color:${COLORS.blush};border-top:1px solid ${COLORS.soft};font:400 13px/1.6 ${FONT};color:${COLORS.muted};">
            You're receiving this email because this address was entered in the subscribe form on the ChariGo website. If that wasn't you, you can safely ignore this message.
            <div style="margin-top:10px;color:${COLORS.green};font-weight:700;">&copy; ${year} ChariGo</div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    'ChariGo — Small Acts. A Bigger Change.',
    '',
    "You're on the list!",
    '',
    `Thank you for subscribing to ChariGo. We've added ${email} to our mailing list, and we're glad to have you with us.`,
    '',
    "Here's what you can expect in your inbox:",
    '- New causes: be the first to hear about causes and charitable organizations joining ChariGo.',
    '- Fundraising campaigns: find campaigns that matter to you and see where your support can go.',
    '- Volunteer opportunities: get notified about ways to offer your time and skills near you.',
    '',
    'Thank you for being part of something good!',
    ...(siteUrl ? ['', `Visit ChariGo: ${siteUrl}`] : []),
    '',
    "You're receiving this email because this address was entered in the subscribe form on the ChariGo website. If that wasn't you, you can safely ignore this message.",
  ].join('\n');

  const attachments = Object.values(assets).map((a) => ({
    filename: a.filename,
    content: Buffer.from(a.base64, 'base64'),
    contentType: a.contentType,
    cid: a.cid,
    contentDisposition: 'inline',
  }));

  return { subject: SUBJECT, html, text, attachments };
}

module.exports = { buildSubscriptionEmail };
