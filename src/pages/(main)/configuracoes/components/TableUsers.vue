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
        v-for="(user, index) in usersTable"
        :key="user.id"
        :class="index % 2 === 0 ? 'bg-background' : 'bg-card'">
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          user.name
        }}</TableCell>
        <TableCell class="align-middle font-medium text-nowrap py-1.5">{{
          user.email
        }}</TableCell>
        <TableCell class="align-middle font-medium py-1.5">{{
          user.profile
        }}</TableCell>
        <TableCell class="w-36 align-middle font-medium py-1.5 pr-2">
          <Badge
            :variant="user.status === 'ATIVO' ? 'success' : 'destructive'"
            class="w-full justify-center">
            {{ user.status }}
          </Badge>
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

export type User = {
  id: number;
  name: string;
  email: string;
  profile: string;
  status: string;
};

defineProps<{
  usersTable: User[];
}>();
</script>
