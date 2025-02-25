<script setup lang="ts">
import { paginationMeta } from '@api-utils/paginationMeta'
import Swal from 'sweetalert2'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { VForm } from 'vuetify/components/VForm'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

import api from '@/utils/axios'

const headers = [
  { title: 'Plate', key: 'plate' },
  { title: 'Mileage', key: 'mileage' },
  { title: 'Type', key: 'type' },
  { title: 'Group', key: 'group' },
  { title: 'Model', key: 'model' },
  { title: 'Actions', key: 'actions', sortable: false },

]


const typeHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const modelHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Engine Type', key: 'engineType' },
  { title: 'Fuel Type', key: 'fuelType' },
  { title: 'Make', key: 'make' },
  { title: 'Actions', key: 'actions', sortable: false },
]
const groupHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]




const currentTab = ref('vehicles')



// 👉 Store
const searchQuery = ref('')
const vehicles = ref([]) 
const vehicle = ref({})



const totalVehicles = ref(0) 
const isVehicleDialogDrawer = ref(false)
const isAddVehicleDrawer = ref(false)

const isAddTypeModal = ref(false)
const isAddModelModal = ref(false)
const isAddGroupModal = ref(false)


const models = ref([]);
const groups = ref([]);
const types = ref([]);

const Model = ref();
const Type = ref();
const Group = ref();


const vehicleModels = ref([]);
const vehicleGroups = ref([]);
const vehicleTypes = ref([]);


//Add Type refs
const typeName = ref('')
const typeDescription = ref('')

//Add Model refs
const modelName = ref('')
const modelDescription = ref('')

//Add Group refs
const groupName = ref('')
const groupDescription = ref('')



//Add Vehicle refs
const isFormValid = ref(false)
const refForm = ref<VForm>()

const licensePlate = ref('')
const vin = ref('')
const mileage = ref('')
const purchaseDate = ref('')
const type = ref()
const model = ref()
const group = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()


onMounted(() => {
  getVehicles();
  getTypes();
  getModels();
  getGroups();
})



const onSubmit = async () => {
  const { valid } = await refForm.value?.validate(); // Wait for validation to complete
  if (valid) {
    await saveVehicle();
    getVehicles();
    
  } else {
    console.log("Form is not valid");
  }
};

const saveVehicle = async () => {
  try {

    let formattedPurchaseDate = null;
    if (purchaseDate.value) {
      formattedPurchaseDate = new Date(purchaseDate.value).toISOString();
    }


    const vehicleData = {
      vin: vin.value,
      licensePlate: licensePlate.value,
      mileage: Number(mileage.value),
      purchaseDate: formattedPurchaseDate,
      vehicleTypeId: type.value, 
      modelId: model.value, 
      vehicleGroupId: group.value  
    };

    // Send the API request
    const response = await api.post('https://app.trackswiftly.com/vehicles', [vehicleData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


    Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Vehicle added successfully.`,
        didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
      }
     });


     isAddVehicleDrawer.value = false;



    console.log('Vehicle saved successfully:', response.data);
  } catch (error) {
    console.error('Error saving vehicle:', error.response?.data || error.message);
  }
};


const addVehicleType = async () => {


  const typeData = {
    name: '',
    description: ''
  };
  

  const response = await api.post('https://app.trackswiftly.com/types', [typeData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Type added successfully.`,
      didOpen: () => {
      document.querySelector('.swal2-confirm').style.color = 'white';
    }
    });

}

const addVehicleModel = async () => {
  const modelData = {
    name: '',
    make: "",
    year: "",
    engineType: "",
    fuelType: "",
    transmission: "",
    maxPayloadWeight: 0,
    maxVolume: 0  };
  

  const response = await api.post('https://app.trackswiftly.com/models', [modelData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Model added successfully.`,
      didOpen: () => {
      document.querySelector('.swal2-confirm').style.color = 'white';
    }
    });
}

const addVehicleGroup = async () => {
  
  const groupData = {
    name: '',
    description: ''
  };
  

  const response = await api.post('https://app.trackswiftly.com/groups', [groupData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Type added successfully.`,
      didOpen: () => {
      document.querySelector('.swal2-confirm').style.color = 'white';
    }
    });
}

const getModels = async () => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/models?page=${page.value - 1}&pageSize=${itemsPerPage.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    models.value = response.data.content

    return response.data.content
  } catch (error) {
    console.error("Error fetching models:", error.response?.data || error.message);


  }



  
}
const getTypes = async () => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/types?page=${page.value - 1}&pageSize=${itemsPerPage.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    types.value = response.data.content

    return response.data.content
  } catch (error) {
    console.error("Error fetching types:", error.response?.data || error.message);
  }
}

