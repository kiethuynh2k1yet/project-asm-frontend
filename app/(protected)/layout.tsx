"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import styled from "styled-components";

import HeaderPage from "@/components/layouts/Header/header";
import Sidebar from "@/components/layouts/Sidebar/sidebar";
import { AuthRoleProvider } from "@/features/auth/components/auth-role-provider";

import {
  DashboardContainer,
  MainArea,
  Content,
} from "@/features/dashboard/components/dashboardPage/dashboard.styles";

type DashboardProps = {
  children: ReactNode;
};

const SidebarBackdrop = styled.button`
  display: none;

  @media (max-width: 768px) {
    position: fixed;
    inset: 64px 0 0;
    z-index: 10;
    display: block;
    width: 100%;
    padding: 0;
    background: rgba(15, 23, 42, 0.4);
    border: 0;
  }
`;

export default function Dashboard({ children }: DashboardProps) {
  const pathname = usePathname();
  return (
    <AuthRoleProvider>
      <DashboardFrame key={pathname}>{children}</DashboardFrame>
    </AuthRoleProvider>
  );
}

function DashboardFrame({ children }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSidebarGroup, setOpenSidebarGroup] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSidebarGroupClick = (groupId: string) => {
    if (!isSidebarOpen) {
      setOpenSidebarGroup(groupId);
      setIsSidebarOpen(true);
      return;
    }

    setOpenSidebarGroup((current) => (current === groupId ? null : groupId));
  };

  const handleSidebarNavigate = () => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <DashboardContainer>
      <Sidebar
        isOpen={isSidebarOpen}
        openGroupId={openSidebarGroup}
        onGroupClick={handleSidebarGroupClick}
        onNavigate={handleSidebarNavigate}
      />
      {isSidebarOpen && (
        <SidebarBackdrop
          type="button"
          aria-label="Đóng menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
