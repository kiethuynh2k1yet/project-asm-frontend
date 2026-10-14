"use client";

import { useState } from "react";

import {
  DashboardContainer,
  MainArea,
  Content,
} from "./dashboard.styles";

import HeaderPage from "@/components/layouts/Header/header";
import Sidebar from "@/components/layouts/Sidebar/sidebar";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <DashboardContainer>
      <Sidebar isOpen={isSidebarOpen} />

      <MainArea>
        <HeaderPage
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        <Content>
          <h1>Nội dung chính</h1>
        </Content>
      </MainArea>
    </DashboardContainer>
  );
}