const getGroups= async () => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/groups?page=${page.value - 1}&pageSize=${itemsPerPage.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });


    groups.value = response.data.content

    return response.data.content
  } catch (error) {
    console.error("Error fetching groups:", error.response?.data || error.message);
  }
}

const deleteModel = async (id: number) => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this model?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
        document.querySelector('.swal2-cancel').style.color = 'white';

    }
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`https://app.trackswiftly.com/models/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Model deleted successfully.`,
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });

    getModels();


    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the model. Please try again.",
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });
    }
  }
}

const deleteType = async (id: number) => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this type?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
        document.querySelector('.swal2-cancel').style.color = 'white';

    }
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`https://app.trackswiftly.com/types/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Type deleted successfully.`,
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });

    getTypes();


    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the type. Please try again.",
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });
    }
  }
}

const deleteGroup = async (id: number) => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this group?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
        document.querySelector('.swal2-cancel').style.color = 'white';

    }
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`https://app.trackswiftly.com/groups/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Group deleted successfully.`,
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });

    getGroups();


    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the group. Please try again.",
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });
    }
  }
}

const getVehicle = async (id: number) => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/vehicles/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    vehicle.value = response.data[0]

    console.log(vehicle.value);
    return vehicle.value;    



  } catch (error) {
    console.error("Error fetching vehicle:", error.response?.data || error.message);


  }

}

const getModel = async(id: number) => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/models/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    Model.value = response.data[0]
    return Model.value;    



  } catch (error) {
    console.error("Error fetching vehicle:", error.response?.data || error.message);


  }
}
const getType = async(id: number) => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/types/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    Type.value = response.data[0]

    return Type.value;    

  } catch (error) {
    console.error("Error fetching vehicle:", error.response?.data || error.message);


  }
}
const getGroup = async(id: number) => {
  try {
    const response = await api.get(`https://app.trackswiftly.com/groups/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    Group.value = response.data[0]

    return Group.value;    



  } catch (error) {
    console.error("Error fetching vehicle:", error.response?.data || error.message);


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


  } catch (error) {
    console.error("Error fetching vehicles:", error.response?.data || error.message);
  }
};

const deleteVehicle = async (id: number) => {


    
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this unit?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    didOpen: () => {
        document.querySelector('.swal2-confirm').style.color = 'white';
        document.querySelector('.swal2-cancel').style.color = 'white';

    }
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`https://app.trackswiftly.com/vehicles/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Vehicle deleted successfully.`,
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });

    getVehicles();


    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the vehicle. Please try again.",
          didOpen: () => {
          document.querySelector('.swal2-confirm').style.color = 'white';
        }
      });
    }
  }
  

}

// Update data table options
const updateOptions = (options: any) => {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
  getVehicles()
}

const openVehicleDrawer = async (id: number) => {
  console.log('Fetching vehicle:', id)
  await getVehicle(id)
  isVehicleDialogDrawer.value = true
}

