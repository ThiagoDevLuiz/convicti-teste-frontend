import { defineStore } from 'pinia';
import type {
  AuthRequestPayload,
  AuthResponse,
  AuthState,
  User,
} from '~/lib/types/auth';
import { authService } from '~/lib/services/auth-service';

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
        console.log('Iniciando processo de autenticação');

        const payload: AuthRequestPayload = {
          grant_type: 'password',
          client_id: useRuntimeConfig().public.clientId,
          client_secret: useRuntimeConfig().public.clientSecret,
          username,
          password,
        };

        console.log('Enviando requisição com:', {
          grant_type: payload.grant_type,
          client_id: payload.client_id,
          username: payload.username,
        });

        const response = await authService.login(payload);
        console.log('Autenticação bem-sucedida');

        this.setAuthData(response);
        await this.fetchUserProfile();

        return true;
      } catch (error: any) {
        console.error('Erro completo de autenticação:', error);

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

    async fetchUserProfile() {
      if (!this.token) return;

      try {
        // Aqui você deve implementar a chamada para obter os dados do usuário
        // usando o composable global de $fetch
        const { $fetchWithAuth } = useNuxtApp();

        // Ajuste esta URL para o endpoint correto do perfil do usuário
        const userData = (await $fetchWithAuth('/user/profile')) as User;

        this.user = userData;
      } catch (error: any) {
        console.error('Erro ao obter perfil do usuário:', error);
        // Se houver erro 401, tentar atualizar o token e tentar novamente
        if (error.response?.status === 401) {
          const success = await this.updateToken();
          if (success) {
            this.fetchUserProfile();
          }
        }
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

        // Redirecionar para a página de login após logout
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

        if (!this.user) {
          this.fetchUserProfile();
        }

        return true;
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
      }
    },
  },
});
