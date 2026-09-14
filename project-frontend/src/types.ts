export interface TodoItem {
  id: string;
  todoText: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  msg: string;
  token: string;
}

export interface RegisterResponse {
  msg: string;
  data: AuthUser;
  token: string;
}