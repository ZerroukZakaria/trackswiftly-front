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

const typeHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]


const groupHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]


onMounted(() => {
  getPois();
  getTypes();
  getGroups();
})



//Add Vehicle refs
const isFormValid = ref(false)
const refForm = ref<VForm>()
const isAddPoiDrawer = ref(false)

const name = ref('')
const group = ref()
const type = ref()
const address = ref('')
const longitude = ref(0)
const latitude = ref(0)
const payload = ('')


const poiGroups = ref([]);
const poiTypes = ref([]);

const groups = ref([]);
const types = ref([]);
const totalGroups = ref(0);
const totalTypes = ref(0);


const searchQuery = ref('')
const pois = ref([]) 
const totalPois = ref(0) 
const poi = ref({})

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const itemsPerPageType = ref(10)
const pageType = ref(1)
const sortByType = ref()
const orderByType = ref()

const itemsPerPageGroup = ref(10)
const pageGroup = ref(1)
const sortByGroup = ref()
const orderByGroup = ref()




// Update data table options
const updateOptions = (options: any) => {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
  getPois()
}

const updateOptionsTypes = (options: any) => {
  pageType.value = options.page
  sortByType.value = options.sortBy[0]?.key
  orderByType.value = options.sortBy[0]?.order
  getTypes()
}


const updateOptionsGroups = (options: any) => {
  pageGroup.value = options.page
  sortByGroup.value = options.sortBy[0]?.key
  orderByGroup.value = options.sortBy[0]?.order
  getGroups()
}


const getTypes = async () => {
  try {
    const response = await api.get(`${API_URL}/gw-client/types?page=${pageType.value - 1}&pageSize=${itemsPerPageType.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    types.value = response.data.content
    totalTypes.value = response.data.totalElements || 0;

    console.log(types.value);

    return response.data.content
  } catch (error) {
    console.error("Error fetching types:", error.response?.data || error.message);
  }
}

const getGroups= async () => {
  try {
    const response = await api.get(`${API_URL}/gw-client/groups?page=${pageGroup.value - 1}&pageSize=${itemsPerPageGroup.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    groups.value = response.data.content
    totalGroups.value = response.data.totalElements || 0;

    console.log(groups.value);

    return response.data.content
  } catch (error) {
    console.error("Error fetching groups:", error.response?.data || error.message);
  }
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


const populatePoiTG = async() => {
  const fetchedGroups = await getGroups();
    poiGroups.value = fetchedGroups.map(group => ({
      title: group.name,
      value: group.id
    }))
    const fetchedTypes = await getTypes();
    poiTypes.value = fetchedTypes.map(type => ({
      title: type.name,
      value: type.id,
    }));
}

const openAddPoiDrawer = async() => {
  populatePoiTG();
  isAddPoiDrawer.value = true 
}


const savePoi = async() => {
  try {

  const poiData = {
    name: name.value,
    groupId: group.value ?? 1,
    typeId: type.value,
    address: address.value, 
    latitude: Number(latitude.value), 
    longitude: Number(longitude.value),
    //payload
  };



  // Send the API request
  const response = await api.post(`${API_URL}/gw-client/pois`, [poiData], {
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json'
    }
  });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `POI added successfully.`,
  });

  isAddPoiDrawer.value = false;

  console.log('POI saved successfully:', response.data);
  } catch (error) {
  console.error('Error saving POI:', error.response?.data || error.message);
  }
}

const onSubmit = async () => {
  const { valid } = await refForm.value?.validate(); // Wait for validation to complete
  if (valid) {
    await savePoi();
    getPois();
    
  } else {
    console.log("Form is not valid");
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

const deleteType = async (id: number) => {


  
const result = await Swal.fire({
  title: `Are you sure?`,
  text: `Do you really want to delete this Type?`,
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#d33",
  cancelButtonColor: "#6c757d",
  confirmButtonText: "Yes, delete it!",
  cancelButtonText: "Cancel",
});

if(result.isConfirmed) {
    try {
    await api.delete(`${API_URL}/gw-client/types/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });


    Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Type deleted successfully.`,

    });

  getTypes();


  } catch (error) {
    console.error("Error fetching Types:", error.response?.data || error.message);

    Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete the Type. Please try again.",

    });
  }
}


}

