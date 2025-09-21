import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import ChatPageLayout from '../../components/chat/ChatPageLayout';
import ChatInput from '../../components/chat/ChatInput';
import FloatingCatAssistant from '../../components/chat/FloatingCatAssistant';

const ChatPageWrapper = styled.div`
  height: calc(100vh - var(--navbar-height) - 40px); /* Full viewport height minus navbar and some padding */
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden; /* This is key to preventing the main page scroll */
`;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [recommendationsByMessageId, setRecommendationsByMessageId] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('chat-page-active');
    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/v1/chat/history');
        if (response.ok) {
          const { messages: historyMessages, recommendationsByMessageId: historyRecs } = await response.json();
          if (historyMessages && historyMessages.length > 0) {
            setMessages(historyMessages);
            setRecommendationsByMessageId(historyRecs || {});
          } else {
            // Set initial message if no history
            setMessages([{
              id: 'init_msg_0',
              role: 'assistant',
              text: 'Hello! How can I help you discover amazing food today?',
              createdAt: new Date().toISOString(),
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        // Set initial message on error
        setMessages([{
          id: 'init_msg_0',
          role: 'assistant',
          text: 'Hello! How can I help you discover amazing food today?',
          createdAt: new Date().toISOString(),
        }]);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async (text) => {
    const userMessage = {
      id: `user_msg_${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, chatHistory: newMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        const { message: assistantMessage, recommendationPayload } = data;

        // The API now returns the assistant message which was already saved,
        // so we just add it to our state.
        setMessages((prev) => [...prev, assistantMessage]);

        if (recommendationPayload && recommendationPayload.recommendations.length > 0) {
          setRecommendationsByMessageId((prev) => ({
            ...prev,
            [assistantMessage.id]: recommendationPayload.recommendations,
          }));
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorAssistantMessage = {
        id: `asst_msg_err_${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I seem to be having some trouble right now. Please try again later.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatPageWrapper>
      <ChatPageLayout
        messages={messages}
        recommendationsByMessageId={recommendationsByMessageId}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <ChatInput onSend={handleSend} disabled={isLoading} />
      <FloatingCatAssistant onClick={() => setSidebarOpen(true)} />
    </ChatPageWrapper>
  );
};

ChatPage.hideFooter = true;

export default ChatPage;
