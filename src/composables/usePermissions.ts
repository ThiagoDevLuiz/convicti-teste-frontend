import { useAuthStore } from '~/stores/auth';

export function usePermissions() {
  const authStore = useAuthStore();

  /**
   * Verifica se o usuário tem a permissão especificada
   * @param permissionName Nome da permissão a ser verificada
   * @returns {boolean} Verdadeiro se o usuário tiver a permissão, falso caso contrário
   */
  const hasPermission = (permissionName: string): boolean => {
    if (!authStore.user || !authStore.user.permissions) {
      return false;
    }

    return authStore.user.permissions.includes(permissionName);
  };

  /**
   * Verifica se o usuário tem pelo menos uma das permissões especificadas
   * @param permissionNames Array com nomes de permissões a serem verificadas
   * @returns {boolean} Verdadeiro se o usuário tiver pelo menos uma das permissões, falso caso contrário
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!authStore.user || !authStore.user.permissions) {
      return false;
    }

    return permissionNames.some(permission =>
      authStore.user?.permissions.includes(permission),
    );
  };

  /**
   * Verifica se o usuário tem todas as permissões especificadas
   * @param permissionNames Array com nomes de permissões a serem verificadas
   * @returns {boolean} Verdadeiro se o usuário tiver todas as permissões, falso caso contrário
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (!authStore.user || !authStore.user.permissions) {
      return false;
    }

    return permissionNames.every(permission =>
      authStore.user?.permissions.includes(permission),
    );
  };

  /**
   * Retorna todas as permissões do usuário
   * @returns {string[]} Array com as permissões do usuário
   */
  const getUserPermissions = (): string[] => {
    if (!authStore.user || !authStore.user.permissions) {
      return [];
    }

    return authStore.user.permissions;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
  };
}
