import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Navbar } from '../../components';
import ChatPageLayout from '../../components/chat/ChatPageLayout';
import ChatInput from '../../components/chat/ChatInput';
import FloatingCatAssistant from '../../components/chat/FloatingCatAssistant';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [recommendationsByMessageId, setRecommendationsByMessageId] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const chatThreadRef = useRef(null);

  // Add a class to the body when the chat page is active
  useEffect(() => {
    document.body.classList.add('chat-page-active');
    return () => {
      document.body.classList.remove('chat-page-active');
    };
  }, []);

  // Scroll to the bottom on new messages
  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch an initial greeting from the assistant
  useEffect(() => {
    const initialMessage = {
      id: 'init_msg_0',
      role: 'assistant',
      text: 'Hello! How can I help you discover amazing food today?',
      createdAt: new Date().toISOString(),
    };
    setMessages([initialMessage]);
  }, []);

  const handleSend = async (text) => {
    const userMessage = {
      id: `user_msg_${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        const { message: assistantMessage, recommendationPayload } = data;

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
    <div className="page-wrapper-for-chat">
      <Head>
        <title>Chat | Snacks</title>
      </Head>
      <Navbar />
      <div className="chat-page-container" ref={chatThreadRef}>
        <ChatPageLayout
          messages={messages}
          recommendationsByMessageId={recommendationsByMessageId}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <ChatInput onSend={handleSend} disabled={isLoading} />
        {/* The FloatingCatAssistant is now only for desktop as per the new design */}
        <FloatingCatAssistant onClick={() => console.log('Floating cat clicked!')} />
      </div>
    </div>
  );
};

export default ChatPage;
