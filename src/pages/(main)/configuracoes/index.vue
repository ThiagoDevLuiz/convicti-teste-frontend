<template>
  <div class="space-y-5">
    <h1 class="text-[32px] font-bold">Configurações</h1>

    <div
      class="w-full min-h-[350px] bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-3">
      <div class="w-full flex items-center justify-between">
        <h1 class="text-xl font-semibold">Perfis</h1>
        <Dialog v-model:open="dialogs.profile">
          <DialogTrigger asChild>
            <Button size="icon">
              <PlusIcon :size="20" />
            </Button>
          </DialogTrigger>

          <AddProfileDialog
            v-model:open="dialogs.profile"
            @profile-added="handleProfileAdded" />
        </Dialog>
      </div>

      <TableProfiles
        :profiles-data="profilesData"
        :loading="loadingStates.profiles"
        @refresh-data="fetchProfilesData" />
    </div>

    <div
      class="w-full min-h-[350px] bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-3">
      <div class="w-full flex items-center justify-between">
        <h1 class="text-xl font-semibold">Usuários</h1>
        <Dialog v-model:open="dialogs.user">
          <DialogTrigger asChild>
            <Button size="icon">
              <PlusIcon :size="20" />
            </Button>
          </DialogTrigger>

          <AddUserDialog
            v-model:open="dialogs.user"
            @user-added="handleUserAdded"
            @refresh-profiles="fetchProfilesData" />
        </Dialog>
      </div>

      <TableUsers
        :users-data="usersData"
        :loading="loadingStates.users"
        @refresh-data="fetchUsersData"
        @refresh-profiles="fetchProfilesData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PlusIcon } from 'lucide-vue-next';
import TableProfiles, { type ApiProfile } from './components/TableProfiles.vue';
import TableUsers, { type ApiUser } from './components/TableUsers.vue';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AddProfileDialog from './components/AddProfileDialog.vue';
import AddUserDialog from './components/AddUserDialog.vue';

interface ProfilesResponse {
  data: ApiProfile[];
}

interface UsersResponse {
  data: ApiUser[];
}

const profilesData = ref<ProfilesResponse>({ data: [] });
const usersData = ref<UsersResponse>({ data: [] });
const dialogs = ref({
  profile: false,
  user: false,
});
const loadingStates = ref({
  profiles: false,
  users: false,
});
const error = ref('');

onMounted(fetchData);

async function fetchData() {
  try {
    await Promise.all([fetchProfilesData(), fetchUsersData()]);
  } catch (err: any) {
    handleError(err);
  }
}

async function fetchProfilesData() {
  loadingStates.value.profiles = true;
  error.value = '';

  try {
    const { $fetchWithAuth } = useNuxtApp();
    const profilesResponse = await $fetchWithAuth('/profiles', {
      method: 'GET',
    });
    profilesData.value = profilesResponse as ProfilesResponse;
    return profilesResponse;
  } catch (err: any) {
    handleError(err);
    return null;
  } finally {
    loadingStates.value.profiles = false;
  }
}

async function fetchUsersData() {
  loadingStates.value.users = true;
  error.value = '';

  try {
    const { $fetchWithAuth } = useNuxtApp();
    const usersResponse = await $fetchWithAuth('/users', {
      method: 'GET',
    });
    usersData.value = usersResponse as UsersResponse;
    return usersResponse;
  } catch (err: any) {
    handleError(err);
    return null;
  } finally {
    loadingStates.value.users = false;
  }
}

function handleUserAdded() {
  fetchUsersData();
  fetchProfilesData();
}

function handleProfileAdded() {
  fetchProfilesData();
}

function handleError(err: any) {
  if (err.data?.message) {
    error.value = `Erro: ${err.data.message}`;
  } else if (err.message) {
    error.value = `Erro: ${err.message}`;
  } else {
    error.value = 'Ocorreu um erro ao buscar os dados';
  }
  console.error('Erro na página de configurações:', err);
}
</script>
