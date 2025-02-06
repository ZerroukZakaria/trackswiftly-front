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

// Headers
const headers = [
  { title: 'Name', key: 'user' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },

]


const keyusers = ref() 
const keytotalUsers = ref(0) 

// 👉 Get users
const getUsers = async () => {
  try {
    const response = await api.get('/users-services/users', {
      headers: {
        'Accept': 'application/json', // Safe standard header
      }
    });

    keyusers.value = response.data
    keytotalUsers.value = response.data.length 

  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);


  }
};

getUsers();


// 👉 Get User Role

const getUserRole = async () => {
  try {
    const response = await api.get('/users-services/', {
      headers: {
        'Accept': 'application/json', // Safe standard header
      }
    });

    console.log("User role got successfully:");

  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);


  }
};

const keyroles = ref([]);

const getRoles = async() => {

  try {
    const response = await api.get('/users-services/groups', {
      headers: {
        'Accept': 'application/json', // Safe standard header
      }
    });

    keyroles.value = response.data.map(role => ({
        name: role.name,
        title: role.name.replace('_GROUP', '').replace('_', ' '),  // Clean up role name
        id: role.id, 
      }));

    console.log("Roles got successfully:", keyroles.value);

  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);


  }


}

getRoles()






// 👉 Fetching users
const { data: usersData, execute: fetchUsers } = await useApi<any>(createUrl('/apps/users', {
  query: {
    q: searchQuery,
    status: selectedStatus,
    plan: selectedPlan,
    role: selectedRole,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))


const users = computed(() => usersData.value.users)
const totalUsers = computed(() => usersData.value.totalUsers)

// 👉 search filters
const roles = [
  { title: 'Manager', value: 'manager', icon: 'tabler-user' },
  { title: 'Driver', value: 'driver', icon: 'tabler-user' },
  { title: 'Dispatcher', value: 'dispatcher', icon: 'tabler-user' },

]

const plans = [
  { title: 'Basic', value: 'basic' },
  { title: 'Company', value: 'company' },
  { title: 'Enterprise', value: 'enterprise' },
  { title: 'Team', value: 'team' },
]

const status = [
  { title: 'Pending', value: 'pending' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
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
    return 'secondary'

  return 'primary'
}



// 👉 Delete user
const deleteUser = async (id: number) => {
  await $api(`/apps/users/${id}`, {
    method: 'DELETE',
  })


  // refetch User
  // TODO: Make this async
  fetchUsers()
}

const isRoleDialogVisible = ref(false)
const selectedUserId = ref(null)

const openRoleDialog = (user) => {
  console.log(user.role)
  selectedUserId.value = user.id
  selectedRole.value = user.role 
  isRoleDialogVisible.value = true
}

// 👉 Edit User Role
const updateUserRole = (userData: {id: number,  role: string}) => {
  isRoleDialogVisible.value = false
    
}




// 👉 Invite User
const isDialogVisible = ref(false)
const email = ref('')

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
          'Accept': '*/*'
        }
      }
    );

    if (response.data) {
      console.log("User invited successfully:", response.data);
    } else {
      console.log("User invited, but no response data was returned.");
    }

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
            :rules="[requiredValidator]"
            :items="keyroles.map(role => role.title)"
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
        <VBtn @click="updateUserRole">
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
        :items="keyusers"
        :items-length="keytotalUsers"
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

          <!-- edit user role -->
          <IconBtn @click="openRoleDialog(item)">
            <VIcon icon="tabler-user-shield" />
          </IconBtn>

          <!-- delete user  -->
          <IconBtn @click="deleteUser(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>

        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, keytotalUsers) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(keytotalUsers / itemsPerPage)"
              :total-visible="$vuetify.display.xs ? 1 : Math.ceil(keytotalUsers / itemsPerPage)"
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
