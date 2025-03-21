import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(() => {
  // Adiciona middleware apenas no lado do cliente para evitar erros no SSR
  if (process.client) {
    const authStore = useAuthStore();

    addRouteMiddleware(
      'global-auth',
      to => {
        // Ignorar verificação para rota de login
        if (to.path === '/login') return;

        // Para outras rotas (exceto login), verificar autenticação
        try {
          const isAuthenticated = authStore.checkAuth();

          // Se não estiver autenticado, redirecionar para login
          if (!isAuthenticated) {
            return navigateTo('/login');
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          return navigateTo('/login');
        }
      },
      { global: true },
    );
  }
});
