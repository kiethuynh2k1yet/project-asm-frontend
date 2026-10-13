"use client";

import { useState } from "react";
import Link from "next/link";

import LogoutButton from "@/features/auth/components/Logout/logout-button";

import {
  HeaderWrapper,
  HeaderContainer,
  HomeInformation,
  HomeTitle,
  BreadcrumbSeparator,
  CurrentPage,
  Navigation,
  NavigationLink,
  MenuButton,
  MobileNavigation,
  MobileNavigationLink,
} from "./header.styles";

 export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <HomeInformation>
          <HomeTitle as={Link} href="/">
            My Website
          </HomeTitle>

          <BreadcrumbSeparator>/</BreadcrumbSeparator>

          <CurrentPage>Home</CurrentPage>
        </HomeInformation>

        <Navigation>
          <NavigationLink as={Link} href="/">
            Home
          </NavigationLink>

          <NavigationLink as={Link} href="/about">
            About
          </NavigationLink>

          <NavigationLink as={Link} href="/contact">
            Contact
          </NavigationLink>
        </Navigation>

        <MenuButton
          type="button"
          aria-label="Mở menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((previous) => !previous)}
        >
          ☰
        </MenuButton>

        {isMenuOpen && (
          <MobileNavigation>
            <MobileNavigationLink as={Link} href="/">
              Home
            </MobileNavigationLink>

            <MobileNavigationLink as={Link} href="/about">
              About
            </MobileNavigationLink>

            <MobileNavigationLink as={Link} href="/contact">
              Contact
            </MobileNavigationLink>
          </MobileNavigation>
        )}
        <LogoutButton />
      </HeaderContainer>
    </HeaderWrapper>
  );
}