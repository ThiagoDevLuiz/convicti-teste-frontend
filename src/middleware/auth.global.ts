import { useAuthStore } from '~/stores/auth';

// Middleware global de autenticação
export default defineNuxtRouteMiddleware(async to => {
  // Ignorar middleware durante SSR
  if (process.server) return;

  const authStore = useAuthStore();

  try {
    // Ignorar verificação para rota de login
    if (to.path === '/login') {
      // Se estiver autenticado e estiver tentando acessar a página de login, redirecionar para o dashboard
      const isLoggedIn = await authStore.checkAuth();
      if (isLoggedIn) {
        return navigateTo('/dashboard');
      }
      return;
    }

    // Para todas as outras rotas, verificar autenticação
    const isAuthenticated = await authStore.checkAuth();

    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      return navigateTo('/login');
    }

    // Se estiver autenticado, mas não tiver dados do usuário, buscar os dados
    if (isAuthenticated && !authStore.user) {
      await authStore.fetchUserData();
    }
  } catch (error) {
    // Em caso de erro, redirecionar para login
    return navigateTo('/login');
  }
});
