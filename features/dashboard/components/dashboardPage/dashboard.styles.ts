import styled from "styled-components";

export const DashboardContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

export const Sidebar = styled.aside`
  width: 280px;
  height: 100%;
  background-color: #1f2937;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const SidebarText = styled.span`
  font-size: 18px;
  font-weight: 600;
`;

export const MainArea = styled.main`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Content = styled.section`
  flex: 1;
  width: 100%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;