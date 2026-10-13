import styled from "styled-components";

export const HeaderWrapper = styled.header`
  width: 100%;
  height: 64px;
  background-color: #222222;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
`;

export const HomeInformation = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const HomeTitle = styled.a`
  color: #fff;
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
  color: #fff;
  font-size: 16px;
  font-weight: 500;
`;
