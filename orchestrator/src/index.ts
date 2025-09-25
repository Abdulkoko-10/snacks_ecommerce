import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.send('Orchestrator is healthy!');
});

app.listen(port, () => {
  console.log(`Orchestrator listening at http://localhost:${port}`);
});