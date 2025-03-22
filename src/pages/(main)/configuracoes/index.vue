<template>
  <div class="space-y-5">
    <h1 class="text-[32px] font-bold">Configurações</h1>

    <div
      class="w-full min-h-[350px] bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-3">
      <div class="w-full flex items-center justify-between">
        <h1 class="text-xl font-semibold">Perfis</h1>
        <Dialog v-model:open="profileDialogOpen">
          <DialogTrigger asChild>
            <Button size="icon">
              <PlusIcon :size="20" />
            </Button>
          </DialogTrigger>

          <AddProfileDialog
            v-model:open="profileDialogOpen"
            @profile-added="handleProfileAdded" />
        </Dialog>
      </div>

      <TableProfiles
        :profiles-data="profilesData"
        :loading="loading"
        @refresh-data="fetchProfilesData" />
    </div>

    <div
      class="w-full min-h-[350px] bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-3">
      <div class="w-full flex items-center justify-between">
        <h1 class="text-xl font-semibold">Usuários</h1>
        <Dialog v-model:open="userDialogOpen">
          <DialogTrigger asChild>
            <Button size="icon">
              <PlusIcon :size="20" />
            </Button>
          </DialogTrigger>

          <AddUserDialog
            v-model:open="userDialogOpen"
            @user-added="handleUserAdded"
            @refresh-profiles="fetchProfilesData" />
        </Dialog>
      </div>

      <TableUsers
        :users-data="usersData"
        :loading="loading"
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

const profilesData = ref<ProfilesResponse>({
  data: [],
});

const usersData = ref<UsersResponse>({
  data: [],
});

const profileDialogOpen = ref(false);
const userDialogOpen = ref(false);
const loading = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    loading.value = true;
    await Promise.all([fetchProfilesData(), fetchUsersData()]);
  } catch (error) {
    // Tratar erro
  } finally {
    loading.value = false;
  }
}

async function fetchProfilesData() {
  try {
    loading.value = true;
    const { $fetchWithAuth } = useNuxtApp();
    const profilesResponse = await $fetchWithAuth('/profiles', {
      method: 'GET',
    });
    profilesData.value = profilesResponse as ProfilesResponse;
    return profilesResponse;
  } catch (error) {
    // Tratar erro
  } finally {
    loading.value = false;
  }
}

async function fetchUsersData() {
  try {
    loading.value = true;
    const { $fetchWithAuth } = useNuxtApp();
    const usersResponse = await $fetchWithAuth('/users', {
      method: 'GET',
    });
    usersData.value = usersResponse as UsersResponse;
  } catch (error) {
    // Tratar erro
  } finally {
    loading.value = false;
  }
}

function handleUserAdded() {
  fetchUsersData();
  fetchProfilesData();
}

function handleProfileAdded() {
  fetchProfilesData();
}
</script>
