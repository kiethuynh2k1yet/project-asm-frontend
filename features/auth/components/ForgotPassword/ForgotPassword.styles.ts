import styled from "styled-components";

export const PageWrapper = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  user-select: none;
  background:
    radial-gradient(circle at top left, #dbeafe 0%, transparent 35%),
    radial-gradient(circle at bottom right, #ede9fe 0%, transparent 35%),
    #f8fafc;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const Card = styled.section`
  width: 100%;
  max-width: 460px;
  padding: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);

  @media (max-width: 480px) {
    padding: 28px 22px;
    border-radius: 16px;
  }
`;

export const IconWrapper = styled.div`
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
  border-radius: 16px;
  color: #2563eb;
  background: #dbeafe;
`;

export const Heading = styled.div`
  text-align: center;
`;

export const Title = styled.h1`
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const Description = styled.p`
  margin: 12px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;

  strong {
    color: #0f172a;
    overflow-wrap: anywhere;
  }
`;

export const Form = styled.form`
  margin-top: 28px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
`;

export const Label = styled.label`
  color: #334155;
  font-size: 16px;
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  color: #0f172a;
  font-size: 15px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  }

  &[aria-invalid="true"] {
    border-color: #dc2626;
  }

  &[aria-invalid="true"]:focus {
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
  }
`;

export const ErrorMessage = styled.p`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: red;
  font-size: 13px;
  background-color: #eef2ff;
`;

export const PrimaryButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 22px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #ffffff;
  background: #2563eb;
  font-size: 15px;
  font-weight: 700;
  transition:
    background 0.2s,
    opacity 0.2s,
    transform 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const SuccessContent = styled.div`
  text-align: center;
`;

export const SuccessIcon = styled.div`
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
  border-radius: 50%;
  color: #15803d;
  background: #dcfce7;
  font-size: 28px;
  font-weight: 700;
`;

export const SecondaryButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 22px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  color: #334155;
  background: #ffffff;
  font-size: 15px;
  font-weight: 700;
  transition:
    background 0.2s,
    transform 0.2s;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
  }
`;

export const Footer = styled.div`
  margin-top: 28px;
  text-align: center;

  a {
    color: #2563eb;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;