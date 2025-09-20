import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { IoClose, IoAddCircleOutline } from 'react-icons/io5';

const SidebarContainer = styled.aside`
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--secondary-background-color);
  border-right: 1px solid var(--glass-edge-highlight-color);
  padding: 20px;
  transition: transform 0.3s ease-in-out;

  @media screen and (max-width: 800px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1020;
    background: var(--glass-background-color);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    &.open {
      transform: translateX(0);
    }
  }
`;

const SidebarOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1010;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.open {
    display: block;
    opacity: 1;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--glass-edge-highlight-color);

  h3 {
    margin: 0;
    font-size: 1.4rem;
  }
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.8rem;
  cursor: pointer;

  @media screen and (max-width: 800px) {
    display: block;
  }
`;

const SidebarContent = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const NewChatButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: var(--glass-inner-shadow-color);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const ChatHistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;

  li a {
    display: block;
    padding: 10px 15px;
    border-radius: 8px;
    color: var(--text-color);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--glass-inner-shadow-color);
    }

    &.active {
      background-color: var(--accent-color);
      color: var(--text-on-accent-color);
    }
  }
`;

const mockChatHistory = [
  { id: 'chat_1', title: 'Pizza recommendations' },
  { id: 'chat_2', title: 'Best burgers in town' },
  { id: 'chat_3', title: 'Late night snack ideas' },
  { id: 'chat_4', title: 'Healthy breakfast options' },
  { id: 'chat_5', title: 'Desserts near me' },
];

/**
 * Renders the chat history sidebar.
 * @param {{isOpen: boolean, onClose: () => void}} props
 */
const ChatSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <SidebarOverlay className={isOpen ? 'open' : ''} onClick={onClose} />

      <SidebarContainer className={isOpen ? 'open' : ''}>
        <SidebarHeader>
          <h3>Chat History</h3>
          <CloseButton onClick={onClose} aria-label="Close chat history">
            <IoClose />
          </CloseButton>
        </SidebarHeader>
        <SidebarContent>
          <Link href="/chat" passHref>
            <NewChatButton onClick={onClose}>
              <IoAddCircleOutline /> New Chat
            </NewChatButton>
          </Link>
          <ChatHistoryList>
            {mockChatHistory.map((chat) => (
              <li key={chat.id}>
                <Link href={`/chat?id=${chat.id}`}>
                  <a onClick={onClose}>{chat.title}</a>
                </Link>
              </li>
            ))}
          </ChatHistoryList>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default ChatSidebar;
