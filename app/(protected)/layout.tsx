import type { ReactNode } from "react";

import Dashboard from "@/features/dashboard/components/dashboardPage/dashboard";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <Dashboard>{children}</Dashboard>;
}