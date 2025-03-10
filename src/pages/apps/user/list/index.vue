<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'

import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import { paginationMeta } from '@api-utils/paginationMeta'
import type { UserProperties } from '@db/apps/users/types'
import api from '@/utils/axios'
import Swal from 'sweetalert2'



// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()
const users = ref() 
const totalUsers = ref(0) 
const roles = ref([]);
const isDialogVisible = ref(false)
const email = ref('')
const isRoleDialogVisible = ref(false)
const selectedUserId = ref(null)


// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

// Update data table options
const updateOptions = (options: any) => {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Datatable Headers
const headers = [
  { title: 'Name', key: 'user' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },

]

const resolveUserRoleVariant = (role: string) => {
  const roleLowerCase = role.toLowerCase()

  if (roleLowerCase === 'subscriber')
    return { color: 'warning', icon: 'tabler-circle-check' }
  if (roleLowerCase === 'driver')
    return { color: 'success', icon: 'tabler-user' }
  if (roleLowerCase === 'maintainer')
    return { color: 'primary', icon: 'tabler-chart-pie-2' }
  if (roleLowerCase === 'manager')
    return { color: 'info', icon: 'tabler-edit' }
  if (roleLowerCase === 'admin')
    return { color: 'secondary', icon: 'tabler-device-laptop' }

  return { color: 'primary', icon: 'tabler-user' }
}

const resolveUserStatusVariant = (stat: string) => {

  stat = stat ? 'active' : 'inactive'

  if (stat === 'pending')
    return 'warning'
  if (stat === 'active')
    return 'success'
  if (stat === 'inactive')
    return 'error'

  return 'primary'
}



// 👉 Change user Status
const changeUserStatus = async (id: number, status: boolean) => {
  const newStatus = !status;
  
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to ${newStatus ? "enable" : "disable"} this user?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: newStatus ? "#28a745" : "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: newStatus ? "Yes, enable!" : "Yes, disable!",
    cancelButtonText: "Cancel",
    didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
        document.querySelector('.swal2-cancel').style.color = 'white';

    }
  });

  if (result.isConfirmed) {
    try {
      await api.put(
        `users-services/users/${id}/status?enabled=${newStatus}`,
        {},
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("User status changed successfully");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `User has been ${newStatus ? "enabled" : "disabled"} successfully.`,
        didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
      }
      });

      getUsers(); 

    } catch (error) {
      console.error("Error changing status:", error.response?.data || error.message);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update user status. Please try again.",
        didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
      }
      });
    }
  }
};


// 👉 Get users
const getUsers = async () => {
  try {
    const response = await api.get('/users-services/users', {
      headers: {
        'Accept': 'application/json', // Safe standard header
      }
    });

    users.value = response.data
    totalUsers.value = response.data.length 

  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);


  }
};
getUsers();


// 👉 Get Roles
const getRoles = async() => {

  try {
    const response = await api.get('/users-services/groups', {
      headers: {
        'Accept': 'application/json', // Safe standard header
      }
    });

    roles.value = response.data.map(role => ({
        name: role.name,
        title: role.name.replace('_GROUP', '').replace('_', ' '),  // Clean up role name
        id: role.id, 
      }));


  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);


  }


}

const openRoleDialog = (user) => {
  getRoles()
  selectedUserId.value = user.id
  selectedRole.value = user.role 
  isRoleDialogVisible.value = true
}
// 👉 Edit User Role
const updateUserRole = async (id: number,  role: string) => {

  if (!role) {
    console.error('Role is required');
    return;
  }
  role = `${role}_GROUP`.toLocaleLowerCase();

  try {
      const response = await api.post(`users-services/groups/${role}/users/${id}`, 
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
      console.log('Role updated successfully:', response.data);


      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `User Role has been updated successfully.`,
        didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
      }
     });

    getUsers();



  
  } catch (error) {
    console.error("Error changing role:", error.response?.data || error.message);

    Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to change the user role. Please try again.",
        didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
      }
    });
  }

  isRoleDialogVisible.value = false;

    
}

