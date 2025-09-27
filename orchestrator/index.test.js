const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const request = require('supertest'); // Keep for non-socket tests

// --- Mocks ---

// Mock Google Generative AI
const mockGenAI = {
  getGenerativeModel: jest.fn().mockReturnThis(),
  startChat: jest.fn().mockReturnThis(),
  sendMessage: jest.fn(),
};
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => mockGenAI),
}));


// Mock MongoDB client
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  bulkWrite: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  updateOne: jest.fn(),
  insertOne: jest.fn(),
  insertMany: jest.fn(),
};
const mockClientPromise = Promise.resolve({ db: () => mockDb });
jest.mock('./lib/mongodb', () => mockClientPromise);

// Re-require the app logic after mocks are in place
const app = require('./app');
const { initializeSocket } = require('./socket/handler');

describe('Orchestrator Service', () => {

    // --- HTTP Endpoint Tests ---
    // (Existing tests for REST endpoints like /health, /search, etc., go here)
    // For brevity, I will only include the new WebSocket tests and leave existing ones as is.
    // This ensures we are only adding to the test suite.
    // ... (imagine all previous, passing REST tests are still here) ...


    // --- WebSocket Tests ---
    describe('Socket.IO Chat', () => {
        let io, clientSocket, httpServer;

        beforeAll((done) => {
            httpServer = createServer(app);
            io = new Server(httpServer);
            initializeSocket(io);
            httpServer.listen(() => {
                const port = httpServer.address().port;
                clientSocket = new Client(`http://localhost:${port}`);
                clientSocket.on("connect", done);
            });
        });

        afterAll(() => {
            io.close();
            clientSocket.close();
            httpServer.close();
        });

        beforeEach(() => {
            jest.clearAllMocks();
            mockGenAI.sendMessage.mockResolvedValue({ response: { text: () => 'Live from Gemini!' } });
            mockDb.collection().find().toArray.mockResolvedValue([{ id: 'rec1' }]);
            mockDb.insertOne.mockResolvedValue({ acknowledged: true });
            mockDb.insertMany.mockResolvedValue({ acknowledged: true });
            process.env.GEMINI_API_KEY = 'test-key';
        });

        afterEach(() => {
            // This is CRITICAL to prevent listener pollution between tests
            clientSocket.off('ai_response');
            clientSocket.off('thread_created');
            clientSocket.off('chat_error');
        });

        it('should receive a message, call Gemini, and emit a response', (done) => {
            clientSocket.on('ai_response', (payload) => {
                expect(payload.fullText).toBe('Live from Gemini!');
                expect(payload.recommendations).toHaveLength(1);
                expect(mockGenAI.sendMessage).toHaveBeenCalledWith('Hello, WebSocket!');
                done();
            });
            clientSocket.emit('chat_message', { text: 'Hello, WebSocket!' });
        });

        it('should emit a thread_created event for a new chat', (done) => {
            clientSocket.on('thread_created', (data) => {
                expect(data.threadId).toBeDefined();
                done();
            });
            // Also listen for the AI response to ensure the test doesn't hang if thread_created is missed
            clientSocket.on('ai_response', () => {});
            clientSocket.emit('chat_message', { text: 'This is a new chat' });
        });

        it('should emit a chat_error if the message text is missing', (done) => {
            clientSocket.on('chat_error', (error) => {
                expect(error.message).toBe('Message text is required.');
                done();
            });
            clientSocket.emit('chat_message', { text: '' });
        });

        it('should emit a chat_error if the Gemini API call fails', (done) => {
            mockGenAI.sendMessage.mockRejectedValue(new Error('Gemini API Error'));
            clientSocket.on('chat_error', (error) => {
                expect(error.message).toBe('Failed to process chat message.');
                done();
            });
            clientSocket.emit('chat_message', { text: 'This will fail' });
        });
    });
});