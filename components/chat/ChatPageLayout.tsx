import React from 'react';

const ChatPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="chat-page-layout">
      {children}
    </div>
  );
};

export default ChatPageLayout;
