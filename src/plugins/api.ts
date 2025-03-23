import { useAuthStore } from '~/stores/auth';

interface FetchOptions {
  method?:
    | 'get'
    | 'GET'
    | 'post'
    | 'POST'
    | 'put'
    | 'PUT'
    | 'delete'
    | 'DELETE'
    | 'patch'
    | 'PATCH'
    | 'head'
    | 'HEAD'
    | 'options'
    | 'OPTIONS';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  query?: Record<string, any>;
  [key: string]: any;
}

interface ApiPluginServices {
  getAuthHeaders: () => Record<string, string>;
  fetchWithAuth: <T = any>(url: string, options?: FetchOptions) => Promise<T>;
}

export default defineNuxtPlugin(() => {
  const buildFullUrl = (url: string, baseUrl: string): string => {
    if (url.startsWith('http')) return url;
    return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  };

  if (process.client) {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl;

    addRouteMiddleware('api-auth', to => {
      try {
        if (to.meta.requiresAuth && !authStore.isAuthenticated) {
          return navigateTo('/login');
        }
      } catch (error) {
        console.error('Erro no middleware api-auth:', error);
        return navigateTo('/login');
      }
    });

    const getAuthHeaders = (): Record<string, string> => {
      try {
        return authStore.token
          ? { Authorization: `Bearer ${authStore.token}` }
          : {};
      } catch (error) {
        console.error('Erro ao obter cabeçalhos de autenticação:', error);
        return {};
      }
    };

    const fetchWithAuth = async <T = any>(
      url: string,
      options: FetchOptions = {},
    ): Promise<T> => {
      const fullUrl = buildFullUrl(url, baseUrl);

      if (authStore.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type':
            options.headers?.['Content-Type'] || 'application/json',
        };
      }

      try {
        return await $fetch<T>(fullUrl, options);
      } catch (error: any) {
        if (error.response?.status === 401 && authStore.refreshToken) {
          const refreshSuccess = await authStore.updateToken();

          if (refreshSuccess) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${authStore.token}`,
            };

            return await $fetch<T>(fullUrl, options);
          } else {
            authStore.logout();
            navigateTo('/login');
            throw new Error(
              'Sessão expirada. Por favor, faça login novamente.',
            );
          }
        }

        throw error;
      }
    };

    return {
      provide: {
        getAuthHeaders,
        fetchWithAuth,
      },
    };
  }

  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBaseUrl;

  return {
    provide: {
      getAuthHeaders: () => ({}),
      fetchWithAuth: async <T = any>(
        url: string,
        options: FetchOptions = {},
      ) => {
        const fullUrl = buildFullUrl(url, baseUrl);
        return await $fetch<T>(fullUrl, options);
      },
    },
  };
});
