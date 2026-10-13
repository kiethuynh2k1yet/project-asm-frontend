"use client";

import { useEffect, useState } from "react";

import LogoutButtonPage from "@/features/auth/components/Logout/logout-button";

import {
  HeaderWrapper,
  HeaderContainer,
  HomeInformation,
  HomeTitle,
  BreadcrumbSeparator,
  CurrentPage
} from "./header.styles";

  type User = {
    name: string;
    email: string;
  };


 export default function HeaderPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/profile");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Fetch user error:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);
  
  return (
    <HeaderWrapper>
      <HeaderContainer>
        <HomeInformation>
          <HomeTitle>SUPPORT</HomeTitle>

          <BreadcrumbSeparator>/</BreadcrumbSeparator>

          <CurrentPage>Home</CurrentPage>
        </HomeInformation>
        {user ? (
          <LogoutButtonPage
            name={user.name}
            email={user.email}
          />
        ) : (
          <LogoutButtonPage
            name="Guest User"
            email="guest@example.com"
          />
        )}
      </HeaderContainer>
    </HeaderWrapper>
  );
}