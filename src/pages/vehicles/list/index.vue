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


const headers = [
  { title: 'Plate', key: 'plate' },
  { title: 'Mileage', key: 'mileage' },
  { title: 'Type', key: 'type' },
  { title: 'Group', key: 'group' },
  { title: 'Model', key: 'model' },
  { title: 'Location', key: 'location' },
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


const locationHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'Longitude', key: 'longitude' },
  { title: 'Latitude', key: 'latitude' },
  { title: 'Actions', key: 'actions', sortable: false },
]


const FuelTypes = ['PETROL', 'ELECTRIC', 'HYBRID', 'HYDROGEN', 'CNG', 'LPG', "BIOFUEL"]
const EngineTypes = ['INTERNAL_COMBUSTION', 'ELECTRIC', 'HYBRID', 'FUEL_CELL']


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
const isAddLocationModal = ref(false)

const isEditTypeModal = ref(false)
const isEditModelModal = ref(false)
const isEditGroupModal = ref(false)
const isEditLocationModal = ref(false)





const models = ref([]);
const groups = ref([]);
const types = ref([]);
const locations = ref([])

const Model = ref();
const Type = ref();
const Group = ref();
const Location = ref();


const vehicleModels = ref([]);
const vehicleGroups = ref([]);
const vehicleTypes = ref([]);
const vehicleLocations = ref([]);
const totalModels = ref(0);

const totalGroups = ref(0);
const totalTypes = ref(0);
const totalLocations = ref(0)


//Add Locaiton refs
const isAddLocationFormValid = ref(false)
const refLocationForm = ref<VForm>();
const locationName = ref('')
const locationLat = ref(0)
const locationLong = ref(0)


//Add Type refs
const isAddTypeFormValid = ref(false)
const refTypeForm = ref<VForm>();
const typeName = ref('')
const typeDescription = ref('')

//Edit Type refs
const isUpdateTypeFormValid = ref(false)
const refTypeUpdateForm = ref<VForm>()
const typeNameUpdate = ref('')
const typeDescriptionUpdate = ref('')

//Edit group refs
const isUpdateGroupFormValid = ref(false)
const refGroupUpdateForm = ref<VForm>()
const groupNameUpdate = ref('')
const groupDescriptionUpdate = ref('')


//Edit model refs
const isUpdateModelFormValid = ref(false)
const refModelUpdateForm = ref<VForm>()
const modelNameUpdate = ref('')
const modelMakeUpdate = ref('')
const modelYearUpdate = ref('')
const modelEngineTypeUpdate = ref('')
const modelFuelTypeUpdate = ref('')
const modelTransmissionUpdate = ref('')
const modelMaxPayloadWeightUpdate = ref('')
const modelMaxVolumeUpdate = ref('')


//Edit location refs

const isUpdateLocationFormValid = ref(false)
const refLocationUpdateForm = ref<VForm>()
const locationNameUpdate = ref('')
const locationUpdateLat = ref(0)
const locationUpdateLong = ref(0)




//Add Model refs
const isAddModelFormValid = ref(false)
const refModelForm = ref('')
const modelName = ref('')
const modelMake = ref('')
const modelYear = ref('')
const modelEngineType = ref('')
const modelFuelType = ref('')
const modelTransmission = ref('')
const modelMaxPayloadWeight = ref('')
const modelMaxVolume = ref('')

//Add Group refs
const isAddGroupFormValid = ref(false)
const refGroupForm = ref<VForm>()
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
const location = ref()

//Update Vehicle refs
const isFormUpdateValid = ref(false)
const refUpdateForm = ref<VForm>()
const licensePlateUpdate = ref('')
const vinUpdate = ref('')
const mileageUpdate = ref('')
const purchaseDateUpdate = ref('')
const typeUpdate = ref()
const modelUpdate = ref()
const groupUpdate = ref()
const locationUpdate = ref()


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

const itemsPerPageModel = ref(10)
const pageModel = ref(1)
const sortByModel = ref()
const orderByModel = ref()

const itemsPerPageLocation = ref(10)
const pageLocation = ref(1)
const sortByLocation = ref()
const orderByLocation = ref()




const populateVehicleTMG = async() => {
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

    const fetchedLocations = await getLocations();
    vehicleLocations.value = fetchedLocations.map(location => ({
      title: location.name,
      value: location.id,
    }));
}


const onSubmit = async () => {
  const { valid } = await refForm.value?.validate(); // Wait for validation to complete
  if (valid) {
    await saveVehicle();
    getVehicles();
    
  } else {
    console.log("Form is not valid");
  }
};


const submitAddVehicleGroup = async() => {
  const { valid } = await refGroupForm.value?.validate();

  if (valid) {
    await addVehicleGroup();
    getGroups();

  } else {
    console.log("Form is not valid");
  }

}

const submitAddVehicleType = async() => {
  const { valid } = await refTypeForm.value?.validate();

  if (valid) {
    await addVehicleType();
    getTypes();

  } else {
    console.log("Form is not valid");
  }
}

const submitAddVehicleModel = async() => {
  const { valid } = await refModelForm.value?.validate();

  if (valid) {
    await addVehicleModel();
    getModels();

  } else {
    console.log("Form is not valid");
  }
}

const submitAddVehicleLocation = async() => {
  const { valid } = await refLocationForm.value?.validate();

if (valid) {
  await addVehicleLocation();
  getLocations();

} else {
  console.log("Form is not valid");
}
}

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
      vehicleGroupId: group.value ?? 1,
      homeLocationId: location.value
      
    };



    // Send the API request
    const response = await api.post(`${API_URL}/vehicles`, [vehicleData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


    Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Vehicle added successfully.`,
     });

     isAddVehicleDrawer.value = false;
     vin.value = '';
     licensePlate.value = '';
     mileage.value = '';
     purchaseDate.value = '';
     type.value = '';
     model.value = '';
     group.value = '';
     location.value = '';


    console.log('Vehicle saved successfully:', response.data);
  } catch (error) {
    console.error('Error saving vehicle:', error.response?.data || error.message);
  }
};


const addVehicleType = async () => {

  try {
  
    let typeData = {
      name: typeName.value,
      ...(typeDescription.value ? { description: typeDescription.value } : {})
    };


  const response = await api.post(`${API_URL}/types`, [typeData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Type added successfully.`,
    });


    
    
    isAddTypeModal.value = false;
    typeName.value = '';
    typeDescription.value = '';

  } catch (error) {
    console.error('Error saving type:', error.response?.data || error.message);

  }


}

