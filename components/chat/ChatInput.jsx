import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { IoSend } from 'react-icons/io5';

const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: radial-gradient(ellipse at 50% 100%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  border-top: 1px solid var(--glass-edge-highlight-color);
  box-shadow: 0 -5px 20px -5px var(--glass-box-shadow-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1000;

  @media screen and (max-width: 800px) {
    padding: 10px;
  }
`;

const InputForm = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 800px;
  margin: 0 auto;
`;

const InputTextarea = styled.textarea`
  flex-grow: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid var(--glass-edge-highlight-color);
  background-color: var(--secondary-background-color);
  color: var(--text-color);
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  resize: none;
  overflow-y: auto;
  line-height: 1.5;
  max-height: 150px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-rgb, rgba(255, 165, 0, 0.3));
  }
`;

const SendButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  line-height: 1;
  /* Applying .btn styles directly */
  background-color: var(--clr-btn-primary-bg);
  color: var(--clr-btn-primary-text);
  border: 1px solid var(--clr-btn-primary-bg);
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;

  &:hover {
    transform: scale(1.03);
    background-color: var(--clr-btn-primary-hover-bg);
  }

  &:disabled {
    background-color: var(--secondary-color);
    opacity: 0.6;
    cursor: not-allowed;
    transform: scale(1);
  }
`;


const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <InputContainer>
      <InputForm onSubmit={handleSubmit}>
        <InputTextarea
          ref={textareaRef}
          value={text}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows="1"
          disabled={disabled}
        />
        <SendButton type="submit" disabled={!text.trim() || disabled}>
          <IoSend />
        </SendButton>
      </InputForm>
    </InputContainer>
  );
};

export default ChatInput;
