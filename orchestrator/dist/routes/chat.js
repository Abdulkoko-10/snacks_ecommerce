"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const generative_ai_1 = require("@google/generative-ai");
const geoapify_connector_1 = require("@fd/geoapify-connector");
const router = (0, express_1.Router)();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You are a helpful and friendly food discovery assistant.
Your goal is to understand the user's request for food and respond in a conversational way.
Based on the user's message, you must determine two things:
1.  **intent**: Is the user asking to search for food? This could be direct ('find me pizza') or indirect ('I'm hungry for something spicy'). If they are, the intent is 'SEARCH'. If they are just chatting, the intent is 'CHAT'.
2.  **query**: If the intent is 'SEARCH', what is the most likely search query for a food discovery API? For example, if the user says 'I want to find a great place for ramen near me', the query should be 'ramen'. If they say 'I'm craving some spicy curry', the query could be 'spicy curry'.

You must respond with a JSON object containing the 'intent' and the 'query'. Do not add any other text or formatting.
Example 1: User says 'find me the best tacos in San Francisco'. You respond with: {"intent": "SEARCH", "query": "tacos"}
Example 2: User says 'hi how are you'. You respond with: {"intent": "CHAT", "query": null}
Example 3: User says 'I could really go for some pho right now'. You respond with: {"intent": "SEARCH", "query": "pho"}`
});
router.post('/message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, chatHistory, threadId, lat, lon } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Message text is required.' });
    }
    const newThreadId = threadId || (0, uuid_1.v4)();
    res.setHeader('X-Thread-Id', newThreadId);
    try {
        const chat = model.startChat();
        const result = yield chat.sendMessage(text);
        const response = yield result.response;
        const aiResponseText = response.text();
        let intentData;
        try {
            intentData = JSON.parse(aiResponseText);
        }
        catch (e) {
            console.error("Failed to parse AI response JSON:", aiResponseText);
            const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const chatResponse = yield chatModel.generateContent(`Continue the conversation. The user said: "${text}"`);
            return res.status(200).json({
                fullText: chatResponse.response.text(),
                recommendations: [],
            });
        }
        if (intentData.intent === 'SEARCH' && intentData.query) {
            if (!lat || !lon) {
                return res.status(200).json({
                    fullText: "It sounds like you're looking for food! To help me find the best options, could you please share your location?",
                    recommendations: [],
                });
            }
            const searchResults = yield (0, geoapify_connector_1.search)(intentData.query, lat, lon);
            const recommendationText = searchResults.length > 0
                ? `I found a few options for "${intentData.query}" near you!`
                : `I couldn't find any results for "${intentData.query}" near you, but you might like these other options.`;
            return res.status(200).json({
                fullText: recommendationText,
                recommendations: searchResults,
            });
        }
        else {
            const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const chatResponse = yield chatModel.generateContent(`Continue the conversation. The user said: "${text}"`);
            return res.status(200).json({
                fullText: chatResponse.response.text(),
                recommendations: [],
            });
        }
    }
    catch (error) {
        console.error("Error in chat message handler:", error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
}));
exports.default = router;