const deleteGroup = async (id: number) => {


  
const result = await Swal.fire({
  title: `Are you sure?`,
  text: `Do you really want to delete this Group?`,
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#d33",
  cancelButtonColor: "#6c757d",
  confirmButtonText: "Yes, delete it!",
  cancelButtonText: "Cancel",
});

if(result.isConfirmed) {
    try {
    await api.delete(`${API_URL}/gw-client/groups/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });


    Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Group deleted successfully.`,

    });

  getGroups();


  } catch (error) {
    console.error("Error fetching Groups:", error.response?.data || error.message);

    Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete the Group. Please try again.",

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
            @click="openAddPoiDrawer"
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

      <VWindowItem value ="types">
        <VCard>
        <VCardText class="d-flex flex-wrap py-4 gap-4">
          <div class="me-3 d-flex gap-3">
            <AppSelect
              :model-value="itemsPerPageType"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: 'All' },
              ]"
              style="inline-size: 6.25rem;"
              @update:model-value="itemsPerPageType = parseInt($event, 10)"
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

          <!-- 👉 Add Type button -->
          <VBtn
            prepend-icon="tabler-category-plus"
            @click="openAddPoiDrawer"
          >
          Add Type
        </VBtn>

        </VCardText>
        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPageType"
          v-model:page="pageType"
          :items="types"
          :items-length="totalTypes"
          :headers="typeHeaders"
          class="text-no-wrap"
          @update:options="updateOptionsTypes"
        >
          <!-- 👉 Type -->
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
              </div>
            </div>
          </template>


        <!-- 👉 Description -->
          <template #item.description="{ item }">
            <div class="d-flex align-center gap-4">

              <span>{{ item.description }}</span>
            </div>
          </template>
      


          <!-- 👉 Actions -->
          <template #item.actions="{ item }">


                      <!-- edit user role -->
          <IconBtn @click="openVehicleDrawer(item.id)">
            <VIcon icon="tabler-edit" />
          </IconBtn>

            <!-- delete user  -->
            <IconBtn @click="deleteType(item.id)">
              <VIcon icon="tabler-trash" />
            </IconBtn>

          </template>

          <!-- pagination -->
          <template #bottom>
            <VDivider />
            <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
              <p class="text-sm text-disabled mb-0">
                {{ paginationMeta({ page: pageType, itemsPerPage: itemsPerPageType }, totalTypes) }}
              </p>

              <VPagination
                v-model="pageType"
                :length="Math.ceil(totalTypes / itemsPerPageType)"
                :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalTypes / itemsPerPageType)"
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

      <VWindowItem value="groups">
        <VCard>
          <VCardText class="d-flex flex-wrap py-4 gap-4">
          <div class="me-3 d-flex gap-3">
            <AppSelect
              :model-value="itemsPerPageGroup"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: 'All' },
              ]"
              style="inline-size: 6.25rem;"
              @update:model-value="itemsPerPageGroup = parseInt($event, 10)"
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
            @click="isAddGroupModal = true"
          >
          Add Group
        </VBtn>

        </VCardText>

        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPageGroup"
          v-model:page="pageGroup"
          :items="groups"
          :items-length="totalGroups"
          :headers="groupHeaders"
          class="text-no-wrap"
          @update:options="updateOptionsGroups"
        >
          <!-- 👉 Vehicle -->
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
              </div>
            </div>
          </template>


            <!-- 👉 Description -->
          <template #item.description="{ item }">
            <div class="d-flex align-center gap-4">

              <span>{{ item.description }} km</span>
            </div>
          </template>


          
          <!-- 👉 Actions -->
          <template #item.actions="{ item }">

          <!-- edit user role -->
          <IconBtn @click="openGroupModal(item.id)">
            <VIcon icon="tabler-edit" />
          </IconBtn>

            <!-- delete user  -->
            <IconBtn @click="deleteGroup(item.id)">
              <VIcon icon="tabler-trash" />
            </IconBtn>

          </template>

          <!-- pagination -->
          <template #bottom>
            <VDivider />
            <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
              <p class="text-sm text-disabled mb-0">
                {{ paginationMeta({ page:pageGroup, itemsPerPage:itemsPerPageGroup }, totalGroups) }}
              </p>

              <VPagination
                v-model="pageGroup"
                :length="Math.ceil(totalGroups / itemsPerPageGroup)"
                :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalGroups / itemsPerPageGroup)"
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
