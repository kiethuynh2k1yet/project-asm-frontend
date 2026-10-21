import styled from "styled-components";
import Link from "next/link";

export const HeaderWrapper = styled.header`
  width: 100%;
  height: 64px;
  min-height: 64px;
  flex-shrink: 0;
  background-color: #1A365D;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  user-select: none;
`;

export const HeaderContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 0 10px;
  }
`;

export const HomeInformation = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 4px;
    min-width: 0;
  }
`;

export const MenuButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const MenuIcon = styled.span<{ $isOpen: boolean }>`
  display: block;
  width: 20px;
  height: 2px;
  background-color: #ffffff;
  position: relative;
  transition: background-color 0.3s ease;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 0;
    width: 20px;
    height: 2px;
    background-color: #ffffff;
    transition:
      transform 0.3s ease,
      top 0.3s ease,
      opacity 0.3s ease;
  }

  &::before {
    top: ${({ $isOpen }) => ($isOpen ? "0" : "-6px")};
    transform: ${({ $isOpen }) =>
      $isOpen ? "rotate(45deg)" : "rotate(0deg)"};
  }

  &::after {
    top: ${({ $isOpen }) => ($isOpen ? "0" : "6px")};
    transform: ${({ $isOpen }) =>
      $isOpen ? "rotate(-45deg)" : "rotate(0deg)"};
  }

  ${({ $isOpen }) =>
    $isOpen &&
    `
    background-color: transparent;
  `}
`;

export const HomeTitle = styled(Link)`
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;

  @media (max-width: 480px) {
    font-size: 16px;
  }

  &:hover {
    color: #dbeafe;
  }

  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 4px;
    border-radius: 2px;
  }
`;

export const BreadcrumbSeparator = styled.span`
  color: #9ca3af;
  font-size: 18px;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const CurrentPage = styled.span`
  color: #fff;
  font-size: 16px;
  font-weight: 500;

  @media (max-width: 480px) {
    display: none;
  }
`;
