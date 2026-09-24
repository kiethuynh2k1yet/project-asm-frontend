import styled, { keyframes } from "styled-components";

const float = keyframes`
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translate(20px, -28px) rotate(8deg);
  }
`;

const floatReverse = keyframes`
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-18px, 22px);
  }
`;

const cardFloat = keyframes`
  0%,
  100% {
    transform: translateY(0) rotate(-4deg);
  }

  50% {
    transform: translateY(-14px) rotate(-2deg);
  }
`;

const chartGrow = keyframes`
  from {
    transform: scaleY(0.2);
  }

  to {
    transform: scaleY(1);
  }
`;

export const PageWrapper = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px;
  background-color: #f1f5f9;

  @media (max-width: 640px) {
    padding: 0;
  }
`;

export const LoginLayout = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(400px, 0.9fr);
  width: 100%;
  max-width: 1120px;
  min-height: 680px;
  overflow: hidden;
  border-radius: 24px;
  background-color: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 520px;
    min-height: auto;
  }

  @media (max-width: 640px) {
    min-height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }
`;

export const VisualPanel = styled.aside`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 56px;
  color: #ffffff;
  background:
    radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.22), transparent 25%),
    radial-gradient(circle at 80% 75%, rgba(129, 140, 248, 0.65), transparent 30%),
    linear-gradient(135deg, #312e81 0%, #4338ca 48%, #2563eb 100%);

  &::before {
    position: absolute;
    top: -25%;
    right: -20%;
    width: 430px;
    height: 430px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 50%;
    content: "";
  }

  &::after {
    position: absolute;
    bottom: -35%;
    left: -16%;
    width: 390px;
    height: 390px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 50%;
    content: "";
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

export const FloatingCircle = styled.div`
  position: absolute;
  top: 15%;
  right: 14%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.13);
  filter: blur(1px);
  animation: ${float} 7s ease-in-out infinite;
`;

export const FloatingCircleSmall = styled.div`
  position: absolute;
  bottom: 17%;
  left: 10%;
  width: 46px;
  height: 46px;
  border: 8px solid rgba(255, 255, 255, 0.24);
  border-radius: 50%;
  animation: ${floatReverse} 6s ease-in-out infinite;
`;

export const VisualContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 430px;
`;

export const VisualTitle = styled.h2`
  margin: 0 0 16px;
  font-size: clamp(34px, 4vw, 48px);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -1px;
`;

export const VisualDescription = styled.p`
  max-width: 390px;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
  line-height: 1.7;
`;

export const MockupCard = styled.div`
  width: min(100%, 390px);
  margin-top: 48px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 22px 38px rgba(30, 27, 75, 0.26);
  backdrop-filter: blur(12px);
  animation: ${cardFloat} 6s ease-in-out infinite;
`;

export const MockupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
`;

export const MockupLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #4338ca;
  font-size: 10px;
  font-weight: 800;
  background-color: #ffffff;
`;

export const MockupTitle = styled.span`
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
`;

export const MockupBar = styled.div`
  width: 50px;
  height: 7px;
  margin-left: auto;
  border-radius: 99px;
  background-color: rgba(255, 255, 255, 0.32);
`;

export const MockupContent = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14px;
  padding: 16px;
`;

export const MockupChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 125px;
  padding: 12px;
  border-radius: 12px;
  background-color: rgba(15, 23, 42, 0.17);
`;

export const MockupChartBar = styled.div<{ $height: string }>`
  flex: 1;
  height: ${({ $height }) => $height};
  min-width: 10px;
  border-radius: 6px 6px 3px 3px;
  background: linear-gradient(to top, #a5b4fc, #ffffff);
  transform-origin: bottom;
  animation: ${chartGrow} 0.8s ease-out backwards;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }

  &:nth-child(4) {
    animation-delay: 0.4s;
  }

  &:nth-child(5) {
    animation-delay: 0.5s;
  }
`;

export const MockupItems = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
`;

export const MockupItem = styled.div`
  height: 24px;
  border-radius: 7px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.46) 0%,
    rgba(255, 255, 255, 0.16) 100%
  );

  &:nth-child(2) {
    width: 78%;
  }

  &:nth-child(3) {
    width: 58%;
  }
`;

export const FormPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 470px;
  padding: 56px;
  margin: 0 auto;

  @media (max-width: 640px) {
    justify-content: flex-start;
    padding: 40px 24px;
  }
`;

export const Header = styled.header`
  margin-bottom: 30px;
`;

export const Title = styled.h1`
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
`;

export const Subtitle = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
`;

export const LoginFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  color: #334155;
  font-size: 14px;
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  color: #0f172a;
  font-family: inherit;
  font-size: 14px;
  background-color: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
  }
`;

export const FormOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const RememberLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #4f46e5;
  cursor: pointer;
`;

export const ForgotPassword = styled.a`
  color: #4f46e5;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const Message = styled.p`
  margin: -4px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  color: #4338ca;
  font-size: 13px;
  background-color: #eef2ff;
`;

export const LoginButton = styled.button`
  width: 100%;
  padding: 13px 16px;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const RegisterText = styled.p`
  margin: 24px 0 0;
  color: #64748b;
  font-size: 14px;
  text-align: center;
`;

export const RegisterLink = styled.a`
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const MotionAccessibility = styled.div`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;