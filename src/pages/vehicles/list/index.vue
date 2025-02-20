<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { paginationMeta } from '@api-utils/paginationMeta'
import type { VForm } from 'vuetify/components/VForm'

import api from '@/utils/axios'

const headers = [
  { title: 'Matricule', key: 'matricule' },
  { title: 'Type', key: 'type' },
  { title: 'Group', key: 'group' },
  { title: 'Model', key: 'model' },
  { title: 'Actions', key: 'actions', sortable: false },

]

// 👉 Store
const searchQuery = ref('')
const vehicles = ref([]) 
const vehicle = ref('')
const totalVehicles = ref(0) 
const isVehicleDialogDrawer = ref(false)

const isAddVehicleDrawer = ref(false)

const isFormValid = ref(false)
const refForm = ref<VForm>()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const onSubmit = () => {

}




const getVehicle = async (id: number) => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/vehicles/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    
    vehicle.value = response.data
    console.log(vehicle.value);
    


  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);


  }

}


const getVehicles = async () => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/vehicles?page=${page.value - 1}&pageSize=${itemsPerPage.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    
    vehicles.value = response.data.content
    totalVehicles.value = response.data.totalElements 

    console.log(vehicles.value);


  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);


  }
};
getVehicles();



// Update data table options
const updateOptions = (options: any) => {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const openVehicleDrawer = async (id: number) => {
  console.log('Fetching vehicle:', id)
  await getVehicle(id)
  isVehicleDialogDrawer.value = true
}


</script>


<template>

    <VNavigationDrawer
      v-model="isAddVehicleDrawer"
      temporary
      :width="400"
      location="end"
      class="scrollable-content"
    >

        <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Add Vehicle"
      @cancel="isAddVehicleDrawer = false"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >

          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>

    </VNavigationDrawer>

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

        <!-- 👉 Invite user button -->
        <VBtn
          prepend-icon="tabler-category-plus"
          @click="isAddVehicleDrawer = true"
        >
        Add Vehicle
      </VBtn>

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
        <template #item.matricule="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              @click="openVehicleDrawer(item.id)"
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
              class=" cursor-pointer over:opacity-80 transition duration-200 me-3"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.licensePlate) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <span
                  class="cursor-pointer over:opacity-80 transition duration-200 font-weight-medium text-link"
                  @click="openVehicleDrawer(item.id)"
                >
                  {{ item.licensePlate }}
                </span>
              </h6>
              <!-- <span class="text-sm text-medium-emphasis">{{ item.licensePlate }}</span> -->
            </div>
          </div>
        </template>


        <!-- 👉 Type -->
        <template #item.type="{ item }">
          <div class="d-flex align-center gap-4">

            <span>{{ item.vehicleType.name }}</span>
          </div>
        </template>

        <!-- 👉 Group -->
        <template #item.group="{ item }">
          <div class="d-flex align-center gap-4">

            <span>{{ item.vhicleGroup.name }}</span>
          </div>
        </template>


        <!-- 👉 Model -->
        <template #item.model="{ item }">
          <div class="d-flex align-center gap-4">
            <span>{{ item.model.name }}</span>
          </div>
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