const addVehicleModel = async () => {

  try {

    let formattedYear = null;
    if (purchaseDate.value) {
      formattedYear = new Date(modelYear.value).toISOString();
    }


    let modelData = {
      name: modelName.value,
      make: modelMake.value,
      engineType: modelEngineType.value,
      fuelType: modelFuelType.value,
      ...(formattedYear && { year: formattedYear }),
      ...(modelTransmission.value && { transmission: modelTransmission.value }),
      ...(modelMaxPayloadWeight.value && { maxPayloadWeight: modelMaxPayloadWeight.value }),
      ...(modelMaxVolume.value && { maxVolume: modelMaxVolume.value }),
    };

  
  const response = await api.post(`${API_URL}/models`, [modelData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Model added successfully.`,
    });

    isAddModelModal.value = false;

    modelName.value  = ''
    modelMake.value  = ''
    modelEngineType.value = ''
    modelFuelType.value  = ''
    modelYear.value  = ''
    modelTransmission.value  = ''
    modelMaxPayloadWeight.value  = ''
    modelMaxVolume.value  = ''

  } catch (error) {
    console.error('Error saving model:', error.response?.data || error.message);

  }


}

const addVehicleGroup = async () => {

  try {
    let groupData = {
    name: groupName.value,
    ...(groupDescription.value ? { description: groupDescription.value } : {})

   };
  
  const response = await api.post(`${API_URL}/groups`, [groupData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Group added successfully.`,
    });

    
    isAddGroupModal.value = false
    groupName.value = '';
    groupDescription.value = '';

  } catch (error) {
    console.error('Error saving group:', error.response?.data || error.message);

  }
  

}

const addVehicleLocation = async() => {
  try {
    let locationData = {
    name: locationName.value,
    latitude: locationLat.value,
    longitude: locationLong.value

   };


   if (locationLat.value == 0 && locationLong.value == 0) {
    console.log("Form is not valid");
    return;
   }
  
  const response = await api.post(`${API_URL}/homelocations`, [locationData], {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });


  Swal.fire({
      icon: "success",
      title: "Success!",
      text: `Location added successfully.`,
    });

    
    isAddLocationModal.value = false
    locationName.value = '';
    locationLat.value = 0;
    locationLong.value = 0;

  } catch (error) {
    console.error('Error saving location:', error.response?.data || error.message);

  }
}

