export interface User {
  id: number
  userCode: string
  username: string
  loginEmail: string
  statusId: number
  lastLoginAt: string
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  user: User
}