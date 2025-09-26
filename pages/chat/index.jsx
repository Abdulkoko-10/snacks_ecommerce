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
      const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3001';
      console.log(`Connecting to WebSocket server at ${orchestratorUrl}`);
      const socket = io(orchestratorUrl);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('WebSocket connected!');
        setIsSocketConnected(true);
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

      // Cleanup on component unmount
      return () => {
        console.log('Disconnecting WebSocket.');
        setIsSocketConnected(false);
        socket.disconnect();
      };
    }
  }, [updateThreadUrl]); // The linter is now satisfied

  // --- Effect for History Fetching ---
  useEffect(() => {
    document.body.classList.add('chat-page-active');
    const currentThreadId = router.query.threadId;

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
        const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3001';
        const historyUrl = useOrchestrator
          ? `${orchestratorUrl}/api/v1/chat/history?threadId=${currentThreadId}`
          : `/api/v1/chat/history?threadId=${currentThreadId}`;

        const response = await fetch(historyUrl);
        if (response.ok) {
          const { messages: historyMessages, recommendationsByMessageId: historyRecs } = await response.json();
          setMessages(historyMessages.length > 0 ? historyMessages : [{ id: 'init_msg_0', role: 'assistant', text: 'This is a new chat. What would you like to talk about?', createdAt: new Date().toISOString() }]);
          setRecommendationsByMessageId(historyRecs || {});
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessages([{ id: 'error_msg_0', role: 'assistant', text: 'Sorry, I couldn\'t load the chat history.', createdAt: new Date().toISOString() }]);
      }
    };

    fetchHistory();

    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, [router.query.threadId]); // Only depends on the threadId


  const handleSend = async (text) => {
    const userMessage = { id: `user_msg_${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const useOrchestrator = isOrchestratorChatEnabled();

    if (useOrchestrator && socketRef.current) {
      socketRef.current.emit('chat_message', { text, chatHistory: newMessages, threadId });
    } else {
      // Legacy REST API Logic (or if socket isn't connected yet)
      try {
        // If orchestrator is enabled but socket isn't ready, show an error instead of falling back
        if (useOrchestrator) {
            throw new Error("WebSocket not connected. Please wait a moment and try again.");
        }
        const response = await fetch('/api/v1/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, chatHistory: newMessages, threadId }),
        });
        if (!response.ok) throw new Error('API request failed');

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