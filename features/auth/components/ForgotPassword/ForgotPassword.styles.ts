import styled from "styled-components";

export const PageWrapper = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(
      circle at top left,
      rgba(34, 197, 94, 0.16),
      transparent 35%
    ),
    linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
`;

export const Card = styled.section`
  width: 100%;
  max-width: 520px;
  padding: 48px 40px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow:
    0 20px 45px rgba(15, 23, 42, 0.1),
    0 4px 12px rgba(15, 23, 42, 0.06);

  @media (max-width: 480px) {
    padding: 36px 24px;
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

  svg {
    width: 28px;
    height: 28px;
  }
`;

export const Heading = styled.div`
  text-align: center;
`;

export const Title = styled.h1`
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.4px;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const Description = styled.p`
  max-width: 410px;
  margin: 16px auto 30px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.7;
  text-align: center;

  strong {
    color: #0f172a;
    font-weight: 700;
    word-break: break-word;
  }

  @media (max-width: 480px) {
    margin: 14px auto 26px;
    font-size: 14px;
    line-height: 1.6;
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

  &:first-child {
    margin-top: 0;
  }
`;

export const Label = styled.label`
  color: #334155;
  font-size: 14px;
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 14px;
  box-sizing: border-box;

  color: #0f172a;
  font-size: 15px;

  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:hover {
    border-color: #94a3b8;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  }

  &[aria-invalid="true"] {
    border-color: #dc2626;
  }

  &[aria-invalid="true"]:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
  }
`;

export const ErrorMessage = styled.p`
  margin: 0;
  padding: 10px 12px;

  color: #b91c1c;
  font-size: 13px;
  line-height: 1.5;

  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
`;

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  max-width: 280px;
  min-height: 46px;
  margin: 28px auto 0;
  padding: 12px 20px;
  box-sizing: border-box;

  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;

  background: #2563eb;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 12px 22px rgba(37, 99, 235, 0.28);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 3px solid rgba(59, 130, 246, 0.35);
    outline-offset: 3px;
  }

  &:disabled {
    background: #93c5fd;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

export const SuccessContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const SuccessIcon = styled.div`
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  color: #ffffff;
  font-size: 42px;
  font-weight: 700;
  line-height: 1;

  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.3);

  @media (max-width: 480px) {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
    font-size: 34px;
  }
`;

export const SecondaryButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 14px;
  padding: 0 16px;

  color: #334155;
  font-size: 15px;
  font-weight: 600;

  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  cursor: pointer;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #94a3b8;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 3px solid rgba(37, 99, 235, 0.2);
    outline-offset: 3px;
  }

  &:disabled {
    color: #94a3b8;
    background: #f8fafc;
    cursor: not-allowed;
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
    color: #1d4ed8;
    text-decoration: underline;
  }

  a:focus-visible {
    outline: 2px solid rgba(37, 99, 235, 0.3);
    outline-offset: 3px;
    border-radius: 4px;
  }
`;
