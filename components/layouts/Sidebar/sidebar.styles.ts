import styled from "styled-components";

export const SidebarWrapper = styled.aside<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? "280px" : "0px")};
  height: 100%;
  background-color: #1f2937;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s ease;
  user-select: none;
`;

export const CompanyLogoSection = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  border-bottom: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const SidebarMenu = styled.nav`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SidebarText = styled.span`
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
`;