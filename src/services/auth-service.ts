import type { AuthRequestPayload, AuthResponse } from './types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRATION: 'token_expiration',
};

export const authService = {
  async login(payload: AuthRequestPayload): Promise<AuthResponse> {
    try {
      const config = useRuntimeConfig();
      const response = await $fetch<AuthResponse>(config.public.apiAuthUrl, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      });

      this.saveAuthData(response);
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Falha na autenticação');
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const config = useRuntimeConfig();
      const response = await $fetch<AuthResponse>(config.public.apiAuthUrl, {
        method: 'POST',
        body: {
          grant_type: 'refresh_token',
          client_id: config.public.clientId,
          client_secret: config.public.clientSecret,
          refresh_token: refreshToken,
        },
        headers: { 'Content-Type': 'application/json' },
      });

      this.saveAuthData(response);
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Falha ao atualizar token');
    }
  },

  saveAuthData(authData: AuthResponse): void {
    if (!process.client) return;
    try {
      const tokenExpiration = Date.now() + authData.expires_in * 1000;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refresh_token);
      localStorage.setItem(
        STORAGE_KEYS.TOKEN_EXPIRATION,
        tokenExpiration.toString(),
      );
    } catch (error) {}
  },

  clearAuthData(): void {
    if (!process.client) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRATION);
    } catch (error) {}
  },

  getToken(): string | null {
    if (!process.client) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  },

  getRefreshToken(): string | null {
    if (!process.client) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      return null;
    }
  },

  getTokenExpiration(): number | null {
    if (!process.client) return null;
    try {
      const expiration = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
      return expiration ? parseInt(expiration, 10) : null;
    } catch (error) {
      return null;
    }
  },

  isTokenExpired(): boolean {
    try {
      const expiration = this.getTokenExpiration();
      if (!expiration) return true;
      return Date.now() > expiration - 30000;
    } catch (error) {
      return true;
    }
  },

  async fetchUserData<T = any>(): Promise<T> {
    try {
      const config = useRuntimeConfig();
      const token = this.getToken();

      if (!token) throw new Error('Token não encontrado');

      return await $fetch<T>(`${config.public.apiBaseUrl}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      throw new Error(
        error.data?.message || 'Falha ao buscar dados do usuário',
      );
    }
  },
};
