"use client";

import { useRouter } from "next/navigation";

import { LogoutButton } from "./logout.styles";


export default function LogoutButtonPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
    router.refresh();
  };

  return <LogoutButton onClick={handleLogout}>Đăng xuất</LogoutButton>;
}