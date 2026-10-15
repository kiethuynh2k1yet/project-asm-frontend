import styled from "styled-components";

export const Dialog = styled.dialog`
  width: min(640px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  margin: auto;
  padding: 0;
  overflow: auto;

  background: #ffffff;
  color: #1e293b;
  border: none;
  border-radius: 10px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);

  font-family: inherit;

  &,
  & * {
    box-sizing: border-box;
  }

  &::backdrop {
    background: rgba(15, 23, 42, 0.45);
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding: 18px 22px;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

export const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  padding: 0;

  background: transparent;
  color: #64748b;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export const Form = styled.form`
  margin: 0;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  padding: 22px;
  background: #eef2f6;
  
  border-radius: 8px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
`;

export const Required = styled.span`
  color: #dc2626;
`;

export const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 12px;

  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-radius: 6px;

  font-family: inherit;
  font-size: 14px;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 42px;
  padding: 0 12px;

  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-radius: 6px;

  font-family: inherit;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`;

export const Hint = styled.span`
  color: #64748b;
  font-size: 12px;
`;

export const Error = styled.p`
  margin: 0;
  padding: 10px 12px;

  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 6px;

  font-size: 13px;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding: 16px 22px;
  background: #ffffff;
`;

export const CancelButton = styled.button`
  min-height: 38px;
  padding: 0 16px;

  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 6px;

  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

export const SaveButton = styled(CancelButton)`
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;

  &:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }
`;