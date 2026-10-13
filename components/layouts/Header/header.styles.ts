import styled from "styled-components";

export const HeaderWrapper = styled.header`
  width: 100%;
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const HeaderContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
`;

export const HomeInformation = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const HomeTitle = styled.a`
  color: #2563eb;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: #1d4ed8;
  }
`;

export const BreadcrumbSeparator = styled.span`
  color: #9ca3af;
  font-size: 18px;
`;

export const CurrentPage = styled.span`
  color: #374151;
  font-size: 16px;
  font-weight: 500;
`;

export const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 24px;
`;

export const NavigationLink = styled.a`
  color: #374151;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #2563eb;
  }
`;

export const MenuButton = styled.button`
  display: none;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 24px;
  cursor: pointer;
`;

export const MobileNavigation = styled.nav`
  display: none;
`;

export const MobileNavigationLink = styled.a`
  color: #374151;
  font-size: 15px;
  text-decoration: none;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const DesktopNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

export const MobileMenu = styled.div`
  display: none;
`;

export const ResponsiveHeader = styled.div`
  @media screen and (max-width: 600px) {
    ${HeaderWrapper} {
      height: auto;
    }

    ${HeaderContainer} {
      min-height: 64px;
      height: auto;
      padding: 12px 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    ${HomeInformation} {
      width: 100%;
    }

    ${DesktopNavigation} {
      width: 100%;
      justify-content: space-between;
      gap: 12px;
    }

    ${NavigationLink} {
      font-size: 14px;
    }
  }
`;