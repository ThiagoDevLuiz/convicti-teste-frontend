import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(() => {
  // Verificar se estamos no cliente antes de inicializar o store
  if (process.client) {
    const authStore = useAuthStore();

    addRouteMiddleware('api-auth', to => {
      try {
        // Middleware para verificar autenticação antes de navegar para rotas protegidas
        if (to.meta.requiresAuth) {
          if (!authStore.isAuthenticated) {
            return navigateTo('/login');
          }
        }
      } catch (error) {
        return navigateTo('/login');
      }
    });

    return {
      provide: {
        getAuthHeaders: () => {
          try {
            return authStore.token
              ? { Authorization: `Bearer ${authStore.token}` }
              : {};
          } catch (error) {
            return {};
          }
        },

        async fetchWithAuth(url: string, options: any = {}) {
          try {
            const config = useRuntimeConfig();
            const baseUrl = config.public.apiBaseUrl;
            const fullUrl = url.startsWith('http')
              ? url
              : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;

            // Adicionar cabeçalhos de autenticação se o token existir
            if (authStore.token) {
              options.headers = {
                ...options.headers,
                Authorization: `Bearer ${authStore.token}`,
                'Content-Type':
                  options.headers?.['Content-Type'] || 'application/json',
              };
            }

            try {
              return await $fetch(fullUrl, options);
            } catch (error: any) {
              // Tratar erro 401 (Não autorizado)
              if (error.response?.status === 401 && authStore.refreshToken) {
                const refreshSuccess = await authStore.updateToken();

                if (refreshSuccess) {
                  // Tentar novamente com o novo token
                  options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${authStore.token}`,
                  };

                  return await $fetch(fullUrl, options);
                } else {
                  // Se não conseguir renovar o token, fazer logout
                  authStore.logout();
                  navigateTo('/login');
                  throw new Error(
                    'Sessão expirada. Por favor, faça login novamente.',
                  );
                }
              }

              throw error;
            }
          } catch (error) {
            throw error;
          }
        },
      },
    };
  }

  // Retornar um objeto vazio para o lado do servidor
  return {
    provide: {
      getAuthHeaders: () => ({}),
      fetchWithAuth: async (url: string, options: any = {}) => {
        const config = useRuntimeConfig();
        const baseUrl = config.public.apiBaseUrl;
        const fullUrl = url.startsWith('http')
          ? url
          : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
        return await $fetch(fullUrl, options);
      },
    },
  };
});
