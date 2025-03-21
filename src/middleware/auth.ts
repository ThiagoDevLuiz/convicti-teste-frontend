import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(to => {
  // Ignorar middleware durante SSR
  if (process.server) return;

  const authStore = useAuthStore();

  // Verificar se o usuário está autenticado
  const isAuthenticated = authStore.checkAuth();

  // Se não estiver autenticado e não estiver na página de login, redirecionar para o login
  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Se estiver autenticado e estiver tentando acessar a página de login, redirecionar para o dashboard
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard');
  }
});
