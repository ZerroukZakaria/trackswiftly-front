<script setup lang="ts">
import { paginationMeta } from '@api-utils/paginationMeta'
import Swal from 'sweetalert2'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/lib/mapbox-gl-geocoder.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import api from '@/utils/axios'


const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
const API_URL = import.meta.env.VITE_API_URL


const currentTab = ref('pois')


const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'Type', key: 'type' },
  { title: 'Group', key: 'group' },
  { title: 'Actions', key: 'actions', sortable: false },

]


onMounted(() => {
  getPois();


})


const searchQuery = ref('')
const pois = ref([]) 
const totalPois = ref(0) 
const poi = ref({})

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
  getPois()
}


const getPois = async () => {
  try {
    const response = await api.get(`${API_URL}/gw-client/pois?page=${page.value - 1}&pageSize=${itemsPerPage.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    
    pois.value = response.data.content
    totalPois.value = response.data.totalElements 


  } catch (error) {
    console.error("Error fetching POIs:", error.response?.data || error.message);
  }
};


const deletePoi = async (id: number) => {


  
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this POI?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`${API_URL}/gw-client/pois/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `POI deleted successfully.`,

      });

    getPois();


    } catch (error) {
      console.error("Error fetching POIs:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the POI. Please try again.",

      });
    }
  }


}




</script>

<template>
  
    <!-- 👉 Tabs headers-->

    <VCard class="pa-4">
      <div class="custom-tabs">
        <VTabs
          v-model="currentTab"
          class="v-tabs-pill"
          border
        >
        <VTab> <VIcon start icon="tabler-map-pin"/>POI</VTab>
        <VTab> <VIcon start icon="tabler-brand-google-maps"/>Types</VTab>
        <VTab><VIcon start icon="tabler-sitemap"/>Groups</VTab>
        </VTabs>
      </div>
    </VCard>

    <VWindow v-model="currentTab">
      <VWindowItem value ="pois">
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

          <!-- 👉 Add Vehicle button -->
          <VBtn
            prepend-icon="tabler-category-plus"
            @click="openAddVehicleDrawer"
          >
          Add Vehicle
        </VBtn>

        </VCardText>
        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items="pois"
          :items-length="totalPois"
          :headers="headers"
          class="text-no-wrap"
          @update:options="updateOptions"
        >
          <!-- 👉 POI -->
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                size="34"
                :variant="!item.avatar ? 'tonal' : undefined"
                :color="!item.avatar ? 'primary' : undefined"

                class=" cursor-pointer over:opacity-80 transition duration-200 me-3"
              >
                <VImg
                  v-if="item.avatar"
                  :src="item.avatar"
                />
                <span v-else>{{ avatarText(item.name) }}</span>
              </VAvatar>
              <div class="d-flex flex-column">
                <h6 class="text-base">
                  <span
                    class="cursor-pointer over:opacity-80 transition duration-200 font-weight-medium text-link"
                  >
                    {{ item.name }}
                  </span>
                </h6>
                <span class="text-sm text-medium-emphasis">{{ item.vin }}</span>
              </div>
            </div>
          </template>


        <!-- 👉 Address -->
          <template #item.address="{ item }">
            <div class="d-flex align-center gap-4">

              <span>{{ item.address }}</span>
            </div>
          </template>


          <!-- 👉 Type -->
          <template #item.type="{ item }">
            <VChip
                color="success"
                variant="elevated"
                :label="true"
              >
                {{ item.poiTypeResponse.name }}
              </VChip>
            </template>

          

          <!-- 👉 Group -->
          <template #item.group="{ item }">
            <VChip
                color="warning"
                variant="elevated"
                :label="true"
              >
                {{ item.group.name }}
              </VChip>
          </template>          




          <!-- 👉 Actions -->
          <template #item.actions="{ item }">


                      <!-- edit user role -->
          <IconBtn @click="openVehicleDrawer(item.id)">
            <VIcon icon="tabler-edit" />
          </IconBtn>

            <!-- delete user  -->
            <IconBtn @click="deletePoi(item.id)">
              <VIcon icon="tabler-trash" />
            </IconBtn>

          </template>

          <!-- pagination -->
          <template #bottom>
            <VDivider />
            <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
              <p class="text-sm text-disabled mb-0">
                {{ paginationMeta({ page, itemsPerPage }, totalPois) }}
              </p>

              <VPagination
                v-model="page"
                :length="Math.ceil(totalPois / itemsPerPage)"
                :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalPois / itemsPerPage)"
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
      </VWindowItem>


    </VWindow>

</template>
