"use client";

import LogoutButton from "@/features/auth/components/Logout/logout-button";

export default function DashboardPage() {
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard page!</p>
            <LogoutButton />
        </div>
    );
}