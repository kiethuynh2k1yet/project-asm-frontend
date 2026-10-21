"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AvatarWrapper,
  AvatarButton,
  Menu,
  UserInfo,
  UserName,
  UserEmail,
  ContainerButton,
  LogoutButton,
} from "./logout.styles";

type AvatarMenuProps = {
  name?: string;
  email?: string;
};

const AVATAR_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#db2777",
  "#4f46e5",
];

function getInitials(name?: string) {
  if (!name || name.trim() === "") {
    return "??";
  }

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2);
  }

  return `${words[0][0]}${words[words.length - 1][0]}`;
}

function getRandomColor(name?: string) {
  const safeName = name ?? "";

  let hash = 0;

  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function LogoutButtonPage({ name, email }: AvatarMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(name);
  const avatarColor = getRandomColor(name);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      window.alert("Không thể đăng xuất. Vui lòng thử lại.");
      setIsLoggingOut(false);
    }
  };

  return (
    <AvatarWrapper ref={wrapperRef}>
      <AvatarButton
        type="button"
        style={{ backgroundColor: avatarColor }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {initials}
      </AvatarButton>

      <Menu $isOpen={isOpen}>
        <UserInfo>
          <UserName>{name || "Người dùng"}</UserName>
          <UserEmail>{email || "Chưa có email"}</UserEmail>
        </UserInfo>
        
        <ContainerButton>
          <LogoutButton
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </LogoutButton>
        </ContainerButton>
      </Menu>
    </AvatarWrapper>
  );
}