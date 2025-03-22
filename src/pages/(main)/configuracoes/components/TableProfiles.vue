<template>
  <Table>
    <TableHeader>
      <TableRow class="border-y-2 border-muted/10">
        <TableHead class="pl-0">Nome</TableHead>
        <TableHead class="text-nowrap">Quantidade De Usuários</TableHead>
        <TableHead>Permissões</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <div class="h-2"></div>
    <TableBody>
      <TableRow
        v-for="(profile, index) in profilesData.data"
        :key="profile.id"
        :class="index % 2 === 0 ? 'bg-background' : 'bg-card'">
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          profile.name
        }}</TableCell>
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          profile.total_users
        }}</TableCell>
        <TableCell class="align-middle py-1.5">
          <div class="flex gap-2.5">
            <Badge v-if="hasFivePermissions(profile.permissions)"> Tudo </Badge>
            <template v-else>
              <Badge
                v-for="permission in profile.permissions"
                :key="permission.id">
                {{ permission.name }}
              </Badge>
            </template>
            <template v-if="profile.permissions.length === 0">
              <Badge> Nenhuma </Badge>
            </template>
          </div>
        </TableCell>
        <TableCell class="w-10 bg-card text-right align-middle px-1 py-1.5">
          <Dialog v-model:open="editDialogOpenMap[profile.id]">
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <NuxtImg
                  :src="AppImages.EditIcon"
                  :width="18"
                  :height="18"
                  alt="Editar" />
              </Button>
            </DialogTrigger>

            <EditProfileDialog
              :profile="profile"
              v-model:open="editDialogOpenMap[profile.id]"
              @profile-updated="onProfileUpdated" />
          </Dialog>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import AppImages from '~~/public/images';
import EditProfileDialog from './EditProfileDialog.vue';

export type ApiProfile = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  total_users: number;
  permissions: Array<{
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      profile_id: number;
      permission_id: number;
    };
  }>;
};

const props = defineProps<{
  profilesData: {
    data: ApiProfile[];
  };
}>();

const emit = defineEmits(['refreshData']);

function onProfileUpdated() {
  emit('refreshData');
}

function hasFivePermissions(permissions: ApiProfile['permissions']) {
  if (permissions.length !== 5) return false;

  const expectedIds = new Set([1, 2, 3, 4, 5]);

  const actualIds = new Set(permissions.map(p => p.id));

  return (
    expectedIds.size === actualIds.size &&
    [...expectedIds].every(id => actualIds.has(id))
  );
}

// Mapa para controlar o estado de cada diálogo de edição
const editDialogOpenMap = ref<Record<number, boolean>>({});
</script>
