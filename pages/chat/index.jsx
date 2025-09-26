import React, { useState, useEffect, useRef } from 'react';
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

  // --- Main Effect for Socket Connection & History Fetching ---
  useEffect(() => {
    document.body.classList.add('chat-page-active');
    const useOrchestrator = isOrchestratorChatEnabled();
    const currentThreadId = router.query.threadId;

    if (currentThreadId) {
      setThreadId(currentThreadId);
    }

    // Fetch initial history via REST
    const fetchHistory = async () => {
      if (!currentThreadId) {
        setMessages([{ id: 'init_msg_0', role: 'assistant', text: 'Hello! How can I help you discover amazing food today?', createdAt: new Date().toISOString() }]);
        return;
      }
      try {
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

    // Establish WebSocket connection if using orchestrator
    if (useOrchestrator) {
      const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3001';
      console.log(`Connecting to WebSocket server at ${orchestratorUrl}`);
      const socket = io(orchestratorUrl);
      socketRef.current = socket;

      socket.on('connect', () => console.log('WebSocket connected!'));
      socket.on('thread_created', ({ threadId: newThreadId }) => {
        setThreadId(newThreadId);
        router.replace(`/chat?threadId=${newThreadId}`, undefined, { shallow: true });
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
    }

    return () => {
      document.body.classList.remove('chat-page-active');
      if (socketRef.current) {
        console.log('Disconnecting WebSocket.');
        socketRef.current.disconnect();
      }
    };
  }, [router.query.threadId]);


  const handleSend = async (text) => {
    const userMessage = { id: `user_msg_${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const useOrchestrator = isOrchestratorChatEnabled();

    if (useOrchestrator && socketRef.current) {
      // --- WebSocket Logic ---
      socketRef.current.emit('chat_message', { text, chatHistory: newMessages, threadId });
    } else {
      // --- Legacy REST API Logic ---
      try {
        const response = await fetch('/api/v1/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, chatHistory: newMessages, threadId }),
        });
        if (!response.ok) throw new Error('API request failed');

        const newThreadId = response.headers.get('X-Thread-Id');
        if (newThreadId && newThreadId !== threadId) {
          setThreadId(newThreadId);
          router.replace(`/chat?threadId=${newThreadId}`, undefined, { shallow: true });
        }
        const data = await response.json();
        const { fullText, recommendations } = data;
        const assistantMessage = { id: `asst_msg_${Date.now()}`, role: 'assistant', text: fullText, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, assistantMessage]);
        if (recommendations && recommendations.length > 0) {
          setRecommendationsByMessageId(prev => ({ ...prev, [assistantMessage.id]: recommendations }));
        }
      } catch (error) {
        console.error("Failed to send message via REST:", error);
        const errorAssistantMessage = { id: `asst_msg_err_${Date.now()}`, role: 'assistant', text: 'Sorry, I seem to be having some trouble right now.', createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ChatPageWrapper>
      <ChatPageLayout messages={messages} recommendationsByMessageId={recommendationsByMessageId} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
      <FloatingCatAssistant onClick={() => setSidebarOpen(true)} />
    </ChatPageWrapper>
  );
};

ChatPage.hideFooter = true;

export default ChatPage;