import type { LoginPayload, LoginResponse } from "../types/auth.type";

export async function loginService(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  console.log("Login status:", response.status);
  console.log("Login content-type:", contentType);
  console.log("Login response:", responseText);

  let data: LoginResponse & { message?: string };

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `API không trả về JSON. Status: ${response.status}. Response: ${responseText.slice(0, 150)}`,
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Đăng nhập thất bại.");
  }

  return data;
}