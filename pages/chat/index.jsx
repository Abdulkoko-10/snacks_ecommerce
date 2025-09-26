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

const getInitialMessage = () => ({
  id: 'init_msg_0',
  role: 'assistant',
  text: 'Hello! How can I help you discover amazing food today?',
  createdAt: new Date().toISOString(),
});

const ChatPage = () => {
  const router = useRouter();
  const [threads, setThreads] = useState({});
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([getInitialMessage()]);
  const [recommendationsByMessageId, setRecommendationsByMessageId] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useState(null);

  // Load threads from localStorage and set active thread from URL on mount
  useEffect(() => {
    try {
      const savedThreads = localStorage.getItem('chatThreads');
      const parsedThreads = savedThreads ? JSON.parse(savedThreads) : {};
      setThreads(parsedThreads);

      const urlThreadId = router.query.threadId;
      if (urlThreadId && parsedThreads[urlThreadId]) {
        setActiveThreadId(urlThreadId);
        setMessages(parsedThreads[urlThreadId].messages);
      } else {
        setActiveThreadId(null);
        setMessages([getInitialMessage()]);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
      setThreads({});
    }
  }, [router.query.threadId]);

  // Save threads to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(threads).length > 0) {
      localStorage.setItem('chatThreads', JSON.stringify(threads));
    }
  }, [threads]);

  // Update the active thread in the threads object whenever its messages change
  useEffect(() => {
    if (activeThreadId) {
      setThreads((prevThreads) => {
        const currentTitle = prevThreads[activeThreadId]?.title;
        const newTitle = currentTitle || messages.find(m => m.role === 'user')?.text.substring(0, 40) || 'New Chat';

        return {
          ...prevThreads,
          [activeThreadId]: {
            ...prevThreads[activeThreadId],
            messages,
            title: newTitle,
            id: activeThreadId,
            lastUpdated: new Date().toISOString(),
          },
        }
      });
    }
  }, [messages, activeThreadId]);

  // Get user's location and set body class on mount
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
          setMessages((prev) =>
            prev.some(m => m.id.startsWith('loc_err'))
              ? prev
              : [...prev, {
                  id: `loc_err_${Date.now()}`,
                  role: 'system',
                  type: 'error',
                  text: 'Could not get your location. To search for food, please enable location services.',
                  createdAt: new Date().toISOString(),
                }]
          );
        }
      );
    }
    document.body.classList.add('chat-page-active');
    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, []);

  const handleNewChat = () => {
    setActiveThreadId(null);
    setMessages([getInitialMessage()]);
    router.push('/chat', undefined, { shallow: true });
  };

  const handleSelectThread = (threadId) => {
    if (threads[threadId]) {
      router.push(`/chat?threadId=${threadId}`, undefined, { shallow: true });
    }
  };

  const handleDeleteThread = (threadId) => {
    const newThreads = { ...threads };
    delete newThreads[threadId];
    setThreads(newThreads);
    if (activeThreadId === threadId) {
      handleNewChat();
    }
  };

  const handleSend = async (text) => {
    const userMessage = {
      id: `user_msg_${Date.now()}`,
      role: 'user',
      text: text,
      createdAt: new Date().toISOString(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    const historyForApi = currentMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(({ role, text }) => ({ role, parts: [{ text }] }));

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          chatHistory: historyForApi.slice(0, -1),
          threadId: activeThreadId,
          lat: location?.lat,
          lon: location?.lon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API request failed with status ${response.status}`);
      }

      const responseThreadId = response.headers.get('X-Thread-Id');
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

      if (responseThreadId && responseThreadId !== activeThreadId) {
        setActiveThreadId(responseThreadId);
        router.replace(`/chat?threadId=${responseThreadId}`, undefined, { shallow: true });
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorAssistantMessage = {
        id: `asst_msg_err_${Date.now()}`,
        role: 'assistant',
        text: error.message || 'Sorry, I am having trouble right now. Please try again later.',
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
        threads={Object.values(threads).sort((a,b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
      />
      <ChatInput onSend={handleSend} disabled={isLoading || !location} />
      <FloatingCatAssistant onClick={() => setSidebarOpen(true)} />
    </ChatPageWrapper>
  );
};

ChatPage.hideFooter = true;

export default ChatPage;