const openAddVehicleDrawer = async () => {

  const fetchedModels = await getModels();

  vehicleModels.value = fetchedModels.map(model => ({
    title: model.name,
    value: model.id
  }))

  const fetchedGroups = await getGroups();
  vehicleGroups.value = fetchedGroups.map(group => ({
    title: group.name,
    value: group.id
  }))

  const fetchedTypes = await getTypes();
  vehicleTypes.value = fetchedTypes.map(type => ({
    title: type.name,
    value: type.id,
  }));

  isAddVehicleDrawer.value = true 

}


const openTypeModal = async (id: number) => {
  console.log('Fetching vehicle:', id)
  
  
}
 
const openModelModal = async (id: number) => {
  console.log('Fetching vehicle:', id)

}
 
const openGroupModal = async (id: number) => {
  console.log('Fetching vehicle:', id)

}
 


</script>


<template>

      <!-- 👉 Add new type-->

      <VDialog v-model="isAddTypeModal"
      max-width="600"
      >

      <DialogCloseBtn @click="isAddTypeModal = !isAddTypeModal" />

          <!-- Dialog Content -->
          <VCard title="Add Type">
            <VCardText>
              <VRow>

                <VCol cols="12">
                  <AppTextField
                    v-model="typeName"
                    label="Name"
                    placeholder="Name"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                   v-model="typeDescription"
                    label="Description"
                    auto-grow
                    clearable
                    clear-icon="tabler-circle-x"
                    counter

                    />
                </VCol>
              </VRow>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isAddTypeModal = false"
              >
                Close
              </VBtn>
              <VBtn @click="">
                Submit
              </VBtn>
            </VCardText>
          </VCard>
        
      </VDialog>

      <!-- 👉 Add new model-->

      <!-- 👉 Add new group-->

      <VDialog v-model="isAddGroupModal"
      max-width="600"
      >

      <DialogCloseBtn @click="isAddGroupModal = !isAddGroupModal" />

          <!-- Dialog Content -->
          <VCard title="Add Group">
            <VCardText>
              <VRow>

                <VCol cols="12">
                  <AppTextField
                    v-model="groupName"
                    label="Name"
                    placeholder="Name"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                   v-model="groupDescription"
                    label="Description"
                    auto-grow
                    clearable
                    clear-icon="tabler-circle-x"
                    counter

                    />
                </VCol>
              </VRow>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isAddGroupModal = false"
              >
                Close
              </VBtn>
              <VBtn @click="">
                Submit
              </VBtn>
            </VCardText>
          </VCard>
        
      </VDialog>




    <!-- 👉 Add new vehicle-->
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

          <VRow>
              <!-- 👉 VIN -->
              <VCol cols="12">
                <AppTextField
                  v-model="vin"
                  :rules="[requiredValidator]"
                  label="VIN"
                  placeholder="SAJWJ1CD4F8597404"
                />
              </VCol>

              <!-- 👉 License Plate -->
              <VCol cols="12">
                <AppTextField
                  v-model="licensePlate"
                  :rules="[requiredValidator]"
                  label="License Plate"
                  placeholder="81-063-5933"
                />
              </VCol>

              <!-- 👉 Mileage -->
              <VCol cols="12">
                <AppTextField
                  v-model="mileage"
                  :rules="[requiredValidator, numberValidator, positiveNumberValidator]"
                  label="Mileage (km)"
                  placeholder="5000"
                  type="number"  
                  min="0"

                />
              </VCol>

              <!-- 👉 Purchase Date -->
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="purchaseDate"
                  label="Purchase Date"
                  placeholder="2025-02-21"
                />
              </VCol>

              <!-- 👉 Type -->
              <VCol cols="12">
                <AppSelect
                  v-model="type"
                  label="Select Type"
                  placeholder="Select Type"
                  :rules="[requiredValidator]"
                  :items="vehicleTypes"
                />
              </VCol>


              <!-- 👉 Model -->
              <VCol cols="12">
                <AppSelect
                  v-model="model"
                  label="Select Model"
                  placeholder="Select Model"
                  :rules="[requiredValidator]"
                  :items="vehicleModels"
                />
              </VCol>

              <!-- 👉 Group -->
              <VCol cols="12">
                <AppSelect
                  v-model="group"
                  label="Select Group"
                  placeholder="Select Group"
                  :rules="[requiredValidator]"
                  :items="vehicleGroups"
                />
              </VCol>



              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Submit
                </VBtn>
                <VBtn
                  type="reset"
                  variant="outlined"
                  color="secondary"
                  @click="isAddVehicleDrawer = false"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>

          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>

    </VNavigationDrawer>


    <!-- 👉 Edit new vehicle-->

    <VNavigationDrawer
      v-model="isVehicleDialogDrawer"
      temporary
      :width="400"
      location="end"
      class="scrollable-content"
    >

        <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Update Vehicle"
      @cancel="isVehicleDialogDrawer = false"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            :vehicle-data="vehicle"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >

          <VRow>
              <!-- 👉 VIN -->
              <VCol cols="12">
                <AppTextField
                  v-model="vehicle.vin"
                  :rules="[requiredValidator]"
                  label="VIN"
                  placeholder="SAJWJ1CD4F8597404"
                />
              </VCol>

              <!-- 👉 License Plate -->
              <VCol cols="12">
                <AppTextField
                  v-model="vehicle.licensePlate"
                  :rules="[requiredValidator]"
                  label="License Plate"
                  placeholder="81-063-5933"
                />
              </VCol>

              <!-- 👉 Mileage -->
              <VCol cols="12">
                <AppTextField
                  v-model="vehicle.mileage"
                  :rules="[requiredValidator, numberValidator, positiveNumberValidator]"
                  label="Mileage (km)"
                  placeholder="5000"
                  type="number"  
                  min="0"

                />
              </VCol>

              <!-- 👉 Purchase Date -->
              <VCol cols="12">
                <AppDateTimePicker
                  v-model="vehicle.purchaseDate"
                  label="Purchase Date"
                  placeholder="2025-02-22"
                />
              </VCol>

              <!-- 👉 Type -->
              <VCol cols="12">
                <AppSelect
                  v-model="type"
                  label="Select Type"
                  placeholder="Select Type"
                  :rules="[requiredValidator]"
                  :items="vehicleTypes"
                />
              </VCol>


              <!-- 👉 Model -->
              <VCol cols="12">
                <AppSelect
                  v-model="model"
                  label="Select Model"
                  placeholder="Select Model"
                  :rules="[requiredValidator]"
                  :items="vehicleModels"
                />
              </VCol>

              <!-- 👉 Group -->
              <VCol cols="12">
                <AppSelect
                  v-model="vehicle.group"
                  label="Select Group"
                  placeholder="Select Group"
                  :rules="[requiredValidator]"
                  :items="vehicleGroups"
                />
              </VCol>



              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Submit
                </VBtn>
                <VBtn
                  type="reset"
                  variant="outlined"
                  color="secondary"
                  @click="isAddVehicleDrawer = false"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>

          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>

    </VNavigationDrawer>


    <VCard class="pa-4">
      <div class="custom-tabs">
        <VTabs
          v-model="currentTab"
          class="v-tabs-pill"
          border
        >
        <VTab>Vehicles</VTab>
        <VTab>Types</VTab>
        <VTab>Models</VTab>
        <VTab>Groups</VTab>
        </VTabs>
      </div>
    </VCard>


    <VWindow v-model="currentTab">
      <VWindowItem value ="vehicles">
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
          :items="vehicles"
          :items-length="totalVehicles"
          :headers="headers"
          class="text-no-wrap"
          @update:options="updateOptions"
        >
          <!-- 👉 Vehicle -->
          <template #item.plate="{ item }">
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
                <span v-else>{{ avatarText(item.licensePlate) }}</span>
              </VAvatar>
              <div class="d-flex flex-column">
                <h6 class="text-base">
                  <span
                    class="cursor-pointer over:opacity-80 transition duration-200 font-weight-medium text-link"
                  >
                    {{ item.licensePlate }}
                  </span>
                </h6>
                <span class="text-sm text-medium-emphasis">{{ item.vin }}</span>
              </div>
            </div>
          </template>


                  <!-- 👉 Mileage -->
          <template #item.mileage="{ item }">
            <div class="d-flex align-center gap-4">

              <span>{{ item.mileage }} km</span>
            </div>
          </template>


          <!-- 👉 Type -->
          <template #item.type="{ item }">
            <VChip
                color="success"
                variant="elevated"
                :label="true"
              >
                {{ item.vehicleType.name }}
              </VChip>
            </template>

          

          <!-- 👉 Group -->
          <template #item.group="{ item }">
            <VChip
                color="warning"
                variant="elevated"
                :label="true"
              >
                {{ item.vhicleGroup.name }}
              </VChip>
          </template>


          <!-- 👉 Model -->
          <template #item.model="{ item }">
            <VChip
                color="info"
                variant="elevated"
                :label="true"
              >
                {{ item.model.name }}
              </VChip>
          </template>

          




          <!-- 👉 Actions -->
          <template #item.actions="{ item }">


                      <!-- edit user role -->
          <IconBtn @click="openVehicleDrawer(item.id)">
            <VIcon icon="tabler-edit" />
          </IconBtn>

            <!-- delete user  -->
            <IconBtn @click="deleteVehicle(item.id)">
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
      </VWindowItem>

      <VWindowItem value="types">
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

          <!-- 👉 Add Type button -->
          <VBtn
            prepend-icon="tabler-category-plus"
            @click="isAddTypeModal = true"
          >
          Add Type
        </VBtn>

        </VCardText>

        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items="types"
          :items-length="totalVehicles"
          :headers="typeHeaders"
          class="text-no-wrap"
          @update:options="updateOptions"
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
      </VWindowItem>

      <VWindowItem value="models">
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
          Add Model
        </VBtn>

        </VCardText>
        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items="models"
          :items-length="totalVehicles"
          :headers="modelHeaders"
          class="text-no-wrap"
          @update:options="updateOptions"
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
                <span class="text-sm text-medium-emphasis">{{ item.vin }}</span>
              </div>
            </div>
          </template>


          <!-- 👉 Mileage -->
          <template #item.engineType="{ item }">
            <VChip
                color="info"
                variant="elevated"
                :label="true"
              >
                {{ item.engineType }}
              </VChip>
            </template>


          <!-- 👉 Type -->
          <template #item.fuelType="{ item }">
            <VChip
                color="success"
                variant="elevated"
                :label="true"
              >
                {{ item.fuelType }}
              </VChip>
            </template>

          

          <!-- 👉 Group -->
          <template #item.make="{ item }">
            <VChip
                color="warning"
                variant="elevated"
                :label="true"
              >
                {{ item.make }}
              </VChip>
          </template>

          <!-- 👉 Actions -->
          <template #item.actions="{ item }">


          <!-- edit user role -->
          <IconBtn @click="openVehicleDrawer(item.id)">
            <VIcon icon="tabler-edit" />
          </IconBtn>

            <!-- delete user  -->
            <IconBtn @click="deleteModel(item.id)">
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
      </VWindowItem>


      <VWindowItem value="groups">
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
            @click="isAddGroupModal = true"
          >
          Add Group
        </VBtn>

        </VCardText>

        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items="groups"
          :items-length="totalVehicles"
          :headers="groupHeaders"
          class="text-no-wrap"
          @update:options="updateOptions"
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


                  <!-- 👉 Mileage -->
          <template #item.mileage="{ item }">
            <div class="d-flex align-center gap-4">

              <span>{{ item.mileage }} km</span>
            </div>
          </template>


          
          <!-- 👉 Actions -->
          <template #item.actions="{ item }">

          <!-- edit user role -->
          <IconBtn @click="openVehicleDrawer(item.id)">
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
      </VWindowItem>

    </VWindow>

  


</template>


<style scoped>
.custom-tabs {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 8px;
}
</style>
