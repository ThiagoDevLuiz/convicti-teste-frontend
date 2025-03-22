import { defineStore } from 'pinia';
import type {
  AuthRequestPayload,
  AuthResponse,
  AuthState,
  User,
  ApiUserResponse,
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
    tokenExpiration: null,
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

        // Buscar dados do usuário
        await this.fetchUserData();

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

    async fetchUserData() {
      if (!this.token) return false;

      try {
        const userData = (await authService.fetchUserData()) as ApiUserResponse;
        const user = userData.data.user;

        // Extrair as permissões do perfil
        const permissions = user.profile.permissions.map(p => p.name);

        // Atualizar os dados do usuário
        this.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_id: user.profile_id,
          profile_name: user.profile.name,
          permissions: permissions,
        };

        return true;
      } catch (error) {
        return false;
      }
    },

    async updateToken() {
      if (process.server) return false;
      if (!this.refreshToken) return false;

      this.loading = true;

      try {
        const response = await authService.refreshToken(this.refreshToken);
        this.setAuthData(response);

        // Atualizar dados do usuário após refresh do token
        await this.fetchUserData();

        return true;
      } catch (error) {
        this.logout();
        return false;
      } finally {
        this.loading = false;
      }
    },

    setAuthData(data: AuthResponse): void {
      try {
        this.token = data.access_token;
        this.refreshToken = data.refresh_token;
        this.isAuthenticated = true;

        const expiresInMs = data.expires_in * 1000;
        this.tokenExpiration = Date.now() + expiresInMs;

        authService.saveAuthData(data);
      } catch (error) {}
    },

    async logout() {
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
      } finally {
        this.clearAuthData();
      }
    },

    clearAuthData() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.expiresIn = null;
      this.isAuthenticated = false;
      this.error = null;
      this.tokenExpiration = null;
    },

    async checkAuth() {
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

        if (!this.user) {
          // Buscar dados do usuário se não existirem
          await this.fetchUserData();
        }

        return true;
      } catch (error) {
        return false;
      }
    },
  },
});
