import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import io from 'socket.io-client';
import ChatPageLayout from '../../components/chat/ChatPageLayout';
import ChatInput from '../../components/chat/ChatInput';
import FloatingCatAssistant from '../../components/chat/FloatingCatAssistant';

const ChatPageWrapper = styled.div`
  height: calc(100vh - var(--navbar-height) - 40px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

// Helper to construct the base URL for the orchestrator
const getOrchestratorUrl = () => {
  if (process.env.NEXT_PUBLIC_ORCHESTRATOR_URL) return process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return 'http://localhost:3001'; // Fallback for local development
};

const ChatPage = () => {
  const router = useRouter();
  const { threadId: currentThreadId } = router.query;

  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recommendationsByMessageId, setRecommendationsByMessageId] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const updateThreadUrl = useCallback((newThreadId) => {
    router.replace(`/chat?threadId=${newThreadId}`, undefined, { shallow: true });
  }, [router]);

  // --- Effect for WebSocket Connection Lifecycle ---
  useEffect(() => {
    const orchestratorUrl = getOrchestratorUrl();
    const socket = io(orchestratorUrl, {
      path: "/api/v1/chat/socket.io", // This MUST match the server-side path
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsSocketConnected(true));
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setMessages(prev => [...prev, { id: `err_conn_${Date.now()}`, role: 'assistant', text: `Error connecting to chat service: ${err.message}. Please try again later.`, createdAt: new Date().toISOString() }]);
      setIsSocketConnected(false);
    });
    socket.on('thread_created', ({ threadId: newThreadId }) => {
      setThreadId(newThreadId);
      updateThreadUrl(newThreadId);
    });
    socket.on('ai_response', ({ fullText, recommendations }) => {
      const assistantMessage = { id: `asst_msg_${Date.now()}`, role: 'assistant', text: fullText, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);
      if (recommendations && recommendations.length > 0) {
        setRecommendationsByMessageId(prev => ({ ...prev, [assistantMessage.id]: recommendations }));
      }
      setIsLoading(false);
    });
    socket.on('chat_error', ({ message }) => {
      const errorAssistantMessage = { id: `asst_msg_err_${Date.now()}`, role: 'assistant', text: `Sorry, an error occurred: ${message}`, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, errorAssistantMessage]);
      setIsLoading(false);
    });

    return () => {
      setIsSocketConnected(false);
      socket.disconnect();
    };
  }, [updateThreadUrl]);

  // --- Effect for History Fetching ---
  useEffect(() => {
    document.body.classList.add('chat-page-active');

    const fetchHistory = async () => {
      if (!currentThreadId) {
        setMessages([{ id: 'init_msg_0', role: 'assistant', text: 'Hello! How can I help you discover amazing food today?', createdAt: new Date().toISOString() }]);
        return;
      }

      try {
        const orchestratorUrl = getOrchestratorUrl();
        const historyUrl = `${orchestratorUrl}/api/v1/chat/history?threadId=${currentThreadId}`;
        const response = await fetch(historyUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Failed to load history. Status: ${response.status}` }));
          throw new Error(errorData.error);
        }
        const { messages: historyMessages, recommendationsByMessageId: historyRecs } = await response.json();
        setMessages(historyMessages.length > 0 ? historyMessages : [{ id: 'init_msg_0', role: 'assistant', text: 'This is a new chat. What would you like to talk about?', createdAt: new Date().toISOString() }]);
        setRecommendationsByMessageId(historyRecs || {});
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessages([{ id: 'error_msg_0', role: 'assistant', text: `Sorry, I couldn't load the chat history: ${error.message}`, createdAt: new Date().toISOString() }]);
      }
    };

    fetchHistory();

    if (currentThreadId) {
      setThreadId(currentThreadId);
    }

    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, [currentThreadId]);


  const handleSend = (text) => {
    if (!socketRef.current?.connected) {
      setMessages(prev => [...prev, { id: `err_msg_${Date.now()}`, role: 'assistant', text: 'Cannot connect to chat service. Please check your connection or try again later.', createdAt: new Date().toISOString() }]);
      return;
    }

    const userMessage = { id: `user_msg_${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    socketRef.current.emit('chat_message', { text, chatHistory: messages, threadId });
  };

  return (
    <ChatPageWrapper>
      <ChatPageLayout messages={messages} recommendationsByMessageId={recommendationsByMessageId} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <ChatInput onSend={handleSend} disabled={isLoading || !isSocketConnected} />
      <FloatingCatAssistant onClick={() => setSidebarOpen(true)} />
    </ChatPageWrapper>
  );
};

ChatPage.hideFooter = true;

export default ChatPage;