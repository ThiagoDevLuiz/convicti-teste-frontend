<template>
  <div class="space-y-5">
    <h1 class="text-[32px] font-bold">Configurações</h1>

    <div
      class="w-full min-h-[350px] bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-3">
      <div class="w-full flex items-center justify-between">
        <h1 class="text-xl font-semibold">Perfis</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon">
              <PlusIcon :size="20" />
            </Button>
          </DialogTrigger>

          <AddProfileDialog />
        </Dialog>
      </div>

      <TableProfiles :profiles-table="profilesTable" />
    </div>

    <div
      class="w-full min-h-[350px] bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-3">
      <div class="w-full flex items-center justify-between">
        <h1 class="text-xl font-semibold">Usuários</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon">
              <PlusIcon :size="20" />
            </Button>
          </DialogTrigger>

          <AddUserDialog />
        </Dialog>
      </div>

      <TableUsers :users-table="usersTable" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';
import TableProfiles, { type Profile } from './components/TableProfiles.vue';
import TableUsers, { type User } from './components/TableUsers.vue';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AddProfileDialog from './components/AddProfileDialog.vue';
import AddUserDialog from './components/AddUserDialog.vue';
const profilesTable: Profile[] = [
  {
    id: 1,
    name: 'Admin',
    userCount: 1,
    permissions: ['Tudo'],
  },
  {
    id: 2,
    name: 'Desenvolvedor',
    userCount: 2,
    permissions: ['Downloads', 'Avaliações', 'Erros', 'Novas Funcionalidades'],
  },
  {
    id: 3,
    name: 'Recursos Humanos',
    userCount: 1,
    permissions: [],
  },
];

const usersTable: User[] = [
  {
    id: 1,
    name: 'Junior Luiz',
    email: 'junior@convicti.com.br',
    profile: 'Admin',
    status: 'ATIVO',
  },
  {
    id: 2,
    name: 'João Lucas',
    email: 'joao.lucas@convicti.com.br',
    profile: 'Desenvolvedor',
    status: 'ATIVO',
  },
  {
    id: 3,
    name: 'Cintia Lopes',
    email: 'cintia.lopes@convicti.com.br',
    profile: 'Recursos Humanos',
    status: 'ATIVO',
  },
];
</script>
