import { useAuthStore } from '~/stores/auth';

interface PermissionUtils {
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
  hasAllPermissions: (permissionNames: string[]) => boolean;
  getUserPermissions: () => string[];
}

export function usePermissions(): PermissionUtils {
  const authStore = useAuthStore();

  const hasPermission = (permissionName: string): boolean => {
    if (!authStore.user?.permissions) {
      return false;
    }

    return authStore.user.permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!authStore.user?.permissions) {
      return false;
    }

    return permissionNames.some(permission =>
      authStore.user?.permissions.includes(permission),
    );
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (!authStore.user?.permissions) {
      return false;
    }

    return permissionNames.every(permission =>
      authStore.user?.permissions.includes(permission),
    );
  };

  const getUserPermissions = (): string[] => {
    return authStore.user?.permissions || [];
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
  };
}
