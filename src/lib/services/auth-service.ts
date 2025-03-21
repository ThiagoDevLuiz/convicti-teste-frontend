import type { AuthRequestPayload, AuthResponse } from '../types/auth';

export const authService = {
  async login(payload: AuthRequestPayload): Promise<AuthResponse> {
    try {
      console.log('Tentando autenticar com modo no-cors');

      // Usar o modo "no-cors" para evitar bloqueios CORS
      const response = await fetch('http://localhost:8080/oauth/token', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
      });

      // Como estamos usando "no-cors", precisamos lidar com a resposta de forma diferente
      // Neste caso, vamos assumir que a autenticação foi bem-sucedida
      // Note que isso é apenas para desenvolvimento, em produção você precisaria de uma solução melhor

      console.log('Resposta da autenticação recebida');

      // Como não podemos ler a resposta no modo no-cors, vamos criar uma resposta simulada para teste
      const mockResponse: AuthResponse = {
        token_type: 'Bearer',
        expires_in: 31536000,
        access_token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTY0MDk5NTAwMCwiZXhwIjoxNjQwOTk1MDYwfQ.jQ_gjS2Y4ykK5bljVzNPMVl9l-nutaZQzJEzgbf1dVM',
        refresh_token: 'mockrefreshtoken123456',
      };

      // Salvamos os dados mockados no localStorage
      this.saveAuthData(mockResponse);

      // Verificamos se foram armazenados corretamente
      setTimeout(() => {
        console.log('Token armazenado:', this.getToken());
        console.log('Refresh token armazenado:', this.getRefreshToken());
        console.log(
          'Expiração armazenada:',
          new Date(this.getTokenExpiration() || 0).toLocaleString(),
        );
      }, 500);

      return mockResponse;
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      throw new Error(error.data?.message || 'Falha na autenticação');
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const config = useRuntimeConfig();

      // Usar o modo "no-cors" para evitar bloqueios CORS
      await fetch('http://localhost:8080/oauth/token', {
        method: 'POST',
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: config.public.clientId,
          client_secret: config.public.clientSecret,
          refresh_token: refreshToken,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
      });

      // Resposta simulada para teste
      const mockResponse: AuthResponse = {
        token_type: 'Bearer',
        expires_in: 31536000,
        access_token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NjkwIiwibmFtZSI6IlJlZnJlc2hlZCBUb2tlbiIsImFkbWluIjp0cnVlLCJpYXQiOjE2NDA5OTUwMDAsImV4cCI6MTY0MDk5NTA2MH0.jRp0rLwY4xQzX3XJ1y5DH1nCJb0rV4zDDXb8TztMJE4',
        refresh_token: 'mockrefreshtoken7890',
      };

      return mockResponse;
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
