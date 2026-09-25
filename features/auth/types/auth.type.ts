export type LoginPayload = {
  login: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    username?: string;
    email?: string;
    fullName?: string;
    role?: string;
  };
};