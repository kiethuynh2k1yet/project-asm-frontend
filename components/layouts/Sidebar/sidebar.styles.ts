import Link from "next/link";
import styled, { css } from "styled-components";

type SidebarWrapperProps = {
  $isOpen: boolean;
};

type MenuChevronProps = {
  $isOpen: boolean;
};

type MenuGroupButtonProps = {
  $isOpen: boolean;
};

type CompanyLogoSectionProps = {
  $isOpen: boolean;
};

type SubMenuItemProps = {
  $isActive: boolean;
};

// ===== Khung Sidebar =====

export const SidebarWrapper = styled.aside<SidebarWrapperProps>`
  width: ${({ $isOpen }) => ($isOpen ? "280px" : "68px")};
  height: 100%;
  min-height: 0;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  background-color: #ffffff;
  color: #30383d;

  overflow: hidden;
  user-select: none;

  border-style: solid;
  border-color: #e5e7eb;
  border-width: ${({ $isOpen }) => ($isOpen ? "2px" : "0px")};
  border-radius: 8px;

  visibility: visible;

  transition:
    width 0.3s ease,
    border-width 0.3s ease,
    visibility 0s ${({ $isOpen }) => ($isOpen ? "0s" : "0.3s")};

  @media (max-width: 768px) {
    position: fixed;
    top: 64px;
    bottom: 0;
    left: 0;
    z-index: 20;
    width: min(320px, 88vw);
    height: auto;
    border-radius: 0 8px 8px 0;
    box-shadow: ${({ $isOpen }) =>
      $isOpen ? "8px 0 24px rgba(15, 23, 42, 0.16)" : "none"};
    border-width: ${({ $isOpen }) => ($isOpen ? "2px" : "0")};
    transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "-100%")});
    visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transition:
      transform 0.25s ease,
      border-width 0.25s ease,
      visibility 0s ${({ $isOpen }) => ($isOpen ? "0s" : "0.25s")};
  }
`;

// ===== Logo công ty =====

export const CompanyLogoSection = styled.div<CompanyLogoSectionProps>`
  position: relative;
  width: 100%;
  height: ${({ $isOpen }) => ($isOpen ? "220px" : "64px")};
  flex-shrink: 0;
  box-sizing: border-box;
  overflow: hidden;

  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 6px 6px 0 0;
  box-shadow: ${({ $isOpen }) =>
    $isOpen ? "0 2px 8px rgba(0, 0, 0, 0.15)" : "none"};
  z-index: 1;

  transition: height 0.3s ease;

  @media (max-width: 768px) {
    height: ${({ $isOpen }) => ($isOpen ? "160px" : "64px")};
  }

  img {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    object-fit: cover;
    display: block;
  }
`;

// ===== Khu vực menu =====

export const SidebarMenu = styled.nav`
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 8px max(16px, env(safe-area-inset-bottom));

  overflow-y: auto;
  overflow-x: hidden;

  background-color: #ffffff;
  color: #30383d;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

// ===== Nút cấp 1: Danh mục =====

export const MenuGroupButton = styled.button<MenuGroupButtonProps>`
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  padding: 10px 8px;

  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen }) => ($isOpen ? "space-between" : "center")};
  gap: 10px;

  border: none;
  border-radius: 5px;
  background-color: transparent;
  color: #30383d;

  font-size: 16px;
  font-weight: 400;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;

  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
  }
`;

export const MenuGroupLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
    stroke-width: 1.5;
  }
`;

// ===== Mũi tên đóng/mở =====

export const MenuChevron = styled.span<MenuChevronProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  transform: ${({ $isOpen }) => ($isOpen ? "rotate(90deg)" : "rotate(0deg)")};

  transition: transform 0.25s ease;

  svg {
    stroke-width: 1.5;
  }
`;

// ===== Khung chứa mục con =====

export const SubMenu = styled.div`
  margin: 0 0 4px 12px;
  padding-left: 28px;
  border-left: 1px solid #e5e7eb;

  &[hidden] {
    display: none;
  }
`;

export const SubMenuList = styled.ul`
  display: flex;
  flex-direction: column;

  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    min-width: 0;
  }
`;

// ===== CSS dùng chung cho các mục con =====

const subMenuItemStyles = css<SubMenuItemProps>`
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  padding: 10px 8px;

  display: flex;
  align-items: center;
  gap: 12px;

  border: none;
  border-radius: 5px;
  text-decoration: none;

  background-color: ${({ $isActive }) =>
    $isActive ? "#eff6ff" : "transparent"};

  color: ${({ $isActive }) => ($isActive ? "#2563eb" : "#30383d")};

  font-size: 15px;
  font-weight: ${({ $isActive }) => ($isActive ? 500 : 400)};
  text-align: left;
  white-space: nowrap;
  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  svg {
    flex-shrink: 0;
    stroke-width: 1.5;
  }

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? "#dbeafe" : "#f3f4f6")};

    color: #2563eb;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
  }
`;

// ===== Mục có href: chuyển trang =====

export const SubMenuItemLink = styled(Link)<SubMenuItemProps>`
  ${subMenuItemStyles}
`;

// ===== Mục chưa có href: button bị vô hiệu hóa =====

export const SubMenuItem = styled.button<SubMenuItemProps>`
  ${subMenuItemStyles}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:disabled:hover {
    background-color: transparent;
    color: #30383d;
  }
`;
