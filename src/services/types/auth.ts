export interface AuthRequestPayload {
  grant_type: string;
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
  user?: UserData;
}

export interface Permission {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    profile_id: number;
    permission_id: number;
  };
}

export interface Profile {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  total_users: number;
  permissions: Permission[];
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  profile_id: number;
  profile: Profile;
}

export interface ApiUserResponse {
  data: {
    user: UserData;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_id: number;
  profile_name: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokenExpiration: number | null;
}
