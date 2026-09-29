const target = 'http://localhost:61173';

/** Full-page loads must hit the Angular app, not the API (paths like /workflows/schemas overlap). */
function bypassSpaNavigation(req) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return null;
  }

  const secFetchMode = req.headers['sec-fetch-mode'];
  if (secFetchMode === 'navigate') {
    return '/index.html';
  }

  const accept = req.headers['accept'] ?? '';
  if (accept.includes('text/html') && !accept.includes('application/json')) {
    return '/index.html';
  }

  return null;
}

const apiContexts = [
  '/analytics',
  '/auth',
  '/hr',
  '/sprints',
  '/tickets',
  '/identity',
  '/curriculum',
  '/subjects',
  '/learning-objectives',
  '/organization',
  '/notifications',
  '/workflows',
  '/realtime',
];

/** @type {import('http-proxy-middleware').Options[]} */
module.exports = apiContexts.map((context) => ({
  context: [context],
  target,
  secure: false,
  changeOrigin: true,
  bypass: bypassSpaNavigation,
  ...(context === '/realtime' ? { ws: true } : {}),
}));
