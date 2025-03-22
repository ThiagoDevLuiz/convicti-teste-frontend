import type { AuthRequestPayload, AuthResponse } from './types/auth';

export const authService = {
  async login(payload: AuthRequestPayload): Promise<AuthResponse> {
    try {
      const config = useRuntimeConfig();
      const authUrl = config.public.apiAuthUrl;

      const response = await $fetch<AuthResponse>(authUrl, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
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
      const authUrl = config.public.apiAuthUrl;

      const response = await $fetch<AuthResponse>(authUrl, {
        method: 'POST',
        body: {
          grant_type: 'refresh_token',
          client_id: config.public.clientId,
          client_secret: config.public.clientSecret,
          refresh_token: refreshToken,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.saveAuthData(response);

      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Falha ao atualizar token');
    }
  },

  saveAuthData(authData: AuthResponse): void {
    try {
      if (process.client) {
        const tokenExpiration = Date.now() + authData.expires_in * 1000;

        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('refresh_token', authData.refresh_token);
        localStorage.setItem('token_expiration', tokenExpiration.toString());
      }
    } catch (error) {}
  },

  clearAuthData(): void {
    try {
      if (process.client) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiration');
      }
    } catch (error) {}
  },

  getToken(): string | null {
    if (process.client) {
      try {
        return localStorage.getItem('access_token');
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (process.client) {
      try {
        return localStorage.getItem('refresh_token');
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  getTokenExpiration(): number | null {
    if (process.client) {
      try {
        const expiration = localStorage.getItem('token_expiration');
        return expiration ? parseInt(expiration) : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  isTokenExpired(): boolean {
    try {
      const expiration = this.getTokenExpiration();
      if (!expiration) return true;

      // Adicionando uma margem de 30 segundos para evitar problemas de timing
      return Date.now() > expiration - 30000;
    } catch (error) {
      return true;
    }
  },

  async fetchUserData(): Promise<any> {
    try {
      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl;

      const response = await $fetch(`${apiBaseUrl}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      return response;
    } catch (error: any) {
      throw new Error(
        error.data?.message || 'Falha ao buscar dados do usuário',
      );
    }
  },
};
