const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

/* ── Helpers ──────────────────────────────────────────────── */

/**
 * URL-safe base64 decode (Gmail uses base64url encoding).
 */
function base64UrlDecode(data) {
  if (!data) return '';
  // Pad with '=' to make length a multiple of 4
  const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

/**
 * Recursively extract plain text and HTML body from payload parts.
 */
function parseEmailPart(parts) {
  let plain = '';
  let html = '';

  for (const part of parts) {
    const mimeType = part.mimeType || '';

    if (mimeType === 'text/plain') {
      const data = (part.body && part.body.data) || '';
      if (data) plain += base64UrlDecode(data);
    } else if (mimeType === 'text/html') {
      const data = (part.body && part.body.data) || '';
      if (data) html += base64UrlDecode(data);
    } else if (part.parts) {
      const [p, h] = parseEmailPart(part.parts);
      plain += p;
      html += h;
    }
  }

  return [plain, html];
}

/**
 * Remove HTML tags for a plain-text fallback.
 */
function stripHtmlTags(htmlStr) {
  let clean = htmlStr;
  // Remove <style> blocks
  clean = clean.replace(/<style[^>]*>.*?<\/style>/gis, '');
  // Remove <script> blocks
  clean = clean.replace(/<script[^>]*>.*?<\/script>/gis, '');
  // <br> → newline
  clean = clean.replace(/<br\s*\/?>/gi, '\n');
  // </p> → double newline
  clean = clean.replace(/<\/p>/gi, '\n\n');
  // </div> → newline
  clean = clean.replace(/<\/div>/gi, '\n');
  // Strip remaining tags
  clean = clean.replace(/<[^>]+>/g, '');
  // Collapse excessive newlines
  clean = clean.replace(/\n{3,}/g, '\n\n');
  return clean.trim();
}

/**
 * Get a specific header value by name (case-insensitive).
 */
function getHeader(headers, name) {
  const lowerName = name.toLowerCase();
  for (const h of headers) {
    if (h.name.toLowerCase() === lowerName) return h.value;
  }
  return '';
}

/**
 * Parse 'Name <email@domain.com>' into a structured object.
 */
function parseAddress(addr) {
  const match = addr.match(/(?:"?([^"]*)"?\s)?<?([^>]*)>?/);
  if (match) {
    const name = (match[1] || match[2] || '').trim();
    const email = (match[2] || '').trim();
    const init = name ? name[0].toUpperCase() : 'M';
    return { name, email, init, color: '#6366f1' };
  }
  return { name: addr, email: addr, init: 'M', color: '#6366f1' };
}

/* ── Routes ───────────────────────────────────────────────── */

app.get('/api/emails', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const headers = { Authorization: `Bearer ${token}` };
  const pageToken = req.query.pageToken;

  // 1. Fetch list of recent messages from Inbox
  const listParams = new URLSearchParams({
    labelIds: 'INBOX',
    maxResults: '15',
    q: 'newer_than:7d',
  });
  if (pageToken) listParams.set('pageToken', pageToken);

  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${listParams}`;

  let listRes;
  try {
    listRes = await fetch(listUrl, { headers });
  } catch (err) {
    console.error('GOOGLE API NETWORK ERROR:', err.message);
    return res.status(502).json({ error: 'Failed to reach Gmail API' });
  }

  if (listRes.status !== 200) {
    const errorBody = await listRes.json().catch(() => ({}));
    console.error('GOOGLE API ERROR:', JSON.stringify(errorBody));
    return res.status(listRes.status).json({ error: 'Failed to fetch emails', details: errorBody });
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];
  const nextPageToken = listData.nextPageToken || null;

  // 2. Fetch details for each message concurrently
  const detailResults = await Promise.all(
    messages.map(async (msg) => {
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
      try {
        const detailRes = await fetch(detailUrl, { headers });
        if (detailRes.status === 200) {
          const data = await detailRes.json();
          return { id: msg.id, data };
        }
      } catch (err) {
        console.error(`Failed to fetch message ${msg.id}:`, err.message);
      }
      return { id: msg.id, data: null };
    })
  );

  // 3. Parse each message
  const parsedEmails = [];

  for (const { id: msgId, data } of detailResults) {
    if (!data) continue;

    const payload = data.payload || {};
    const msgHeaders = payload.headers || [];

    // Extract metadata
    const subject = getHeader(msgHeaders, 'Subject') || '(No Subject)';
    const fromRaw = getHeader(msgHeaders, 'From');
    const toRaw = getHeader(msgHeaders, 'To');
    const dateRaw = getHeader(msgHeaders, 'Date');

    // Parse body — separate plain text and HTML
    let plainBody = '';
    let htmlBody = '';

    if (payload.parts) {
      [plainBody, htmlBody] = parseEmailPart(payload.parts);
    } else {
      // Sometimes there are no parts, just a body data
      const bdata = (payload.body && payload.body.data) || '';
      const mime = payload.mimeType || '';
      if (bdata) {
        const decoded = base64UrlDecode(bdata);
        if (mime === 'text/html') {
          htmlBody = decoded;
        } else {
          plainBody = decoded;
        }
      }
    }

    // Build final body: prefer plain text, fall back to stripped HTML
    const body = plainBody || stripHtmlTags(htmlBody) || data.snippet || '';

    // Check unread/starred
    const labels = data.labelIds || [];
    const isUnread = labels.includes('UNREAD');
    const isStarred = labels.includes('STARRED');

    parsedEmails.push({
      id: msgId,
      from: parseAddress(fromRaw),
      to: toRaw,
      subject,
      snippet: data.snippet || '',
      date: 'Today', // Simplified for UI
      unread: isUnread,
      starred: isStarred,
      body,
      bodyHtml: htmlBody,
    });
  }

  return res.json({
    primary: parsedEmails,
    social: [],
    promo: [],
    nextPageToken,
  });
});

/* ── Start ────────────────────────────────────────────────── */

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Starting Nexus Mail Backend on http://localhost:${PORT}`);
});
