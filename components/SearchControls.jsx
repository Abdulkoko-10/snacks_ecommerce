import React from 'react';
import styled from '@emotion/styled';
import { FaSearch } from 'react-icons/fa';

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 20px;
  gap: 12px;
`;

const StyledInput = styled.input`
  padding: 14px 20px;
  width: 100%;
  max-width: 400px;
  font-size: 1rem;
  font-family: 'Open Sans', sans-serif;

  /* Glassmorphism Styles */
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  color: var(--text-color);
  border: 1px solid var(--glass-edge-highlight-color);
  border-radius: 12px;
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 8px 25px -6px var(--glass-box-shadow-color);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &::placeholder {
    color: var(--text-color);
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
                inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
                0 0 0 2px var(--accent-color-rgb, rgba(255, 165, 0, 0.4)),
                0 8px 25px -6px var(--glass-box-shadow-color);
  }
`;

const StyledButton = styled.button`
  padding: 14px 22px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  /* Glassmorphism Styles */
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  color: var(--text-color);
  border: 1px solid var(--glass-edge-highlight-color);
  border-radius: 12px;
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 8px 25px -6px var(--glass-box-shadow-color);
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background-color: var(--accent-color);
    color: var(--text-on-accent-color);
    box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
                inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
                0 12px 30px -6px var(--glass-box-shadow-color);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;


const SearchControls = ({ query, setQuery, handleSearch, loading }) => {
  return (
    <SearchWrapper>
      <StyledInput
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., 'pizza in new york'"
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        disabled={loading}
      />
      <StyledButton onClick={handleSearch} disabled={loading}>
        <FaSearch size={16} />
        {loading ? 'Searching...' : 'Search'}
      </StyledButton>
    </SearchWrapper>
  );
};

export default SearchControls;
