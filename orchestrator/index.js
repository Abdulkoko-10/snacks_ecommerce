const dotenv = require('dotenv');
// Load environment variables from the root .env file BEFORE anything else.
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('./app');
const http = require('http');
const { Server } = require("socket.io");
const { initializeSocket } = require('./socket/handler');

const PORT = process.env.ORCHESTRATOR_PORT || 3001;
const server = http.createServer(app);

const io = new Server(server, {
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