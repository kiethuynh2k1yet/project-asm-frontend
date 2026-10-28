export type LoginPayload = {
  login: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    username?: string;
    email?: string;
    fullName?: string;
    role?: "admin" | "employee";
    employeeCode?: string | null;
  };
};
