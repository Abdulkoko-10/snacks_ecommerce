const app = require('./app');
const http = require('http');
const { Server } = require("socket.io");
const { initializeSocket } = require('./socket/handler');

// --- Pre-flight Checks ---
const requiredEnvVars = [
  'MONGODB_URI',
  'GEMINI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('CRITICAL ERROR: The following required environment variables are not set:');
  missingEnvVars.forEach(varName => console.error(`- ${varName}`));
  console.error('The orchestrator service cannot start without these variables.');
  process.exit(1); // Exit with a failure code
}

console.log('All required environment variables are present. Starting server...');
// --- End Pre-flight Checks ---

const PORT = process.env.ORCHESTRATOR_PORT || 3001;
const server = http.createServer(app);

const io = new Server(server, {
  path: "/api/v1/chat/socket.io",
  cors: {
    origin: "*", // In a real app, lock this down to your frontend's URL
    methods: ["GET", "POST"]
  }
});

// Initialize all socket event listeners
initializeSocket(io);

// Start Server
server.listen(PORT, () => {
  console.log(`Orchestrator service with websockets listening on port ${PORT}`);
});