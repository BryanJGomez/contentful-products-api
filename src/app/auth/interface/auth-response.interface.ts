import { JwtPayload } from './';
export interface LoginResponse {
  user: JwtPayload;
  token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}
