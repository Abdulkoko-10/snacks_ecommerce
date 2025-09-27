import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import io from 'socket.io-client';
import { isOrchestratorChatEnabled } from '../../lib/flags';
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

const ChatPage = () => {
  const router = useRouter();
  const { threadId: currentThreadId } = router.query; // Destructure outside for stable dependency

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
    const useOrchestrator = isOrchestratorChatEnabled();
    if (useOrchestrator) {
      const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
      if (!orchestratorUrl) {
        console.error('NEXT_PUBLIC_ORCHESTRATOR_URL is not set. WebSocket cannot connect.');
        setMessages(prev => [...prev, { id: `err_conn_${Date.now()}`, role: 'assistant', text: 'Chat service is not configured. Please contact support.', createdAt: new Date().toISOString() }]);
        return;
      }

      const socket = io(orchestratorUrl);
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
    }
  }, [updateThreadUrl]);

  // --- Effect for History Fetching ---
  useEffect(() => {
    document.body.classList.add('chat-page-active');

    if (currentThreadId) {
      setThreadId(currentThreadId);
    }

    const fetchHistory = async () => {
      if (!currentThreadId) {
        setMessages([{ id: 'init_msg_0', role: 'assistant', text: 'Hello! How can I help you discover amazing food today?', createdAt: new Date().toISOString() }]);
        return;
      }
      try {
        const useOrchestrator = isOrchestratorChatEnabled();
        const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
        let historyUrl;

        if (useOrchestrator) {
          if (!orchestratorUrl) throw new Error("Chat service is not configured.");
          historyUrl = `${orchestratorUrl}/api/v1/chat/history?threadId=${currentThreadId}`;
        } else {
          historyUrl = `/api/v1/chat/history?threadId=${currentThreadId}`;
        }

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

    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, [currentThreadId]);


  const handleSend = async (text) => {
    const userMessage = { id: `user_msg_${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const useOrchestrator = isOrchestratorChatEnabled();

    if (useOrchestrator && socketRef.current) {
      socketRef.current.emit('chat_message', { text, chatHistory: messages, threadId });
    } else {
      if (useOrchestrator) {
        setIsLoading(false);
        setMessages(prev => [...prev, { id: `err_msg_${Date.now()}`, role: 'assistant', text: 'Cannot connect to chat service. Please wait a moment and try again.', createdAt: new Date().toISOString() }]);
        return;
      }
      try {
        const response = await fetch('/api/v1/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, chatHistory: messages, threadId }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `API request failed with status: ${response.status}` }));
          throw new Error(errorData.error);
        }

        const newThreadId = response.headers.get('X-Thread-Id');
        if (newThreadId && newThreadId !== threadId) {
          setThreadId(newThreadId);
          updateThreadUrl(newThreadId);
        }
        const data = await response.json();
        const { fullText, recommendations } = data;
        const assistantMessage = { id: `asst_msg_${Date.now()}`, role: 'assistant', text: fullText, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, assistantMessage]);
        if (recommendations && recommendations.length > 0) {
          setRecommendationsByMessageId(prev => ({ ...prev, [assistantMessage.id]: recommendations }));
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        const errorAssistantMessage = { id: `asst_msg_err_${Date.now()}`, role: 'assistant', text: `Sorry, I seem to be having some trouble right now. (${error.message})`, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const useOrchestrator = isOrchestratorChatEnabled();

  return (
    <ChatPageWrapper>
      <ChatPageLayout messages={messages} recommendationsByMessageId={recommendationsByMessageId} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <ChatInput onSend={handleSend} disabled={isLoading || (useOrchestrator && !isSocketConnected)} />
      <FloatingCatAssistant onClick={() => setSidebarOpen(true)} />
    </ChatPageWrapper>
  );
};

ChatPage.hideFooter = true;

export default ChatPage;