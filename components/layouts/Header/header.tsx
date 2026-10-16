"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import LogoutButtonPage from "@/features/auth/components/Logout/logout-button";

import { categoryItems } from "@/components/layouts/Sidebar/categoryIteam";

import {
  HeaderWrapper,
  HeaderContainer,
  HeaderLeft,
  MenuButton,
  MenuIcon,
  HomeInformation,
  HomeTitle,
  BreadcrumbSeparator,
  CurrentPage,
} from "./header.styles";

type User = {
  name: string;
  email: string;
};

type HeaderPageProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function HeaderPage({
  isSidebarOpen,
  onToggleSidebar,
}: HeaderPageProps) {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  // Lấy toàn bộ mục con từ các nhóm cấp 1.
  const childItems = categoryItems.flatMap(
    (item) => item.children ?? []
  );

  // Ưu tiên đường dẫn khớp chính xác.
  // Nếu đang ở trang chi tiết, lấy mục có đường dẫn cha dài nhất.
  const currentItem =
    childItems.find((item) => item.href === pathname) ??
    childItems
      .filter(
        (item) =>
          item.href &&
          pathname.startsWith(`${item.href}/`)
      )
      .sort(
        (a, b) =>
          (b.href?.length ?? 0) - (a.href?.length ?? 0)
      )[0];

  // Tìm nhóm cấp 1 chứa mục con hiện tại.
  const parentItem = categoryItems.find((group) =>
    group.children?.some((child) => child.id === currentItem?.id)
  );

  // Ví dụ: Danh mục / Công việc
  const currentPageTitle = currentItem
    ? parentItem
      ? `${parentItem.label} / ${currentItem.label}`
      : currentItem.label
    : "Home";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/profile");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        setUser(data.user ?? null);
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
        <HeaderLeft>
          <MenuButton
            type="button"
            onClick={onToggleSidebar}
            aria-label={
              isSidebarOpen ? "Đóng sidebar" : "Mở sidebar"
            }
            aria-expanded={isSidebarOpen}
          >
            <MenuIcon $isOpen={isSidebarOpen} />
          </MenuButton>

          <HomeInformation>
            <HomeTitle>IT Hỗ Trợ</HomeTitle>

            <BreadcrumbSeparator>/</BreadcrumbSeparator>

            <CurrentPage>{currentPageTitle}</CurrentPage>
          </HomeInformation>
        </HeaderLeft>

        <LogoutButtonPage
          name={user?.name ?? "Guest User"}
          email={user?.email ?? "guest@example.com"}
        />
      </HeaderContainer>
    </HeaderWrapper>
  );
}