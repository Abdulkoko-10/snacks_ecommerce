import React from 'react';

interface ChatSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const ChatSidebar = ({ isOpen, toggle }: ChatSidebarProps) => {
  return (
    <aside className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <button onClick={toggle} className="close-sidebar-btn">&times;</button>
      </div>
      {/* Placeholder for chat history items */}
    </aside>
  );
};

export default ChatSidebar;
