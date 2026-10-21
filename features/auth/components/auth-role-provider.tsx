"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type UserRole = "admin" | "employee";

type AuthRoleContextValue = {
  role: UserRole | null;
  error: string;
};

const AuthRoleContext = createContext<AuthRoleContextValue>({
  role: null,
  error: "",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function AuthRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRole() {
      try {
        const response = await fetch("/api/auth/profile", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data: unknown = await response.json();

        if (!response.ok) {
          const message =
            isRecord(data) && typeof data.message === "string"
              ? data.message
              : "Không tải được quyền tài khoản.";
          throw new Error(message);
        }
        if (
          !isRecord(data) ||
          !isRecord(data.user) ||
          (data.user.role !== "admin" && data.user.role !== "employee")
        ) {
          throw new Error("Thông tin vai trò tài khoản không hợp lệ.");
        }

        setRole(data.user.role);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Không tải được quyền tài khoản.",
        );
      }
    }

    void loadRole();
    return () => controller.abort();
  }, []);

  return (
    <AuthRoleContext.Provider value={{ role, error }}>
      {children}
    </AuthRoleContext.Provider>
  );
}

export function useAuthRole() {
  return useContext(AuthRoleContext);
}
