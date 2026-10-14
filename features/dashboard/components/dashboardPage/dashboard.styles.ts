import styled from "styled-components";

export const DashboardContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

export const Sidebar = styled.aside<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? "280px" : "0px")};
  height: 100%;
  background-color: #e2e8f0;
  color: #000;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s ease;
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
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`;