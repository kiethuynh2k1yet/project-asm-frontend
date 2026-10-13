import styled, { css } from "styled-components";
import Image from "next/image";
import Link from "next/link";

const scrollbarStyles = css`
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

export const SidebarContainer = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 100;

  width: 280px;
  height: 100dvh;

  display: flex;
  flex-direction: column;

  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;

  &,
  & * {
    box-sizing: border-box;
  }
`;

export const LogoSection = styled.div`
  /* Không nằm trong vùng cuộn và không bị co lại */
  flex-shrink: 0;

  height: 100px;
  padding: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-bottom: 1px solid #eef2f6;
`;

export const LogoImage = styled(Image)`
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
`;

export const ParentScrollArea = styled.nav`
  /* Chiếm phần chiều cao còn lại bên dưới logo */
  flex: 1;
  min-height: 0;

  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior-y: contain;

  ${scrollbarStyles}
`;

export const MenuGroup = styled.div`
  margin-bottom: 6px;
`;

export const ParentButton = styled.button<{ $open: boolean }>`
  width: 100%;
  min-height: 48px;
  padding: 12px;

  display: flex;
  align-items: center;
  gap: 12px;

  border: 0;
  border-radius: 6px;
  background: ${({ $open }) => ($open ? "#f8fafc" : "transparent")};

  color: #374151;
  font: inherit;
  font-size: 15px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
  }

  svg {
    flex-shrink: 0;
  }
`;

export const ParentLabel = styled.span`
  flex: 1;
  min-width: 0;
`;

export const Arrow = styled.span<{ $open: boolean }>`
  display: inline-flex;
  flex-shrink: 0;

  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0)")};
  transition: transform 0.2s ease;
`;

export const ChildrenScrollArea = styled.div`
  /* Thanh cuộn riêng cho các mục con */
  max-height: 320px;
  margin: 4px 0 10px 16px;
  padding: 0 4px;

  overflow-y: auto;
  overflow-x: hidden;

  /* Cuộn đến cuối mục con không kéo theo vùng cha */
  overscroll-behavior-y: contain;

  ${scrollbarStyles}
`;

export const ChildLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;

  min-height: 46px;
  margin-bottom: 2px;
  padding: 10px 12px 10px 16px;

  border-left: 4px solid
    ${({ $active }) => ($active ? "#1677ff" : "transparent")};

  background: ${({ $active }) => ($active ? "#e8f1ff" : "transparent")};

  color: ${({ $active }) => ($active ? "#1677ff" : "#374151")};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  line-height: 1.4;
  text-decoration: none;

  transition:
    background 0.15s ease,
    color 0.15s ease;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#e8f1ff" : "#f5f7fa")};
    color: #1677ff;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
  }
`;

export const PageContent = styled.main`
  margin-left: 280px;
  min-height: 100dvh;
  padding: 32px;
  box-sizing: border-box;
  background: #f8fafc;
`;