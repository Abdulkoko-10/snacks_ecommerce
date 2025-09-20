import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatUIContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

export const ChatUIProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <ChatUIContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </ChatUIContext.Provider>
  );
};

export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (context === undefined) {
    throw new Error('useChatUI must be used within a ChatUIProvider');
  }
  return context;
};
