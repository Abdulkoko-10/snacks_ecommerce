import React from 'react';
import styled from '@emotion/styled';
import ChatSidebar from './ChatSidebar';
import ChatThread from './ChatThread';
import { IoMenu } from 'react-icons/io5';

const LayoutContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative; /* This is the anchor for the toggle button */
`;

const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  /* The main content area itself should not scroll. */
  overflow: hidden;
`;

const SidebarToggleButton = styled.button`
  display: none; /* Hidden on desktop */
  position: absolute; /* Positioned relative to LayoutContainer */
  top: 15px;
  left: 15px;
  background: var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1015; /* High z-index to be on top of chat content but below sidebar */
  border-radius: 8px;
  padding: 8px;
  line-height: 1;
  box-shadow: 0 2px 8px -2px var(--glass-box-shadow-color);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--glass-inner-shadow-color);
  }

  @media screen and (max-width: 800px) {
    display: block;
  }
`;

/**
 * The main layout for the chat page, combining the sidebar and chat thread.
 * @param {{
 *   messages: import('../../schemas/chat').ChatMessage[],
 *   recommendationsByMessageId?: Record<string, import('../../schemas/chat').ChatRecommendationCard[]>,
 *   isSidebarOpen: boolean,
 *   setSidebarOpen: (isOpen: boolean) => void
 * }} props
 */
const ChatPageLayout = ({ messages, recommendationsByMessageId, isSidebarOpen, setSidebarOpen }) => {
  return (
    <LayoutContainer>
      {/* This button is now a direct child of the layout, so it won't scroll */}
      <SidebarToggleButton onClick={() => setSidebarOpen(true)}>
        <IoMenu />
      </SidebarToggleButton>

      <ChatSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <MainContent>
        {/* The ChatThread is the component that will scroll internally */}
        <ChatThread messages={messages} recommendationsByMessageId={recommendationsByMessageId} />
      </MainContent>
    </LayoutContainer>
  );
};

export default ChatPageLayout;
