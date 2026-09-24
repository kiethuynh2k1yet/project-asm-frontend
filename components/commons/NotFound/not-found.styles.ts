"use client";

import Link from "next/link";
import styled, { keyframes } from "styled-components";

const floating = keyframes`
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-18px) rotate(4deg);
  }
`;

const pulse = keyframes`
  0%,
  100% {
    transform: scale(1);
    opacity: 0.35;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
`;

const blink = keyframes`
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
`;

export const Container = styled.main`
  position: relative;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 24px;
  background:
    radial-gradient(
      circle at top left,
      rgba(6, 182, 212, 0.18),
      transparent 36%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(59, 130, 246, 0.16),
      transparent 35%
    ),
    #020617;
`;

export const BackgroundCircle = styled.div`
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: rgba(34, 211, 238, 0.08);
  filter: blur(8px);
  animation: ${pulse} 4s ease-in-out infinite;

  @media (max-width: 640px) {
    width: 300px;
    height: 300px;
  }
`;

export const Content = styled.section`
  position: relative;
  z-index: 1;
  width: min(100%, 650px);
  text-align: center;
`;

export const ErrorCode = styled.h1`
  margin: 0;
  color: #22d3ee;
  font-size: clamp(110px, 20vw, 220px);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.1em;
  text-shadow:
    0 0 20px rgba(34, 211, 238, 0.4),
    0 0 70px rgba(34, 211, 238, 0.2);
  animation: ${floating} 3.5s ease-in-out infinite;
`;

export const Title = styled.h2`
  margin: 32px 0 0;
  color: #f8fafc;
  font-size: clamp(26px, 5vw, 40px);
  font-weight: 700;
`;

export const Description = styled.p`
  max-width: 510px;
  margin: 16px auto 0;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1.7;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
`;

export const HomeButton = styled(Link)`
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0 20px;
  background: #22d3ee;
  color: #082f49;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: #67e8f9;
    box-shadow: 0 8px 26px rgba(34, 211, 238, 0.28);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 3px solid #ffffff;
    outline-offset: 4px;
  }
`;

export const BackButton = styled.button`
  min-height: 46px;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 0 20px;
  background: rgba(15, 23, 42, 0.65);
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #22d3ee;
    background: #0f172a;
    color: #ffffff;
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 3px solid #22d3ee;
    outline-offset: 4px;
  }
`;

export const Status = styled.p`
  margin: 28px 0 0;
  color: #64748b;
  font-size: 13px;
`;

export const Cursor = styled.span`
  margin-left: 4px;
  color: #22d3ee;
  animation: ${blink} 1s step-end infinite;
`;