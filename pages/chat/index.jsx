import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recommendationsByMessageId, setRecommendationsByMessageId] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useState(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMessages((prev) => [...prev, {
            id: `loc_err_${Date.now()}`,
            role: 'system',
            type: 'error',
            text: 'Could not get your location. To search for food, please enable location services in your browser settings and refresh the page.',
            createdAt: new Date().toISOString(),
          }]);
        }
      );
    }
  }, []);

  useEffect(() => {
    document.body.classList.add('chat-page-active');
    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, []);

  // This useEffect can be simplified or removed if history is not a feature yet.
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{
            id: 'init_msg_0',
            role: 'assistant',
            text: 'Hello! How can I help you discover amazing food today?',
            createdAt: new Date().toISOString(),
        }]);
    }
  }, [messages.length]);

  const handleSend = async (text) => {
    const userMessage = {
      id: `user_msg_${Date.now()}`,
      role: 'user',
      text: text,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          chatHistory: newMessages,
          threadId,
          lat: location?.lat,
          lon: location?.lon,
        }),
      });

      if (!response.ok) {
        // Try to parse a specific error message from the backend, otherwise use a generic one.
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `API request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const newThreadId = response.headers.get('X-Thread-Id');
      if (newThreadId && newThreadId !== threadId) {
        setThreadId(newThreadId);
        router.replace(`/chat?threadId=${newThreadId}`, undefined, { shallow: true });
      }

      const data = await response.json();
      const { fullText, recommendations } = data;

      const assistantMessage = {
        id: `asst_msg_${Date.now()}`,
        role: 'assistant',
        text: fullText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (recommendations && recommendations.length > 0) {
        setRecommendationsByMessageId((prev) => ({
          ...prev,
          [assistantMessage.id]: recommendations,
        }));
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorAssistantMessage = {
        id: `asst_msg_err_${Date.now()}`,
        role: 'assistant',
        text: error.message || 'Sorry, I seem to be having some trouble right now. Please try again later.',
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