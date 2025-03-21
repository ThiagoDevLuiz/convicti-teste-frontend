import type { AuthRequestPayload, AuthResponse } from '../types/auth';

export const authService = {
  async login(payload: AuthRequestPayload): Promise<AuthResponse> {
    try {
      console.log('Iniciando processo de autenticação');

      const config = useRuntimeConfig();
      const authUrl = config.public.apiAuthUrl;

      // Usar o $fetch do Nuxt em vez do fetch nativo
      const response = await $fetch<AuthResponse>(authUrl, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Resposta da autenticação recebida');

      // Salvar dados de autenticação
      this.saveAuthData(response);

      return response;
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      throw new Error(error.data?.message || 'Falha na autenticação');
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const config = useRuntimeConfig();
      const authUrl = config.public.apiAuthUrl;

      // Usar o $fetch do Nuxt para atualizar o token
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

      // Salvar os novos dados de autenticação
      this.saveAuthData(response);

      return response;
    } catch (error: any) {
      console.error('Erro ao atualizar token:', error);
      throw new Error(error.data?.message || 'Falha ao atualizar token');
    }
  },

  saveAuthData(authData: AuthResponse): void {
    if (process.client) {
      try {
        const tokenExpiration = Date.now() + authData.expires_in * 1000;

        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('refresh_token', authData.refresh_token);
        localStorage.setItem('token_expiration', tokenExpiration.toString());
      } catch (error) {
        console.error('Erro ao salvar dados de autenticação:', error);
      }
    }
  },

  clearAuthData(): void {
    if (process.client) {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiration');
      } catch (error) {
        console.error('Erro ao limpar dados de autenticação:', error);
      }
    }
  },

  getToken(): string | null {
    if (process.client) {
      try {
        return localStorage.getItem('access_token');
      } catch (error) {
        console.error('Erro ao obter token:', error);
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
        console.error('Erro ao obter refresh token:', error);
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
        console.error('Erro ao obter expiração do token:', error);
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
      console.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  },
};
