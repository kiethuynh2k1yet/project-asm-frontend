"use client";

import Image from "next/image";

import {
  SidebarWrapper,
  CompanyLogoSection,
  SidebarMenu,
  SidebarText,
} from "./sidebar.styles";

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <SidebarWrapper $isOpen={isOpen}>
      <CompanyLogoSection>
        <Image
          src="/images/generated-image.jpg"
          alt="ASM Company Logo"
          fill
          priority
        />
      </CompanyLogoSection>

      <SidebarMenu>
        <SidebarText>Sidebar</SidebarText>
      </SidebarMenu>
    </SidebarWrapper>
  );
}