// 👉 Invite User
const inviteUser = async () => {
  if (!email.value) {
    console.error("Email is required");
    return;
  }
  try {
    const response = await api.post(
      '/users-services/invite-user',
      { email: email.value },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    Swal.fire({
      icon: 'success',
      title: 'User Invited!',
      text: 'The user has been successfully invited.',
      didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
      }
    });

    isDialogVisible.value = false; 
    email.value = '';

  } catch (error) {
    console.error("Error inviting user:", error.response?.data || error.message);

    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: 'There was an error inviting the user. Please try again.',
      didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
      }
    });

    isDialogVisible.value = false; 
    email.value = '';
  }
};


</script>

<template>
  <section>

    <!-- 👉 Change User Role Modal -->
    <VDialog
    v-model="isRoleDialogVisible"
    max-width="600"
    >
    <!-- Dilog close btn -->
    <DialogCloseBtn @click="isRoleDialogVisible = !isRoleDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Update Role">
      <VCardText>
        <VRow>
        <!-- 👉 Role -->
        <VCol cols="12">
          <AppSelect
            label="Select Role"
            placeholder="Select Role"
            v-model="selectedRole"
            :rules="[requiredValidator]"
            :items="roles.map(role => role.title)"
            />
        </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isRoleDialogVisible = false"
        >
          Close
        </VBtn>
        <VBtn @click="updateUserRole(selectedUserId, selectedRole)">
          Save
        </VBtn>
      </VCardText>
    </VCard>
    </VDialog>

    <!-- 👉 Invite User Modal -->
    <VDialog
    v-model="isDialogVisible"
    max-width="600"
    >
    <!-- Dilog close btn -->
    <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

    <!-- Dialog Content -->
    <VCard title="Invite User">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <AppTextField
              label="Email"
              v-model="email"
              prepend-inner-icon="tabler-mail"
              :rules="[requiredValidator, emailValidator]"
              placeholder="johndoe@email.com"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isDialogVisible = false"
        >
          Close
        </VBtn>
        <VBtn @click="inviteUser">
          Invite
        </VBtn>
      </VCardText>
    </VCard>
    </VDialog>


  
    <VCard>
      <VCardText class="d-flex flex-wrap py-4 gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 10rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search"
              density="compact"
            />
          </div>

          <!-- 👉 Invite user button -->
          <VBtn
            prepend-icon="tabler-mail-share"
            @click="isDialogVisible = true"
          >
            Invite Users
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="users"
        :items-length="totalUsers"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- 👉 User -->
        <template #item.user="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
              :color="!item.avatar ? resolveUserRoleVariant('manager').color : undefined"
              class="me-3"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.firstName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.firstName }} {{ item.lastName }}
                </RouterLink>
              </h6>
              <span class="text-sm text-medium-emphasis">{{ item.username }}</span>
            </div>
          </div>
        </template>


        <!-- 👉 Email -->
        <template #item.email="{ item }">
          <div class="d-flex align-center gap-4">
            <VAvatar
              :size="30"
              :color="resolveUserRoleVariant(item.email).color"
              variant="tonal"
            >
              <VIcon
                :size="20"
                icon="tabler-mail"
              />
            </VAvatar>
            <span>{{ item.email }}</span>
          </div>
        </template>


        <!-- 👉 Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.enabled)"
            size="small"
            label
            class="text-capitalize"
          >
          {{ item.enabled ? 'active' : 'inactive' }}
        </VChip>
        </template>

        <!-- 👉 Actions -->
        <template #item.actions="{ item }">


          <!-- change user status -->
          <IconBtn @click="changeUserStatus(item.id, item.enabled)">
            <VIcon icon="tabler-power"
            :style="{ color: item.enabled ? 'green' : 'red' }"
            />
          </IconBtn>

          <!-- edit user role -->
          <IconBtn @click="openRoleDialog(item)">
            <VIcon icon="tabler-user-shield" />
          </IconBtn>




          <!-- delete user  -->
          <IconBtn @click="">
            <VIcon icon="tabler-trash" />
          </IconBtn>

        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalUsers) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalUsers / itemsPerPage)"
              :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalUsers / itemsPerPage)"
            >
              <template #prev="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Previous
                </VBtn>
              </template>

              <template #next="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Next
                </VBtn>
              </template>
            </VPagination>
          </div>
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>





  </section>
</template>
