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
        v-for="(profile, index) in profilesTable"
        :key="profile.id"
        :class="index % 2 === 0 ? 'bg-background' : 'bg-card'">
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          profile.name
        }}</TableCell>
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          profile.userCount
        }}</TableCell>
        <TableCell class="align-middle py-1.5">
          <div class="flex gap-2.5">
            <Badge v-for="permission in profile.permissions" :key="permission">
              {{ permission }}
            </Badge>
            <template v-if="profile.permissions.length === 0">
              <Badge> Nenhuma </Badge>
            </template>
          </div>
        </TableCell>
        <TableCell class="w-10 bg-card text-right align-middle px-1 py-1.5">
          <Button variant="ghost" size="icon">
            <NuxtImg
              :src="AppImages.EditIcon"
              :width="18"
              :height="18"
              alt="Editar" />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import AppImages from '~~/public/images';

export type Profile = {
  id: number;
  name: string;
  userCount: number;
  permissions: string[];
};

defineProps<{
  profilesTable: Profile[];
}>();
</script>
