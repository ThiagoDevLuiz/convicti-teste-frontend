import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async to => {
  if (process.server) return;

  const authStore = useAuthStore();

  try {
    if (to.path === '/login') {
      return handleLoginRoute(authStore);
    }

    if (to.path === '/') {
      return navigateTo('/dashboard');
    }

    return await handleProtectedRoute(authStore);
  } catch (error) {
    return navigateTo('/login');
  }
});

async function handleLoginRoute(authStore: ReturnType<typeof useAuthStore>) {
  const isLoggedIn = await authStore.checkAuth();

  if (isLoggedIn) {
    return navigateTo('/dashboard');
  }

  return;
}

async function handleProtectedRoute(
  authStore: ReturnType<typeof useAuthStore>,
) {
  const isAuthenticated = await authStore.checkAuth();

  if (!isAuthenticated) {
    return navigateTo('/login');
  }

  if (isAuthenticated && !authStore.user) {
    await authStore.fetchUserData();
  }

  return;
}
