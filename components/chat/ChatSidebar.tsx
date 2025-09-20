import React from 'react';
import { useChatUI } from '../../context/ChatUIContext';

const ChatSidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useChatUI();

  return (
    <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <button onClick={toggleSidebar} className="close-sidebar-btn">&times;</button>
      </div>
      {/* Placeholder for chat history items */}
    </aside>
  );
};

export default ChatSidebar;
