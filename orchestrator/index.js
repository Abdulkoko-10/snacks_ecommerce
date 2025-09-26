const app = require('./app');

const PORT = process.env.ORCHESTRATOR_PORT || 3001;

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Orchestrator service listening on port ${PORT}`);
});