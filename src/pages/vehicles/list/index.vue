<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { paginationMeta } from '@api-utils/paginationMeta'
import api from '@/utils/axios'
import Swal from 'sweetalert2'

const headers = [
  { title: 'Matricule', key: 'matricule' },
  { title: 'Type', key: 'type' },
  { title: 'Group', key: 'group' },
  { title: 'Model', key: 'model' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },

]

// 👉 Store
const searchQuery = ref('')
const vehicles = ref() 
const totalVehicles = ref(0) 
const isVehicleDialog = ref(false)


const getVehicle = async (id: number) => {
}


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

const openVehicleDialog = async (id: number) => {
  console.log('Fetching user:', id)
  await getVehicle(id)
  isVehicleDialog.value = true
}


</script>


<template>
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
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="vehicles"
        :items-length="totalVehicles"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- 👉 Vehicle -->
        <template #item.user="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              @click="openVehicleDialog(item.id)"
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
              class=" cursor-pointer over:opacity-80 transition duration-200 me-3"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.firstName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <span
                  class="cursor-pointer over:opacity-80 transition duration-200 font-weight-medium text-link"
                  @click="openVehicleDialog(item.id)"
                >
                  {{ item.firstName }} {{ item.lastName }}
                </span>
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
            size="small"
            label
            class="text-capitalize"
          >
          {{ item.enabled ? 'active' : 'inactive' }}
        </VChip>
        </template>

        <!-- 👉 Actions -->
        <template #item.actions="{ item }">

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
              {{ paginationMeta({ page, itemsPerPage }, totalVehicles) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalVehicles / itemsPerPage)"
              :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalVehicles / itemsPerPage)"
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
</template>