const getVehicles = async () => {
  try {
    const response = await api.get(`${API_URL}/vehicles?page=${page.value - 1}&pageSize=${itemsPerPage.value}`, {
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

const getModels = async () => {
  try {
    const response = await api.get(`${API_URL}/models?page=${pageModel.value - 1}&pageSize=${itemsPerPageModel.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    models.value = response.data.content
    totalModels.value = response.data.totalElements || 0;

    return response.data.content
  } catch (error) {
    console.error("Error fetching models:", error.response?.data || error.message);


  }



  
}
const getTypes = async () => {
  try {
    const response = await api.get(`${API_URL}/types?page=${pageType.value - 1}&pageSize=${itemsPerPageType.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    types.value = response.data.content
    totalTypes.value = response.data.totalElements || 0;
    return response.data.content
  } catch (error) {
    console.error("Error fetching types:", error.response?.data || error.message);
  }
}

const getGroups= async () => {
  try {
    const response = await api.get(`${API_URL}/groups?page=${pageGroup.value - 1}&pageSize=${itemsPerPageGroup.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    groups.value = response.data.content
    totalGroups.value = response.data.totalElements || 0;

    return response.data.content
  } catch (error) {
    console.error("Error fetching groups:", error.response?.data || error.message);
  }
}


const getAddress = async (lat:number, lon:number) => {
  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}`);
    const data = await response.json();
    return data.features[0]?.place_name || "";
  } catch (err) {
    console.error("Error reverse geocoding:", err);
    return "Error fetching address";
  }
};

const getLocations = async() => {
  try {
    const response = await api.get(`${API_URL}/homelocations?page=${pageLocation.value - 1}&pageSize=${itemsPerPageLocation.value}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    let locationsData = response.data.content;

    // Add address field to each location using reverse geocoding
    const withAddresses = await Promise.all(locationsData.map(async (loc) => {
      const address = await getAddress(loc.latitude, loc.longitude);
      return { ...loc, address };
    }));

    locations.value = withAddresses;
    totalLocations.value = response.data.totalElements || 0;

    return withAddresses;
    



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
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`${API_URL}/models/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Model deleted successfully.`,
      });

    getModels();


    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the model. Please try again.",
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
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`${API_URL}/types/${id}`, {
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
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the type. Please try again.",

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

  });

  if(result.isConfirmed) {
      try {
      await api.delete(`${API_URL}/groups/${id}`, {
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
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the group. Please try again.",

      });
    }
  }
}

const deleteLocation = async(id: number) => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this location?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",

  });

  if(result.isConfirmed) {
      try {
      await api.delete(`${API_URL}/homelocations/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Location deleted successfully.`,
      });

    getLocations();


    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the location. Please try again.",

      });
    }
  }

}

const getVehicle = async (id: number) => {
  try {
    const response = await api.get(`${API_URL}/vehicles/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    vehicle.value = response.data[0]
    return vehicle.value;    



  } catch (error) {
    console.error("Error fetching vehicle:", error.response?.data || error.message);


  }

}

const getModel = async(id: number) => {
  try {
    const response = await api.get(`${API_URL}/models/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    Model.value = response.data[0]
    return Model.value;    



  } catch (error) {
    console.error("Error fetching model:", error.response?.data || error.message);


  }
}
const getType = async(id: number) => {
  try {
    const response = await api.get(`${API_URL}/types/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    Type.value = response.data[0]

    return Type.value;    

  } catch (error) {
    console.error("Error fetching type:", error.response?.data || error.message);


  }
}
const getGroup = async(id: number) => {
  try {
    const response = await api.get(`${API_URL}/groups/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    Group.value = response.data[0]

    return Group.value;    



  } catch (error) {
    console.error("Error fetching group:", error.response?.data || error.message);


  }
}

const getLocation = async (id: number) => {
  try {
    const response = await api.get(`${API_URL}/homelocations/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    Location.value = response.data[0]

    return Location.value;    

  } catch (error) {
    console.error("Error fetching group:", error.response?.data || error.message);
  }
}


const deleteVehicle = async (id: number) => {


    
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this vehicle?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if(result.isConfirmed) {
      try {
      await api.delete(`${API_URL}/vehicles/${id}`, {
        headers: {
          'Accept': '*/*',
        }
      });


      Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Vehicle deleted successfully.`,

      });

    getVehicles();


    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);

      Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete the vehicle. Please try again.",

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

const updateOptionsTypes = (options: any) => {
  pageType.value = options.page
  sortByType.value = options.sortBy[0]?.key
  orderByType.value = options.sortBy[0]?.order
  getTypes()
}

const updateOptionsModels = (options: any) => {
  pageModel.value = options.page
  sortByModel.value = options.sortBy[0]?.key
  orderByModel.value = options.sortBy[0]?.order
  getModels()
}

const updateOptionsGroups = (options: any) => {
  pageGroup.value = options.page
  sortByGroup.value = options.sortBy[0]?.key
  orderByGroup.value = options.sortBy[0]?.order
  getGroups()
}

const updateOptionsLocations = (options: any) => {
  pageLocation.value = options.page
  sortByLocation.value = options.sortBy[0]?.key
  orderByLocation.value = options.sortBy[0]?.order
  getLocations()
}


const openVehicleDrawer = async (id: number) => {
  console.log('Fetching vehicle:', id)
  await getVehicle(id)

  populateVehicleTMG();

  console.log(vehicle.value)

  licensePlateUpdate.value = vehicle.value.licensePlate
  vinUpdate.value = vehicle.value.vin
  mileageUpdate.value = vehicle.value.mileage
  purchaseDateUpdate.value = vehicle.value.purchaseDate
  typeUpdate.value = vehicle.value.vehicleType.id
  modelUpdate.value = vehicle.value.model.id
  groupUpdate.value = vehicle.value.vhicleGroup.id
  locationUpdate.value = vehicle.value.homeLocation?.id ?? null
  isVehicleDialogDrawer.value = true
}

const updateVehicle = async () => {

  let vehicleData = {};


  
let formattedPurchaseDate = new Date(purchaseDateUpdate.value).toISOString().slice(0, -5) + "Z";

  
if (purchaseDateUpdate.value !== vehicle.value.purchaseDate) {
  vehicleData.purchaseDate = formattedPurchaseDate;
}

// Only include changed values
if (licensePlateUpdate.value !== vehicle.value.licensePlate) {
  vehicleData.licensePlate = licensePlateUpdate.value;
}

if (vinUpdate.value !== vehicle.value.vin) {
  vehicleData.vin = vinUpdate.value;
}

if (mileageUpdate.value !== vehicle.value.mileage) {
  vehicleData.mileage = mileageUpdate.value;
}

if (typeUpdate.value !== vehicle.value.vehicleType.id) {
  vehicleData.vehicleTypeId = typeUpdate.value;
}
if (modelUpdate.value !== vehicle.value.model.id) {
  vehicleData.modelId = modelUpdate.value;
}
if (groupUpdate.value !== vehicle.value.vhicleGroup.id) {
  vehicleData.vehicleGroupId = groupUpdate.value ?? 1;
}

if (locationUpdate.value !== (vehicle.value.homeLocation?.id ?? null)) {
  vehicleData.homeLocationId = locationUpdate.value;
}


// If no values have changed, exit the function 
if (Object.keys(vehicleData).length === 0) {
  isVehicleDialogDrawer.value = false;

  return;
}


try {
  const response = await api.put(
    `${API_URL}/vehicles/${vehicle.value.id}`,
    vehicleData,
    {
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
      },
    }
  );



  Swal.fire({
    icon: "success",
    title: "Success!",
    text: "Vehicle updated successfully.",
  });

  isVehicleDialogDrawer.value = false;
} catch (error) {
  console.error("Error updating type:", error.response?.data || error.message);
}



}

const submitUpdateVehicle = async() => {
  const { valid } = await refUpdateForm.value?.validate();
  if (valid) {
    await updateVehicle();
    getVehicles();
    
  } else {
    console.log("Form is not valid");
  }
}

const openAddVehicleDrawer = async () => {

  populateVehicleTMG();
  isAddVehicleDrawer.value = true 

}

const openTypeModal = async (id: number) => {
  console.log('Fetching type:', id)
  await getType(id)
  typeNameUpdate.value = Type.value.name
  typeDescriptionUpdate.value = Type.value.description
  isEditTypeModal.value = true


  
  
}

const updateType = async () => {
  let typeData = {};

  // Only include changed values
  if (typeNameUpdate.value !== Type.value.name) {
    typeData.name = typeNameUpdate.value;
  }

  if (typeDescriptionUpdate.value !== Type.value.description) {
    typeData.description = typeDescriptionUpdate.value;
  }

  // If no values have changed, exit the function
  if (Object.keys(typeData).length === 0) {
    isEditTypeModal.value = false;
    return;
  }

  try {
    const response = await api.put(
      `${API_URL}/types/${Type.value.id}`,
      typeData,
      {
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Type updated successfully.",
    });

    isEditTypeModal.value = false;
  } catch (error) {
    console.error("Error updating type:", error.response?.data || error.message);
  }
};

const submitUpdateType = async() => {

  const { valid } = await refTypeUpdateForm.value?.validate();
  if (valid) {
    await updateType();
    getTypes();
    
  } else {
    console.log("Form is not valid");
  }
}
  

const openModelModal = async (id: number) => {
  console.log('Fetching model id:', id)
  await getModel(id);
  

  modelNameUpdate.value = Model.value.name
  modelMakeUpdate.value = Model.value.make
  modelYearUpdate.value = Model.value.year
  modelEngineTypeUpdate.value = Model.value.engineType
  modelFuelTypeUpdate.value = Model.value.fuelType
  modelTransmissionUpdate.value = Model.value.transmission
  modelMaxPayloadWeightUpdate.value = Model.value.maxPayloadWeight
  modelMaxVolumeUpdate.value = Model.value.maxVolume
  isEditModelModal.value = true


}

const updateModel = async () => {

  console.log(modelYearUpdate.value)

  let ModelData = {};

  if (modelNameUpdate.value !== Model.value.name) {
    ModelData.name = modelNameUpdate.value;
  }

  if (modelMakeUpdate.value !== Model.value.make) {
    ModelData.make = modelMakeUpdate.value;
  }

  if (modelEngineTypeUpdate.value !== Model.value.engineType) {
    ModelData.engineType = modelEngineTypeUpdate.value;
  }

  if (modelFuelTypeUpdate.value !== Model.value.fuelType) {
    ModelData.fuelType = modelFuelTypeUpdate.value;
  }

  if (modelYearUpdate.value !== Model.value.year) {
    ModelData.year = modelYearUpdate.value;
  }

  if (modelMaxVolumeUpdate.value !== Model.value.maxPayloadWeight) {
    ModelData.maxPayloadWeight = modelMaxVolumeUpdate.value;
  }


  if (modelMaxVolumeUpdate.value !== Model.value.maxVolume) {
    ModelData.maxVolume = modelMaxVolumeUpdate.value;
  }



  if (Object.keys(ModelData).length === 0) {
    isEditModelModal.value = false;
    return;
  }

  try {
    const response = await api.put(
      `${API_URL}/models/${Model.value.id}`,
      ModelData,
      {
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Type updated successfully.",
    });

    isEditModelModal.value = false;

  } catch (error) {
    console.error("Error updating type:", error.response?.data || error.message);
  }

}

const submitUpdateModel = async() => {

  const { valid } = await refModelUpdateForm.value?.validate();
  if (valid) {
    await updateModel();
    getModels();
    
  } else {
    console.log("Form is not valid");
  }
}
 
const openGroupModal = async (id: number) => {
  console.log('Fetching group id:', id)
  await getGroup(id)
  groupNameUpdate.value = Group.value.name
  groupDescriptionUpdate.value = Group.value.description
  isEditGroupModal.value = true

}

const updateGroup = async () => {
  let groupData = {};

  if (groupNameUpdate.value !== Group.value.name) {
    groupData.name = groupNameUpdate.value;
  }

  if (groupDescriptionUpdate.value !== Group.value.description) {
    groupData.description = groupDescriptionUpdate.value;
  }

  if (Object.keys(groupData).length === 0) {
    isEditGroupModal.value = false;
    return;
  }


  try {
    const response = await api.put(
      `${API_URL}/groups/${Group.value.id}`,
      groupData,
      {
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Group updated successfully.",
    });

    isEditGroupModal.value = false;
  } catch (error) {
    console.error("Error updating type:", error.response?.data || error.message);
  }
}

const submitUpdateGroup = async() => {

  const { valid } = await refGroupUpdateForm.value?.validate();
  if (valid) {
    await updateGroup();
    getGroups();
    
  } else {
    console.log("Form is not valid");
  }
}

const hideAttributionControl = () => {
  const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib');
  if (attributionControl) {
    attributionControl.style.display = 'none';
  }
};

const openLocationModal = async(id:number) => {
  console.log('Fetching location id:', id)
  await getLocation(id)
  locationNameUpdate.value = Location.value.name
  locationUpdateLat.value = Location.value.latitude
  locationUpdateLong.value = Location.value.longitude
  
  isEditLocationModal.value = true
  nextTick(() => {
    initMapUpdate( locationUpdateLong.value, locationUpdateLat.value);
  });
  
}

const updateLocation = async() => {
  let locationData = {};



  if (locationNameUpdate.value !== Location.value.name) {
    locationData.name = locationNameUpdate.value;
  }
  if (locationUpdateLat.value !== Location.value.latitude) {
    locationData.latitude = locationUpdateLat.value;
  }
  if (locationUpdateLong.value !== Location.value.longitude) {
    locationData.longitude = locationUpdateLong.value;
  }

  if (Object.keys(locationData).length === 0) {
    isEditLocationModal.value = false;
    return;
  }


  try {
    const response = await api.put(
      `${API_URL}/homelocations/${Location.value.id}`,
      locationData,
      {
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Location updated successfully.",
    });

    isEditLocationModal.value = false;
  } catch (error) {
    console.error("Error updating type:", error.response?.data || error.message);
  }
  

}

const submitUpdateLocation = async() => {
  const { valid } = await refLocationUpdateForm.value?.validate();
  if (valid) {
    await updateLocation();
    getLocations();
    
  } else {
    console.log("Form is not valid");
  }
}



let currentMarker: mapboxgl.Marker | null = null; 
let mapInstance: mapboxgl.Map | null = null; 

let mapInstanceUpdate: mapboxgl.Map | null = null;

const initMap = (mapContainer: string) => {
  // Check if the map already exists and remove it before reinitializing
  if (mapInstance) {
    mapInstance.remove(); // Destroy the existing map instance
  }

  mapboxgl.accessToken = mapboxToken;

  mapInstance = new mapboxgl.Map({
    container: mapContainer,
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-6.8498, 33.9716], 
    zoom: 5, 
    renderWorldCopies: false 
  });

  mapInstance.on('load', () => {
    hideAttributionControl();
    mapInstance.resize();
  });


  mapInstance.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false

    }), 'top-right'
  );


  mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-left');
  mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-left');




  mapInstance.on("style.load", function () {
    function applyWorldviewFilters() {
        const WORLD_VIEW = "MA";
        var adminLayers = ["admin-0-boundary", "admin-1-boundary", "admin-0-boundary-disputed", "admin-1-boundary-bg", "admin-0-boundary-bg", "country-label"];
        adminLayers.forEach((adminLayer) => {
            if (mapInstance.getLayer(adminLayer)) {
                mapInstance.setFilter(adminLayer, ["match", ["get", "worldview"], ["all", WORLD_VIEW], true, false]);
            }
        });
    }

    applyWorldviewFilters();
  });


  // Add click event to get lat/lng and place a marker
  mapInstance.on('click', (event) => {

    const coordinates = event.lngLat;
      locationLong.value = coordinates.lng;
      locationLat.value = coordinates.lat;

    // If a marker already exists, remove it
    if (currentMarker) {
      currentMarker.remove();
    }

    // Create a new marker and set its position at the clicked coordinates
    currentMarker = new mapboxgl.Marker({
        color: "#ff001f",  // Optional: make it more visible
        draggable: false   // Optional: prevent accidental movement
      })
      .setLngLat(coordinates)
      .addTo(mapInstance);
  });
};

const initMapUpdate = (lat: number, long: number) => {

    if (mapInstanceUpdate) {
    mapInstanceUpdate.remove(); 
  }

  mapboxgl.accessToken = 'pk.eyJ1Ijoic2FhZG92c2t5IiwiYSI6ImNsZ3VxeDJ0bTBvMDYzZm81cWd2YWpkNTEifQ.rT0oeL7LOwbvkPYCFSVFWQ';

  mapInstanceUpdate = new mapboxgl.Map({
    container: 'mapContainerUpdate',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [lat, long], 
    zoom: 5, 
    renderWorldCopies: false 
  });

  mapInstanceUpdate.on('load', () => {
    hideAttributionControl();
    mapInstanceUpdate.resize();


    currentMarker = new mapboxgl.Marker({
            color: "#ff001f",  // Optional: make it more visible
            draggable: true    // Make the marker draggable
        })
        .setLngLat([lat, long])  // Set the initial position using the provided lat/lon
        .addTo(mapInstanceUpdate);


        mapInstanceUpdate.flyTo({
            center: [lat, long],   // Center the map at the marker
            zoom: 12,              // Set the zoom level (you can change this value)
            essential: true        // Ensures the animation is performed
        });

  });



  mapInstanceUpdate.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false

    }), 'top-right'
  );



  mapInstanceUpdate.addControl(new mapboxgl.FullscreenControl(), 'top-left');
  mapInstanceUpdate.addControl(new mapboxgl.NavigationControl(), 'top-left');



  mapInstanceUpdate.on("style.load", function () {
    function applyWorldviewFilters() {
        const WORLD_VIEW = "MA";
        var adminLayers = ["admin-0-boundary", "admin-1-boundary", "admin-0-boundary-disputed", "admin-1-boundary-bg", "admin-0-boundary-bg", "country-label"];
        adminLayers.forEach((adminLayer) => {
            if (mapInstanceUpdate.getLayer(adminLayer)) {
                mapInstanceUpdate.setFilter(adminLayer, ["match", ["get", "worldview"], ["all", WORLD_VIEW], true, false]);
            }
        });
    }

    applyWorldviewFilters();
  });





  // Add click event to get lat/lng and place a marker
  mapInstanceUpdate.on('click', (event) => {

    const coordinates = event.lngLat;
    locationUpdateLong.value = coordinates.lng;
    locationUpdateLat.value = coordinates.lat;

    console.log('Clicked coordinates:', coordinates.lng, coordinates.lat);

    // If a marker already exists, remove it
    if (currentMarker) {
      currentMarker.remove();
    }

    // Create a new marker and set its position at the clicked coordinates
    currentMarker = new mapboxgl.Marker({
        color: "#ff001f",  // Optional: make it more visible
        draggable: false   // Optional: prevent accidental movement
      })
      .setLngLat(coordinates)
      .addTo(mapInstanceUpdate);
  });
}


const openAddLocaitonModal = () => {
  isAddLocationModal.value = true;

  nextTick(() => {
    initMap('mapContainer');

  });
};

onMounted(() => {
  getVehicles();
  getTypes();
  getModels();
  getGroups();
  getLocations();

})

 
</script>


<template>

       <!-- 👉 Edit type-->

        <VDialog persistent v-model="isEditTypeModal"
        max-width="600"
        >

        <DialogCloseBtn @click="isEditTypeModal = !isEditTypeModal" />

          <!-- Dialog Content -->
          <VCard title="Update Type">
            <VCardText>
              <VForm ref="refTypeUpdateForm" v-model="isUpdateGroupFormValid">
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="typeNameUpdate"
                      label="Name"
                      placeholder="Name"
                      :rules = "[requiredValidator, nameValidator]"
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextarea
                     v-model="typeDescriptionUpdate"
                      label="Description"
                      auto-grow
                      clearable
                      clear-icon="tabler-circle-x"
                      counter
                      :rules = "[descriptionValidator]"
                      />
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isEditTypeModal = false"
              >
                Close
              </VBtn>
              <VBtn @click="submitUpdateType">
                Update
              </VBtn>
            </VCardText>
          </VCard>
        
        </VDialog>


        <!-- 👉 Edit Group-->

        <VDialog persistent v-model="isEditGroupModal"
        max-width="600"
        >

        <DialogCloseBtn @click="isEditGroupModal = !isEditGroupModal" />

          <!-- Dialog Content -->
          <VCard title="Update Group">
            <VCardText>
              <VForm ref="refGroupUpdateForm" v-model="isUpdateTypeFormValid">
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="groupNameUpdate"
                      label="Name"
                      placeholder="Name"
                      :rules = "[requiredValidator, nameValidator]"
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextarea
                     v-model="groupDescriptionUpdate"
                      label="Description"
                      auto-grow
                      clearable
                      clear-icon="tabler-circle-x"
                      counter
                      :rules = "[descriptionValidator]"
                      />
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isEditGroupModal = false"
              >
                Close
              </VBtn>
              <VBtn @click="submitUpdateGroup">
                Update
              </VBtn>
            </VCardText>
          </VCard>
        
        </VDialog>


        <!-- 👉 Edit Model-->

        <VDialog persistent  v-model="isEditModelModal"
        max-width="600"
        >

        <DialogCloseBtn @click="isEditModelModal = !isEditModelModal" />

            <!-- Dialog Content -->
            <VCard title="Update Model">
              <VCardText>
                <VForm ref="refModelUpdateForm" v-model="isUpdateModelFormValid">
                  <VRow>
                    <VCol
                      cols="12"
                      sm="6"
                    >
                      <AppTextField
                        v-model="modelNameUpdate"
                        label="Name"
                        placeholder="Blackwood"
                        :rules = "[requiredValidator]"

                      />
                    </VCol>
                    <VCol
                      cols="12"
                      sm="6"
                    >
                      <AppTextField
                        v-model="modelMakeUpdate"
                        label="Make"
                        placeholder="Lincoln"
                        :rules = "[requiredValidator]"

                      />
                    </VCol>
                    <VCol
                      cols="12"
                      sm="6"
                      md="4"
                    >


                      <AppSelect
                      v-model="modelEngineTypeUpdate"
                      label="Engine Type"
                      placeholder="HYBRID"
                      :rules="[requiredValidator]"
                      :items="EngineTypes"
                      />

                    
                    </VCol>
                    <VCol
                      cols="12"
                      sm="6"
                      md="4"
                    >


                    <AppSelect
                      v-model="modelFuelTypeUpdate"
                      label="Fuel Type"
                      placeholder="PETROL"
                      :rules = "[requiredValidator]"
                      :items = "FuelTypes"
                    
                    />

                    </VCol>
                    <VCol
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <AppTextField
                        v-model="modelTransmissionUpdate"
                        label="Transmission"
                        placeholder="Doe"
                      />
                    </VCol>
                    <VCol cols="12">
                      <AppDateTimePicker
                      v-model="modelYearUpdate"
                      label="Year"
                      placeholder="2025-02-21"
                      :rules = "[]"
                    />
                    </VCol>
                    <VCol
                      cols="12"
                      sm="6"
                    >
                      <AppTextField
                        v-model="modelMaxVolumeUpdate"
                        label="Max volume (m³)"
                        type="number"
                        placeholder="3.2"
                        :rules = "[positiveNumberValidator, numberValidator]"

                  
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      sm="6"
                    >
                      <AppTextField
                        v-model="modelMaxPayloadWeightUpdate"
                        label="Max payload weight (Kg)"
                        type="number"
                        placeholder="712"
                        :rules = "[positiveNumberValidator, numberValidator]"

                      />
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>

              <VCardText class="d-flex justify-end flex-wrap gap-3">
                <VBtn
                  variant="tonal"
                  color="secondary"
                  @click="isEditModelModal = false"
                >
                  Close
                </VBtn>
                <VBtn @click="submitUpdateModel">
                  Update
                </VBtn>
              </VCardText>
            </VCard>
          
        </VDialog>


        <!-- 👉 Edit location-->

        
        <VDialog persistent  v-model="isEditLocationModal" max-width="800">

        <DialogCloseBtn @click="isEditLocationModal = !isEditLocationModal" />

            <!-- Dialog Content -->
            <VCard title="Update Location">
              <VCardText>
                <VForm ref="refLocationUpdateForm" v-model="isUpdateLocationFormValid">
                  <VRow>
                    <!-- Name input -->
                    <VCol cols="12" md="12">
                      <AppTextField
                        v-model="locationNameUpdate"
                        label="Name"
                        placeholder="Name"
                        :rules="[requiredValidator]"
                      />
                    </VCol>

                    <VCol cols="12">
                      <div id="" class="map-container">
                        <div id="mapContainerUpdate" style="height: 500px; width: 100%; border-radius: 8px;"></div>
                      </div>

                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>

              <VCardText class="d-flex justify-end flex-wrap gap-3">
                <VBtn variant="tonal" color="secondary" @click="isEditLocationModal = false">
                  Close
                </VBtn>
                <VBtn @click="submitUpdateLocation">
                  Update
                </VBtn>
              </VCardText>
            </VCard>
          
        </VDialog>


          <!-- 👉 Add new location -->
          <VDialog persistent v-model="isAddLocationModal" max-width="800">
            <DialogCloseBtn @click="isAddLocationModal = !isAddLocationModal" />

            <!-- Dialog Content -->
            <VCard title="Add Location">
              <VCardText>
                <VForm ref="refLocationForm" v-model="isAddLocationFormValid">
                  <VRow>
                    <!-- Name input -->
                    <VCol cols="12" md="12">
                      <AppTextField
                        v-model="locationName"
                        label="Name"
                        placeholder="Name"
                        :rules="[requiredValidator]"
                      />
                    </VCol>

                    <VCol cols="12">
                      <div id="" class="map-container">
                        <div id="mapContainer" style="height: 500px; width: 100%; border-radius: 8px;"></div>
                      </div>

                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>

              <VCardText class="d-flex justify-end flex-wrap gap-3">
                <VBtn variant="tonal" color="secondary" @click="isAddLocationModal = false">
                  Close
                </VBtn>
                <VBtn @click="submitAddVehicleLocation">
                  Submit
                </VBtn>
              </VCardText>
            </VCard>
          </VDialog>




      <!-- 👉 Add new type-->

      <VDialog persistent v-model="isAddTypeModal"
      max-width="600"
      >

      <DialogCloseBtn @click="isAddTypeModal = !isAddTypeModal" />

          <!-- Dialog Content -->
          <VCard title="Add Type">
            <VCardText>
              <VForm ref="refTypeForm" v-model="isAddTypeFormValid">
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="typeName"
                      label="Name"
                      placeholder="Name"
                      :rules = "[requiredValidator, nameValidator]"
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
                      :rules = "[descriptionValidator]"
                      />
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isAddTypeModal = false"
              >
                Close
              </VBtn>
              <VBtn @click="submitAddVehicleType">
                Submit
              </VBtn>
            </VCardText>
          </VCard>
        
      </VDialog>

      <!-- 👉 Add new model-->

      <VDialog persistent  v-model="isAddModelModal"
      max-width="600"
      >

      <DialogCloseBtn @click="isAddModelModal = !isAddModelModal" />

          <!-- Dialog Content -->
          <VCard title="Add Model">
            <VCardText>
              <VForm ref="refModelForm" v-model="isAddModelFormValid">
                <VRow>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <AppTextField
                      v-model="modelName"
                      label="Name"
                      placeholder="Blackwood"
                      :rules = "[requiredValidator]"

                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <AppTextField
                      v-model="modelMake"
                      label="Make"
                      placeholder="Lincoln"
                      :rules = "[requiredValidator]"

                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >

                    <AppSelect
                      v-model="modelEngineType"
                      label="Engine Type"
                      placeholder="HYBRID"
                      :rules = "[requiredValidator]"
                      :items = "EngineTypes"
                    />

                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >

                    <AppSelect
                      v-model="modelFuelType"
                      label="Fuel Type"
                      placeholder="PETROL"
                      :rules = "[requiredValidator]"
                      :items = "FuelTypes"

                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <AppTextField
                      v-model="modelTransmission"
                      label="Transmission"
                      placeholder="Doe"
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppDateTimePicker
                    v-model="modelYear"
                    label="Year"
                    placeholder="2025-02-21"
                    :rules = "[dateValidator]"
                  />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <AppTextField
                      v-model="modelMaxVolume"
                      label="Max volume (m³)"
                      type="number"
                      placeholder="3.2"
                      :rules = "[positiveNumberValidator, numberValidator]"

                
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    sm="6"
                  >
                    <AppTextField
                      v-model="modelMaxPayloadWeight"
                      label="Max payload weight (Kg)"
                      type="number"
                      placeholder="712"
                      :rules = "[positiveNumberValidator, numberValidator]"

                    />
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isAddModelModal = false"
              >
                Close
              </VBtn>
              <VBtn @click="submitAddVehicleModel">
                Submit
              </VBtn>
            </VCardText>
          </VCard>
        
      </VDialog>

      <!-- 👉 Add new group-->

      <VDialog persistent v-model="isAddGroupModal"
      max-width="600"
      >

      <DialogCloseBtn @click="isAddGroupModal = !isAddGroupModal" />

          <!-- Dialog Content -->
          <VCard title="Add Group">
            <VCardText>
              <VForm ref="refGroupForm" v-model="isAddGroupFormValid" >
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="groupName"
                      label="Name"
                      placeholder="Name"
                      :rules = "[requiredValidator, nameValidator]"
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
                      :rules = "[descriptionValidator]"
                      />
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isAddGroupModal = false"
              >
                Close
              </VBtn>
              <VBtn @click="submitAddVehicleGroup">
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
                    :rules = "[dateValidator]"
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
                    :items="vehicleGroups"
                  />
                </VCol>


              <!-- 👉 Home location -->
                <VCol cols="12">
                  <AppSelect
                    v-model="location"
                    label="Select Location"
                    placeholder="Select Location"
                    :items="vehicleLocations"
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
              ref="refUpdateForm"
              v-model="isFormUpdateValid"
            >

            <VRow>
                <!-- 👉 VIN -->
                <VCol cols="12">
                  <AppTextField
                    v-model="vinUpdate"
                    :rules="[requiredValidator]"
                    label="VIN"
                    placeholder="SAJWJ1CD4F8597404"
                  />
                </VCol>

                <!-- 👉 License Plate -->
                <VCol cols="12">
                  <AppTextField
                    v-model="licensePlateUpdate"
                    :rules="[requiredValidator]"
                    label="License Plate"
                    placeholder="81-063-5933"
                  />
                </VCol>

                <!-- 👉 Mileage -->
                <VCol cols="12">
                  <AppTextField
                    v-model="mileageUpdate"
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
                    v-model="purchaseDateUpdate"
                    label="Purchase Date"
                    placeholder="2025-02-22"
                  />
                </VCol>

                <!-- 👉 Type -->
                <VCol cols="12">
                  <AppSelect
                    v-model="typeUpdate"
                    label="Select Type"
                    placeholder="Select Type"
                    :rules="[requiredValidator]"
                    :items="vehicleTypes"
                  />
                </VCol>


                <!-- 👉 Model -->
                <VCol cols="12">
                  <AppSelect
                    v-model="modelUpdate"
                    label="Select Model"
                    placeholder="Select Model"
                    :rules="[requiredValidator]"
                    :items="vehicleModels"
                  />
                </VCol>

                <!-- 👉 Group -->
                <VCol cols="12">
                  <AppSelect
                    v-model="groupUpdate"
                    label="Select Group"
                    placeholder="Select Group"
                    :items="vehicleGroups"
                  />
                </VCol>

                <!-- 👉 Home Location -->
                <VCol cols="12">
                  <AppSelect
                    v-model="locationUpdate"
                    label="Select Location"
                    placeholder="Select Location"
                    :items="vehicleLocations"
                  />
                </VCol>


                



                <!-- 👉 Submit and Cancel -->
                <VCol cols="12">
                  <VBtn
                    class="me-3"
                    @click = "submitUpdateVehicle"
                  >
                    Update
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



    <!-- 👉 Tabs headers-->

    <VCard class="pa-4">
      <div class="custom-tabs">
        <VTabs
          v-model="currentTab"
          class="v-tabs-pill"
          border
        >
        <VTab> <VIcon start icon="tabler-car"/> Vehicles</VTab>
        <VTab> <VIcon start icon="tabler-firetruck"/>Types</VTab>
        <VTab><VIcon start icon="tabler-brand-volkswagen"/>Models</VTab>
        <VTab><VIcon start icon="tabler-sitemap"/>Groups</VTab>
        <VTab><VIcon start icon="tabler-home-link"/>Home-locations</VTab>
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


          <!-- 👉 Home Location -->
          <template #item.location="{ item }">
            <VChip
                :color="item.homeLocation?.name ? 'error' : 'secondary'"
                variant="elevated"
                :label="true"
            >
                {{ item.homeLocation?.name || 'None' }}
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
            @click="isAddTypeModal = true"
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
          <IconBtn @click="openTypeModal(item.id)">
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

      <VWindowItem value="models">
        <VCard>
          <VCardText class="d-flex flex-wrap py-4 gap-4">
          <div class="me-3 d-flex gap-3">
            <AppSelect
              :model-value="itemsPerPageModel"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: 'All' },
              ]"
              style="inline-size: 6.25rem;"
              @update:model-value="itemsPerPageModel = parseInt($event, 10)"
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

          <!-- 👉 Add Model button -->
          <VBtn
            prepend-icon="tabler-category-plus"
            @click="isAddModelModal = true"
          >
          Add Model
        </VBtn>

        </VCardText>
        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPageModel"
          v-model:page="pageModel"
          :items="models"
          :items-length="totalModels"
          :headers="modelHeaders"
          class="text-no-wrap"
          @update:options="updateOptionsModels"
        >
          <!-- 👉 Model -->
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


          <!-- 👉 Engine Type -->
          <template #item.engineType="{ item }">
            <VChip
                color="info"
                variant="elevated"
                :label="true"
              >
                {{ item.engineType }}
              </VChip>
            </template>


          <!-- 👉 Fuel Type -->
          <template #item.fuelType="{ item }">
            <VChip
                color="success"
                variant="elevated"
                :label="true"
              >
                {{ item.fuelType }}
              </VChip>
            </template>

          

          <!-- 👉 Make -->
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
          <IconBtn @click="openModelModal(item.id)">
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
                {{ paginationMeta({ page: pageModel, itemsPerPage: itemsPerPageModel }, totalModels) }}
              </p>

              <VPagination
                v-model="pageModel"
                :length="Math.ceil(totalModels / itemsPerPageModel)"
                :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalModels / itemsPerPageModel)"
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

      <VWindowItem value="locations">
        <VCard>
          <VCardText class="d-flex flex-wrap py-4 gap-4">
          <div class="me-3 d-flex gap-3">
            <AppSelect
              :model-value="itemsPerPageLocation"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: 'All' },
              ]"
              style="inline-size: 6.25rem;"
              @update:model-value="itemsPerPageLocation = parseInt($event, 10)"
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

          <!-- 👉 Add Location button -->
          <VBtn
            prepend-icon="tabler-category-plus"
            @click="openAddLocaitonModal"
          >
          Add Location
        </VBtn>

        </VCardText>

        <VDivider />

        <!-- SECTION datatable -->
        <VDataTableServer
          v-model:items-per-page="itemsPerPageLocation"
          v-model:page="pageLocation"
          :items="locations"
          :items-length="totalLocations"
          :headers="locationHeaders"
          class="text-no-wrap"
          @update:options="updateOptionsLocations"
        >
          <!-- 👉 Location -->
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


          <!-- 👉 Address -->
          <template #item.address="{ item }">
          <div class="d-flex align-center gap-4">

            <span>{{ item.address }}</span>
          </div>
        </template>


          <!-- 👉 latitude -->
          <template #item.lon="{ item }">
            <div class="d-flex align-center gap-4">

              <span>{{ item.latitude }}</span>
            </div>
          </template>


          <!-- 👉 longtitude -->
          <template #item.lat="{ item }">
            <div class="d-flex align-center gap-4">

              <span>{{ item.longitude }}</span>
            </div>
          </template>


          
          <!-- 👉 Actions -->
          <template #item.actions="{ item }">

          <!-- edit user role -->
          <IconBtn @click="openLocationModal(item.id)">
            <VIcon icon="tabler-edit" />
          </IconBtn>

            <!-- delete user  -->
            <IconBtn @click="deleteLocation(item.id)">
              <VIcon icon="tabler-trash" />
            </IconBtn>

          </template>

          <!-- pagination -->
          <template #bottom>
            <VDivider />
            <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
              <p class="text-sm text-disabled mb-0">
                {{ paginationMeta({ page: pageLocation, itemsPerPage: itemsPerPageLocation }, totalLocations) }}
              </p>

              <VPagination
                v-model="pageLocation"
                :length="Math.max(1, Math.ceil(totalLocations / itemsPerPageLocation))"
                :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalLocations / itemsPerPageLocation)"
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
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px;
}



.map-dialog .mapboxgl-canvas {
  width: 100% !important;
  height: 100% !important;
}

.v-dialog--active #mapContainer {
  height: 300px !important;
  width: 100% !important;
  position: relative !important;
  overflow: hidden !important;
}

.v-dialog--active #mapContainerUpdate {
  height: 300px !important;
  width: 100% !important;
  position: relative !important;
  overflow: hidden !important;
}


</style>
