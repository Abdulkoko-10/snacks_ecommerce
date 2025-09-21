import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { IoClose, IoAddCircleOutline, IoTrashOutline, IoCreateOutline } from 'react-icons/io5';

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

const NewChatButton = styled.button`
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
`;

const ChatHistoryItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--glass-inner-shadow-color);
    .actions {
      opacity: 1;
    }
  }

  a {
    flex-grow: 1;
    padding: 10px 15px;
    color: var(--text-color);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.active {
      background-color: var(--accent-color);
      color: var(--text-on-accent-color);
      border-radius: 8px;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    padding-right: 10px;
    opacity: 0;
    transition: opacity 0.2s ease;

    button {
      background: none;
      border: none;
      color: var(--text-color);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 5px;
      border-radius: 50%;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;

const ChatSidebar = ({ isOpen, onClose }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/chat/threads');
        if (response.ok) {
          const data = await response.json();
          setThreads(data);
        }
      } catch (error) {
        console.error("Failed to fetch chat threads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  const handleNewChat = () => {
    window.location.href = '/chat';
    onClose();
  };

  const handleDelete = async (threadId) => {
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/chat/threads/${threadId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setThreads(prev => prev.filter(t => t.threadId !== threadId));
      } else {
        alert('Failed to delete chat.');
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert('An error occurred while deleting the chat.');
    }
  };

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
          <NewChatButton onClick={handleNewChat}>
            <IoAddCircleOutline /> New Chat
          </NewChatButton>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <ChatHistoryList>
              {threads.map((chat) => (
                <ChatHistoryItem key={chat.threadId}>
                  <Link href={`/chat?threadId=${chat.threadId}`} passHref>
                    <a onClick={onClose}>{chat.title}</a>
                  </Link>
                  <div className="actions">
                    <button disabled title="Rename not implemented yet">
                      <IoCreateOutline />
                    </button>
                    <button onClick={() => handleDelete(chat.threadId)}>
                      <IoTrashOutline />
                    </button>
                  </div>
                </ChatHistoryItem>
              ))}
            </ChatHistoryList>
          )}
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default ChatSidebar;
