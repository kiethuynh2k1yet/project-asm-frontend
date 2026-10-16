"use client";

import { useState, type ReactNode } from "react";

import HeaderPage from "@/components/layouts/Header/header";
import Sidebar from "@/components/layouts/Sidebar/sidebar";

import {
  DashboardContainer,
  MainArea,
  Content,
} from "@/features/dashboard/components/dashboardPage/dashboard.styles";

type DashboardProps = {
  children: ReactNode;
};

export default function Dashboard({ children }: DashboardProps) {
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

        <Content>{children}</Content>
      </MainArea>
    </DashboardContainer>
  );
}