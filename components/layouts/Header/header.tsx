"use client";

import { useState } from "react";

import LogoutButtonPage from "@/features/auth/components/Logout/logout-button";

import {
  HeaderWrapper,
  HeaderContainer,
  HomeInformation,
  HomeTitle,
  BreadcrumbSeparator,
  CurrentPage
} from "./header.styles";

 export default function HeaderPage() {

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <HomeInformation>
          <HomeTitle>SUPPORT</HomeTitle>

          <BreadcrumbSeparator>/</BreadcrumbSeparator>

          <CurrentPage>Home</CurrentPage>
        </HomeInformation>
        <LogoutButtonPage />
      </HeaderContainer>
    </HeaderWrapper>
  );
}