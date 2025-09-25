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

  useEffect(() => {
    document.body.classList.add('chat-page-active');
    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, []);

  useEffect(() => {
    const currentThreadId = router.query.threadId;
    if (currentThreadId) {
      setThreadId(currentThreadId);
    }

    const fetchHistory = async () => {
      // Use a different endpoint if we have a threadId
      const historyUrl = currentThreadId ? `/api/v1/chat/history?threadId=${currentThreadId}` : '/api/v1/chat/history';
      try {
        const response = await fetch(historyUrl);
        if (response.ok) {
          const { messages: historyMessages, recommendationsByMessageId: historyRecs } = await response.json();
          if (historyMessages && historyMessages.length > 0) {
            setMessages(historyMessages);
            setRecommendationsByMessageId(historyRecs || {});
          } else {
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
        setMessages([{
          id: 'init_msg_0',
          role: 'assistant',
          text: 'Hello! How can I help you discover amazing food today?',
          createdAt: new Date().toISOString(),
        }]);
      }
    };

    fetchHistory();
    // Re-fetch history if the threadId in the URL changes
  }, [router.query.threadId]);

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
      const response = await fetch('http://localhost:3002/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, chatHistory: newMessages, threadId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const authMessage = {
            id: `auth_msg_${Date.now()}`,
            role: 'system',
            type: 'auth',
            text: 'Please sign in or sign up to continue the conversation.',
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, authMessage]);
        } else {
          throw new Error('API request failed');
        }
        return;
      }

      const newThreadId = response.headers.get('X-Thread-Id');
      if (newThreadId && newThreadId !== threadId) {
        setThreadId(newThreadId);
        // Use replace to avoid polluting browser history for thread ID changes
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
        text: 'Sorry, I seem to be having some trouble right now. Please try again later.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        // If the last message was the empty assistant shell, remove it before adding error
        if(lastMessage.id.startsWith('asst_msg_') && lastMessage.text === '') {
          return [...prev.slice(0, -1), errorAssistantMessage];
        }
        return [...prev, errorAssistantMessage];
      });
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
