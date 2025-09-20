import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import ChatPageLayout from '@/components/chat/ChatPageLayout';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatThread from '@/components/chat/ChatThread';
import ChatInput from '@/components/chat/ChatInput';
import FloatingCatAssistant from '@/components/chat/FloatingCatAssistant';
import { ChatMessage, ChatRecommendationCard } from '@fd/schemas/chat';
import Layout from '@/components/Layout';

const ChatPage = () => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, ChatRecommendationCard[]>>({});

  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, userId }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      setMessages((prev) => [...prev, data.message]);

      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations((prev) => ({
          ...prev,
          [data.message.id]: data.recommendations,
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I had trouble getting a response. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <Layout>
      <ChatPageLayout>
        <div className="chat-page-layout">
          <ChatSidebar />
          <main className="chat-main">
            <ChatThread messages={messages} recommendations={recommendations} />
            <ChatInput onSend={handleSend} />
          </main>
        </div>
        <FloatingCatAssistant />
      </ChatPageLayout>
    </Layout>
  );
};

export default ChatPage;
