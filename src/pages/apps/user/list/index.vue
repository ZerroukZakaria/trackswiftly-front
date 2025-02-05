<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'

import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import EditUserRoleModal from '@/views/apps/user/list/EditUserRoleModal.vue'
import { paginationMeta } from '@api-utils/paginationMeta'
import type { UserProperties } from '@db/apps/users/types'
import axios from 'axios'
import api from '@/utils/axios'
import { keycloak } from '@/services/keycloak'

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
  // { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
  // { title: 'Plan', key: 'plan' },
  // { title: 'Billing', key: 'billing' },
]

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
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'

  return 'primary'
}

const isAddNewUserDrawerVisible = ref(false)


// 👉 Add new user
const addNewUser = async (userData: UserProperties) => {
  await $api('/apps/users', {
    method: 'POST',
    body: userData,
  })

  // refetch User
  fetchUsers()
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

// 👉 Get users
const getUsers = async () => {
  try {
    const response = await api.get(
      'users-services/users',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    )
    console.log("User fetched successfully:", response.data);



  } catch(error) {
    console.error("Error fetching users:", error.response?.data || error.message);

  }
}

getUsers();

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

    console.log("User invited successfully:", response.data);
    isDialogVisible.value = false; 
  } catch (error) {
    console.error("Error inviting user:", error.response?.data || error.message);
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


    <VCard
      title="Filters"
      class="mb-6"
    >
      <VCardText>
        <VRow>
          <!-- 👉 Select Role -->
          <VCol
            cols="12"
            sm="12"
          >
            <AppSelect
              v-model="selectedRole"
              label="Select Role"
              placeholder="Select Role"
              :items="roles"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Plan -->
          <!-- <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedPlan"
              label="Select Plan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="tabler-x"
            />
          </VCol> -->
          <!-- 👉 Select Status -->
          <!-- <VCol
            cols="12"
            sm="6"
          >
            <AppSelect
              v-model="selectedStatus"
              label="Select Status"
              placeholder="Select Status"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol> -->
        </VRow>
      </VCardText>
    </VCard>
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

          <!-- 👉 Export button -->
          <!-- <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-screen-share"
          >
            Export
          </VBtn> -->

          <!-- 👉 Add user button -->
          <!-- <VBtn
            prepend-icon="tabler-mail-share"
            @click="isAddNewUserDrawerVisible = true"
          >
            Invite Users
          </VBtn> -->

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
              :color="!item.avatar ? resolveUserRoleVariant(item.role).color : undefined"
              class="me-3"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.fullName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.fullName }}
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
            <span class="text-capitalize">{{ item.email }}</span>
          </div>
        </template>


        <!-- 👉 Role -->
        <!-- <template #item.role="{ item }">
          <div class="d-flex align-center gap-4">
            <VAvatar
              :size="30"
              :color="resolveUserRoleVariant(item.role).color"
              variant="tonal"
            >
              <VIcon
                :size="20"
                :icon="resolveUserRoleVariant(item.role).icon"
              />
            </VAvatar>
            <span class="text-capitalize">{{ item.role }}</span>
          </div>
        </template> -->


        <!-- 👉 Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.status }}
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

          <!-- 3 dots menu -->
          <!-- <VBtn
            icon
            variant="text"
            size="small"
            color="medium-emphasis"
          >
            <VIcon
              size="24"
              icon="tabler-dots-vertical"
            />
            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
                  <template #prepend>
                    <VIcon icon="tabler-eye" />
                  </template>

                  <VListItemTitle>View</VListItemTitle>
                </VListItem>

                <VListItem link>
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>

                <VListItem @click="deleteUser(item.id)">
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Delete</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn> -->
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
    <!-- 👉 Add New User -->
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />




  </section>
</template>
