import React from 'react';
import styled from '@emotion/styled';
import ChatSidebar from './ChatSidebar';
import ChatThread from './ChatThread';
import { IoMenu } from 'react-icons/io5';

const LayoutContainer = styled.div`
  display: flex;
  height: 100%; /* Changed to 100% to fill container */
  width: 100%;
  position: relative;
`;

const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const SidebarToggleButton = styled.button`
  display: none;
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  border-radius: 8px;
  padding: 8px;
  line-height: 1;
  box-shadow: 0 2px 8px -2px var(--glass-box-shadow-color);

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
      <ChatSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MainContent>
        <SidebarToggleButton onClick={() => setSidebarOpen(true)}>
          <IoMenu />
        </SidebarToggleButton>
        <ChatThread messages={messages} recommendationsByMessageId={recommendationsByMessageId} />
      </MainContent>
    </LayoutContainer>
  );
};

export default ChatPageLayout;
