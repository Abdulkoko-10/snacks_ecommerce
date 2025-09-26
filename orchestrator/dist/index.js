"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const search_1 = __importDefault(require("./routes/search"));
const chat_1 = __importDefault(require("./routes/chat"));
const app = (0, express_1.default)();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Main API router
const apiRouter = express_1.default.Router();
// Register the specific routers for different functionalities
apiRouter.use('/search', search_1.default);
apiRouter.use('/chat', chat_1.default);
// All API v1 routes will be handled by this router
app.use('/api/v1', apiRouter);
// Health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).send('Orchestrator is healthy!');
});
// Vercel handles the server listening, so we just export the app.
exports.default = app;
