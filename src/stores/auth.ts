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
        // Usando a URL local para o proxy, não a URL remota
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

        if (error.message && error.message.includes('CORS')) {
          this.error =
            'Erro de conectividade com o servidor. Problema de CORS.';
        } else if (error.response && error.response.status === 401) {
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
      // Aqui você deve implementar a chamada para obter os dados do usuário
      // utilizando o token de acesso

      try {
        // Este é um exemplo provisório, substitua pela chamada real à API
        this.user = {
          id: 1,
          name: 'Junior Luiz',
          email: 'junior@convicti.com.br',
          role: 'Admin',
        };
      } catch (error) {
        console.error('Erro ao obter perfil do usuário:', error);
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
