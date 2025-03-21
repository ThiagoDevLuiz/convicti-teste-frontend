import { defineStore } from 'pinia';
import type {
  AuthRequestPayload,
  AuthResponse,
  AuthState,
  User,
} from '~/services/types/auth';
import { authService } from '~/services/auth-service';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    expiresIn: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    getUser: state => state.user,
    getToken: state => state.token,
    getIsAuthenticated: state => state.isAuthenticated,
    getLoading: state => state.loading,
    getError: state => state.error,
  },

  actions: {
    async login(username: string, password: string) {
      if (process.server) return false;

      this.loading = true;
      this.error = null;

      try {
        const payload: AuthRequestPayload = {
          grant_type: 'password',
          client_id: useRuntimeConfig().public.clientId,
          client_secret: useRuntimeConfig().public.clientSecret,
          username,
          password,
        };

        const response = await authService.login(payload);
        this.setAuthData(response);

        // Definir informações básicas do usuário sem fazer chamada à API
        this.user = {
          id: 1,
          name: username.split('@')[0], // Usar o nome do email como nome básico
          email: username,
          role: 'user',
        };

        return true;
      } catch (error: any) {
        if (error.response?.status === 401) {
          this.error = 'Credenciais inválidas. Verifique seu e-mail e senha.';
        } else if (error.message && error.message.includes('Network Error')) {
          this.error = 'Erro de rede. Verifique sua conexão com a internet.';
        } else {
          this.error = error.message || 'Falha na autenticação';
        }

        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateToken() {
      if (process.server) return false;
      if (!this.refreshToken) return false;

      this.loading = true;

      try {
        const response = await authService.refreshToken(this.refreshToken);
        this.setAuthData(response);
        return true;
      } catch (error) {
        this.logout();
        return false;
      } finally {
        this.loading = false;
      }
    },

    setAuthData(authData: AuthResponse) {
      try {
        this.token = authData.access_token;
        this.refreshToken = authData.refresh_token;
        this.expiresIn = authData.expires_in;
        this.isAuthenticated = true;

        authService.saveAuthData(authData);
      } catch (error) {
        console.error('Erro ao definir dados de autenticação:', error);
      }
    },

    logout() {
      if (process.server) return;

      try {
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.expiresIn = null;
        this.isAuthenticated = false;
        this.error = null;

        authService.clearAuthData();

        navigateTo('/login');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    },

    checkAuth() {
      if (process.server) return false;

      try {
        const token = authService.getToken();
        const refreshToken = authService.getRefreshToken();

        if (!token || !refreshToken) {
          return false;
        }

        if (authService.isTokenExpired()) {
          this.updateToken();
          return this.isAuthenticated;
        }

        this.token = token;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;

        // Se não tiver informações do usuário, cria um objeto básico
        if (!this.user) {
          this.user = {
            id: 1,
            name: 'Usuário',
            email: 'usuario@exemplo.com',
            role: 'user',
          };
        }

        return true;
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
      }
    },
  },
});
