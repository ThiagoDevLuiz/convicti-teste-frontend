<template>
  <Table>
    <TableHeader>
      <TableRow class="border-y-2 border-muted/10">
        <TableHead class="pl-0">Nome</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Perfil</TableHead>
        <TableHead>Status</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <div class="h-2"></div>
    <TableBody>
      <TableRow
        v-for="(user, index) in usersData.data"
        :key="user.id"
        :class="index % 2 === 0 ? 'bg-background' : 'bg-card'">
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          user.name
        }}</TableCell>
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          user.email
        }}</TableCell>
        <TableCell class="align-middle font-medium py-1.5">{{
          user.profile.name
        }}</TableCell>
        <TableCell class="w-36 align-middle font-medium py-1.5 pr-2">
          <Badge
            :variant="user.active ? 'success' : 'destructive'"
            class="w-full justify-center">
            {{ user.active ? 'ATIVO' : 'INATIVO' }}
          </Badge>
        </TableCell>
        <TableCell class="w-10 bg-card text-right align-middle px-1 py-1.5">
          <Dialog v-model:open="editDialogOpenMap[user.id]">
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <NuxtImg
                  :src="AppImages.EditIcon"
                  :width="18"
                  :height="18"
                  alt="Editar" />
              </Button>
            </DialogTrigger>
            <EditUserDialog
              :user="user"
              v-model:open="editDialogOpenMap[user.id]"
              @user-updated="onUserUpdated" />
          </Dialog>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import AppImages from '~~/public/images';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import EditUserDialog from './EditUserDialog.vue';
import { ref } from 'vue';

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  profile_id: number;
  profile: {
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
};

export type User = {
  id: number;
  name: string;
  email: string;
  profile: string;
  status: string;
};

const props = defineProps<{
  usersData: {
    data: ApiUser[];
  };
}>();

const emit = defineEmits(['refreshData', 'refreshProfiles']);

const editDialogOpenMap = ref<Record<number, boolean>>({});

const onUserUpdated = () => {
  emit('refreshData');
  emit('refreshProfiles');
};
</script>
