const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const orchestratorApp = require('./orchestrator/app');
const setupSocketIO = require('./orchestrator/socket/handler');

app.prepare().then(() => {
  const server = express();

  // Delegate API routes to the orchestrator Express app
  server.use(orchestratorApp);

  // All other routes are handled by Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const httpServer = createServer(server);

  // Attach Socket.IO to the HTTP server
  setupSocketIO(httpServer);

  const port = process.env.PORT || 3000;
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});