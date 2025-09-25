const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock the dependencies
jest.mock('axios');
jest.mock('@google/generative-ai');

const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({
  sendMessage: mockSendMessage,
}));

GoogleGenerativeAI.mockImplementation(() => ({
  getGenerativeModel: () => ({
    startChat: mockStartChat,
  }),
}));

// We need to import the app *after* the mocks are set up
const app = require('./index'); // Assuming your express app is exported from index.js
const request = require('supertest');

describe('Orchestrator Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should call Gemini, then the connector, and return a structured response', async () => {
    // 1. Arrange
    const userMessageText = 'Find me the best tacos in Austin';

    const mockGeminiResponse = {
      search_query: 'best tacos',
      location: 'Austin, TX',
      conversational_response: "You got it! Searching for the best tacos in Austin for you.",
    };
    mockSendMessage.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockGeminiResponse),
      },
    });

    const mockConnectorResponse = [
      {
        provider: 'serpapi',
        providerProductId: 'place_123',
        title: 'Torchy\'s Tacos',
        imageUrl: 'http://example.com/tacos.jpg',
        rating: 4.8,
        reviewCount: 2500,
        address: '123 Taco St, Austin, TX',
      },
    ];
    axios.post.mockResolvedValue({ data: mockConnectorResponse });

    // 2. Act
    const response = await request(app)
      .post('/api/v1/chat/message')
      .send({ text: userMessageText });

    // 3. Assert
    // Check that Gemini was called correctly
    expect(mockStartChat).toHaveBeenCalled();
    expect(mockSendMessage).toHaveBeenCalledWith(userMessageText);

    // Check that the connector was called with the data from Gemini
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3001/search',
      {
        query: 'best tacos',
        location: 'Austin, TX',
      }
    );

    // Check the final response sent to the frontend
    expect(response.statusCode).toBe(200);
    expect(response.body.fullText).toBe("You got it! Searching for the best tacos in Austin for you.");
    expect(response.body.recommendations).toHaveLength(1);
    expect(response.body.recommendations[0].preview.title).toBe("Torchy's Tacos");
    expect(response.body.recommendations[0].reason).toBe('I found this based on your request for "best tacos".');
  });

  it('should handle errors from the Gemini API gracefully', async () => {
    // Arrange
    mockSendMessage.mockRejectedValue(new Error('Gemini API failed'));

    // Act
    const response = await request(app)
      .post('/api/v1/chat/message')
      .send({ text: 'any query' });

    // Assert
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toContain('An internal error occurred');
    expect(axios.post).not.toHaveBeenCalled(); // Connector should not be called
  });

  it('should handle errors from the connector gracefully', async () => {
    // Arrange
    const mockGeminiResponse = {
        search_query: 'some food',
        location: 'some place',
        conversational_response: "Ok, looking for some food",
    };
    mockSendMessage.mockResolvedValue({
        response: { text: () => JSON.stringify(mockGeminiResponse) },
    });

    axios.post.mockRejectedValue({
        response: {
            status: 502,
            data: { error: 'Downstream service unavailable' }
        },
        message: 'Connector failed'
    });

    // Act
    const response = await request(app)
      .post('/api/v1/chat/message')
      .send({ text: 'any query' });

    // Assert
    expect(response.statusCode).toBe(502);
    expect(response.body.error).toContain('Error from downstream service');
  });
});