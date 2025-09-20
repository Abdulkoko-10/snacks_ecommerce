import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import ChatPageLayout from '@/components/chat/ChatPageLayout';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatThread from '@/components/chat/ChatThread';
import ChatInput from '@/components/chat/ChatInput';
import FloatingCatAssistant from '@/components/chat/FloatingCatAssistant';
import { ChatMessage, ChatRecommendationCard } from '@fd/schemas/chat';
import Navbar from '@/components/Navbar';
import { BsChatSquareDots } from 'react-icons/bs';

const ChatHistoryToggleButton = ({ toggle, isOpen }) => (
  <button onClick={toggle} className="chat-history-toggle">
    <BsChatSquareDots size={22} />
  </button>
);

const ChatPage = () => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, ChatRecommendationCard[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <ChatPageLayout>
      <ChatSidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <main className="chat-main">
        <ChatHistoryToggleButton toggle={toggleSidebar} isOpen={isSidebarOpen} />
        <ChatThread messages={messages} recommendations={recommendations} />
        <ChatInput onSend={handleSend} />
      </main>
      <FloatingCatAssistant />
    </ChatPageLayout>
  );
};

ChatPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <div className="chat-page-wrapper">
      <Navbar />
      {page}
    </div>
  )
}

export default ChatPage;
