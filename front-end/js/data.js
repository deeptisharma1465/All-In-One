/* =========================================================
   data.js  —  Nexus Multi-Chat — Static Application Data
   Conversations, email inbox data, and auto-reply pool
   ========================================================= */

/* ── Chat Conversations ──────────────────────────────────── */
NexusApp.conversations = {
  'ann-schleifer': {
    name: 'Ann Schleifer',
    handle: 'ann_schleifer22',
    status: 'Online',
    avatarBg: 'linear-gradient(135deg,#a78bfa,#6366f1)',
    avatarInit: 'AS',
    messages: [
      {
        id: 1, type: 'received',
        img: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=420&q=80',
        caption: 'Raven.cafe — Casual hangout in the centre of the residential area of Kotagede.',
        time: '11:05'
      },
      { id: 2, type: 'received', text: "Hey! Did you check out that new café downtown? I heard they have the best lattes.", time: '11:00' },
      { id: 3, type: 'sent',     text: "Hey! Yeah, I actually went there yesterday. The lattes are amazing, and the ambiance is super cozy.", time: '11:00' },
      { id: 4, type: 'received', text: "Nice! I've been wanting to try their pastries too. Were they any good?", time: '11:05' },
      { id: 5, type: 'sent',     text: "Absolutely! The croissants were buttery and flaky — you should definitely go! 🥐", time: '11:04' },
    ]
  },
  'alfredo-workman': {
    name: 'Alfredo Workman',
    handle: 'alfredo_w',
    status: 'Away',
    avatarBg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    avatarInit: 'AW',
    messages: [
      { id: 1, type: 'received', text: "Hey, did you get the project files I sent over?", time: '04:00' },
      { id: 2, type: 'sent',     text: "Yes! Going through them now. The structure looks solid 💪", time: '04:01' },
      { id: 3, type: 'received', text: "Great! Let me know if you need any clarifications on the brief.", time: '04:02' },
    ]
  },
  'kianna-george': {
    name: 'Kianna George',
    handle: 'kianna_g',
    status: 'Online',
    avatarBg: 'linear-gradient(135deg,#10b981,#059669)',
    avatarInit: 'KG',
    messages: [
      { id: 1, type: 'received', text: "Are we still on for the meeting tomorrow at 10am?", time: '05:45' },
      { id: 2, type: 'sent',     text: "Absolutely! I've prepared the slides already.", time: '05:46' },
      { id: 3, type: 'received', text: "Perfect! I'll send the Zoom link in the morning.", time: '05:49' },
    ]
  },
  'craig-culhane': {
    name: 'Craig Culhane',
    handle: 'craig_c',
    status: 'Offline',
    avatarBg: 'linear-gradient(135deg,#64748b,#475569)',
    avatarInit: 'CC',
    messages: [
      { id: 1, type: 'received', text: "Can you review the Figma designs before EOD?", time: '03:40' },
      { id: 2, type: 'sent',     text: "On it! Will DM you feedback shortly.", time: '03:45' },
    ]
  },
  'maya-johnson': {
    name: 'Maya Johnson',
    handle: 'maya_j',
    status: 'Online',
    avatarBg: 'linear-gradient(135deg,#ec4899,#db2777)',
    avatarInit: 'MJ',
    messages: [
      { id: 1, type: 'received', text: "Hey! Can you review the landing page copy I sent?", time: '09:15' },
      { id: 2, type: 'sent',     text: "Sure! Give me 20 minutes.", time: '09:18' },
      { id: 3, type: 'received', text: "Awesome, thanks! No rush 🙌", time: '09:20' },
    ]
  }
};

/* ── Simulated Auto-Replies ──────────────────────────────── */
NexusApp.autoReplies = [
  "That's awesome! Tell me more 😊",
  "Totally agree with you on that!",
  "Really? I didn't know that — interesting!",
  "Sounds great, let's catch up soon 🙌",
  "Noted! I'll keep that in mind 👍",
  "Oh wow, that changes things a lot.",
  "Ha, I was just thinking the same thing!",
  "Let me look into that and get back to you.",
];

/* ── Email Inbox Data ────────────────────────────────────── */
NexusApp.emailData = {
  primary: [],
  social: [
    {
      id: 's1',
      from: { name: 'LinkedIn', email: 'messages-noreply@linkedin.com', init: 'in', color: '#0a66c2' },
      to: 'hussein.saddam@gmail.com',
      subject: 'Ann Schleifer sent you a message',
      snippet: "Hi Hussein! I came across your project on GitHub and I'd love to connect.",
      date: 'Today', unread: true, starred: false,
      body: `Hi Hussein,\n\nAnn Schleifer sent you a message on LinkedIn:\n\n  "Hi Hussein! I came across your Nexus chat project on GitHub — the email integration looks really polished. I'd love to connect and hear more about the tech stack you're using.\n\n  I'm currently building something similar for our team at work."\n\nReply to Ann on LinkedIn → https://linkedin.com/messaging\n\n—\nLinkedIn`
    }
  ],
  promo: [
    {
      id: 'p1',
      from: { name: 'Framer', email: 'hello@framer.com', init: 'Fr', color: '#0055ff' },
      to: 'hussein.saddam@gmail.com',
      subject: '🎉 50% off Framer Pro — Limited time offer',
      snippet: 'Upgrade to Framer Pro and get access to premium features for half the price.',
      date: 'Today', unread: true, starred: false,
      body: `Hi there,\n\nFor a limited time, get 50% off Framer Pro!\n\n  Plan:      Framer Pro\n  Price:     $10/month (was $20/month)\n  Offer:     Valid until June 30, 2026\n\nWhat you get with Pro:\n  • Unlimited projects\n  • Custom domains\n  • Advanced animations\n  • Priority support\n\nClaim your discount → https://framer.com/upgrade\n\n—\nThe Framer Team`
    }
  ]
};
