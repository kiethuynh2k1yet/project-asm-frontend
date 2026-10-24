import styled from "styled-components";

export const Toolbar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;

  width: 100%;
  padding: 16px;

  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);

  &,
  & * {
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 14px;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;

  @media (max-width: 480px) {
    flex-wrap: wrap;

    > button {
      flex: 1 1 calc(50% - 8px);
      padding: 0 10px;
    }
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  min-height: 38px;
  padding: 0 16px;

  background: #2563eb;
  color: #ffffff;
  border: 1px solid #2563eb;
  border-radius: 7px;

  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;

  cursor: pointer;

  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;

  svg {
    flex-shrink: 0;
  }

  &:hover:not(:disabled) {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  &:active:not(:disabled) {
    background: #1e40af;
    border-color: #1e40af;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const EditButton = styled(Button)`
  background: #f97316;
  border-color: #f97316;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #ea580c;
    border-color: #ea580c;
  }

  &:active:not(:disabled) {
    background: #c2410c;
    border-color: #c2410c;
  }

  &:focus-visible {
    outline-color: #fb923c;
  }
`;

export const DeleteButton = styled(Button)`
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #b91c1c;
    border-color: #b91c1c;
  }

  &:active:not(:disabled) {
    background: #991b1b;
    border-color: #991b1b;
  }

  &:focus-visible {
    outline-color: #f87171;
  }
`;

export const Filters = styled.form`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 14px;

  flex: 1;
  min-width: 0;
  max-width: 650px;
  margin: 0;

  @media (max-width: 768px) {
    width: 100%;
    max-width: none;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

export const SearchField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;

  flex: 1;
  min-width: 0;
`;

export const StatusField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;

  flex: 0 0 180px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-basis: 160px;
  }

  @media (max-width: 480px) {
    flex: initial;
    width: 100%;
  }
`;

export const Label = styled.label`
  color: #000;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
`;

export const Select = styled.select`
  width: 100%;
  height: 38px;
  padding: 0 10px;

  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 7px;

  font-size: 13px;

  cursor: pointer;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    border-color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const SearchGroup = styled.div`
  display: flex;
  align-items: stretch;

  width: 100%;
  min-width: 0;
  height: 38px;

  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    border-color: #94a3b8;
  }

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Input = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 12px;

  background: transparent;
  color: #1e293b;
  border: none;
  border-radius: 7px 0 0 7px;
  outline: none;

  font-size: 13px;

  &::placeholder {
    color: #94a3b8;
  }

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  &::-ms-clear {
    display: none;
  }
`;

export const ClearButton = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  width: 38px;
  margin: 0;
  padding: 0;

  background: #ffffff;
  color: #64748b;
  border: none;

  cursor: pointer;

  &:hover {
    color: #1e293b;
  }

  &:focus-visible {
    position: relative;
    z-index: 1;
    outline: 2px solid #60a5fa;
    outline-offset: -3px;
  }
`;

export const SearchButton = styled(Button)`
  flex-shrink: 0;
  align-self: stretch;

  min-height: 0;
  margin: -1px -1px -1px 0;
  padding: 0 15px;

  border-radius: 8px;

  &:focus-visible {
    position: relative;
    z-index: 1;
    outline-offset: 2px;
  }
`;
