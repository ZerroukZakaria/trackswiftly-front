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



//Add Pois refs
const isFormValid = ref(false)
const refForm = ref<VForm>()
const isAddPoiDrawer = ref(false)

const name = ref('')
const group = ref()
const type = ref()
const address = ref('')
const longitude = ref(0)
const latitude = ref(0)
const payloadFields = ref([{ key: '', value: '' }])


//Update Poi refs
const isFormUpdateValid = ref(false)
const refUpdateForm = ref<VForm>()
const isPoiDrawer = ref(false)

const nameUpdate = ref('')
const groupUpdate = ref()
const typeUpdate = ref()
const addressUpdate = ref('')
const longitudeUpdate = ref(0)
const latitudeUpdate = ref(0)
const payloadFieldsUpdate = ref()





//Add Group refs
const isAddGroupFormValid = ref(false)
const refGroupForm = ref<VForm>()
const groupName = ref('')
const groupDescription = ref('')


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


const isEditGroupModal = ref(false);
const isEditTypeModal= ref(false);

const Type = ref();
const Group = ref();



const poiGroups = ref([]);
const poiTypes = ref([]);

const groups = ref([]);
const types = ref([]);
const totalGroups = ref(0);
const totalTypes = ref(0);


const isAddGroupModal = ref(false);
const isAddTypeModal= ref(false);




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

const getPoi = async (id: number) => {
  try {
    const response = await api.get(`${API_URL}/gw-client/pois/${id}`, {
      headers: {
        'Accept': '*/*',
      }
    });

    
    poi.value = response.data[0]
    return poi.value


  } catch (error) {
    console.error("Error fetching POIs:", error.response?.data || error.message);
  }
};


const openPoiDrawer = async(id: number) => {
  console.log('Fetching poi:', id)
  await getPoi(id);

  populatePoiTG();
  console.log(poi.value)

  nameUpdate.value = poi.value.name
  groupUpdate.value = poi.value.group.id
  typeUpdate.value = poi.value.poiTypeResponse.id
  addressUpdate.value = poi.value.address
  longitudeUpdate.value = poi.value.longitude
  latitudeUpdate.value = poi.value.latitude
  payloadFieldsUpdate.value = Object.entries(poi.value.payload || {}).map(([key, value]) => ({ key, value }))
if (payloadFieldsUpdate.value.length === 0) {
  payloadFieldsUpdate.value.push({ key: '', value: '' })
}  isPoiDrawer.value = true 

  nextTick(() => {
    initMapUpdate(longitudeUpdate.value, latitudeUpdate.value);

  });
}



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

  nextTick(() => {
    initMap('mapContainer');

  });
}

const updatePoi = async() => {
  let poiData = {}

  if (nameUpdate.value !== poi.value.name) {
  poiData.name = nameUpdate.value;
  }

  if (groupUpdate.value !== poi.value.group.id) {
  poiData.groupId = groupUpdate.value;
  }

  if (typeUpdate.value !== poi.value.poiTypeResponse.id) {
  poiData.typeId = typeUpdate.value;
  }

  if (longitudeUpdate.value !== poi.value.longitude) {
  poiData.longitude = longitudeUpdate.value;
  }
  if (latitudeUpdate.value !== poi.value.latitude) {
  poiData.latitude = latitudeUpdate.value;
  }

  if (addressUpdate.value !== poi.value.address) {
  poiData.address = addressUpdate.value;
  }

  const updatedPayload = Object.fromEntries(
    payloadFieldsUpdate.value
      .filter(({ key, value }) => key && value !== '') // remove empty ones
      .map(({ key, value }) => [key, value])
  );

  const originalPayload = poi.value.payload || {};
  const isPayloadDifferent = JSON.stringify(updatedPayload) !== JSON.stringify(originalPayload);

  if (isPayloadDifferent) {
    poiData.payload = updatedPayload;
  }

  console.log(poiData)


  if (Object.keys(poiData).length === 0) {
  isPoiDrawer.value = false;
  return;
  }

  try {
  const response = await api.put(
    `${API_URL}/gw-client/pois/${poi.value.id}`,
    poiData,
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
    text: "POI updated successfully.",
  });

  isPoiDrawer.value = false;
} catch (error) {
  console.error("Error updating POI:", error.response?.data || error.message);
}


}

const submitUpdatePoi= async() => {
  const { valid } = await refUpdateForm.value?.validate();
  if (valid) {
    await updatePoi();
    getPois();
    
  } else {
    console.log("Form is not valid");
  }
}

const savePoi = async() => {
  try {

    const payload = {}
    payloadFields.value.forEach(({ key, value }) => {
      if (key && value !== '') {
        payload[key] = value
      }
    })

    if (latitude.value == 0 && longitude.value == 0) {
      console.log("Form is not valid");
      return;    
    }


    address.value = await getAddress(latitude.value, longitude.value)
    
    const poiData = {
      name: name.value,
      groupId: group.value ?? 1,
      typeId: type.value,
      address: address.value,
      longitude: longitude.value,
      latitude: latitude.value,
      ...(Object.keys(payload).length ? { payload } : {}), // ✅ conditionally add payload
    }


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
  name.value = '';
  group.value = '';
  type.value = '';
  address.value = '';
  longitude.value = 0;
  latitude.value = 0;
  payloadFields.value = [{ key: '', value: '' }];

  


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


const addPoiType = async () => {

try {

  let typeData = {
    name: typeName.value,
    ...(typeDescription.value ? { description: typeDescription.value } : {})
  };


const response = await api.post(`${API_URL}/gw-client/types`, [typeData], {
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

const submitAddPoiType = async() => {
  const { valid } = await refTypeForm.value?.validate();

  if (valid) {
    await addPoiType();
    getTypes();

  } else {
    console.log("Form is not valid");
  }
}





const addPoiGroup = async () => {

try {
  let groupData = {
  name: groupName.value,
  ...(groupDescription.value ? { description: groupDescription.value } : {})

 };



const response = await api.post(`${API_URL}/gw-client/groups`, [groupData], {
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

const submitAddPoiGroup = async() => {
  const { valid } = await refGroupForm.value?.validate();

  if (valid) {
    await addPoiGroup();
    getGroups();

  } else {
    console.log("Form is not valid");
  }

}

const getType = async(id: number) => {
  try {
    const response = await api.get(`${API_URL}/gw-client/types/${id}`, {
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
    const response = await api.get(`${API_URL}/gw-client/groups/${id}`, {
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
      `${API_URL}/gw-client/types/${Type.value.id}`,
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
      `${API_URL}/gw-client/groups/${Group.value.id}`,
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

const addPayloadField = () => {
  payloadFields.value.push({ key: '', value: '' })

}

const removePayloadField = (index: number) => {
  if (index > 0) {
    payloadFields.value.splice(index, 1)
  }
}

const addPayloadFieldUpdate = () => {
  payloadFieldsUpdate.value.push({ key: '', value: '' })

}

const removePayloadFieldUpdate = (index: number) => {
  if (index > 0) {
    payloadFieldsUpdate.value.splice(index, 1)
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
      longitude.value = coordinates.lng;
      latitude.value = coordinates.lat;

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
longitudeUpdate.value = coordinates.lng;
latitudeUpdate.value = coordinates.lat;

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

const hideAttributionControl = () => {
  const attributionControl = document.querySelector('.mapboxgl-ctrl-attrib');
  if (attributionControl) {
    attributionControl.style.display = 'none';
  }
};

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


</script>

<template>

    <!-- 👉 Dialogs-->

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
              <VBtn @click="submitAddPoiType">
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
              <VBtn @click="submitAddPoiGroup">
                Submit
              </VBtn>
            </VCardText>
          </VCard>
        
      </VDialog>


     <!-- 👉 Update POI-->

    <VDialog persistent v-model="isPoiDrawer"
      max-width="800"
      >

      <DialogCloseBtn @click="isPoiDrawer = !isPoiDrawer" />

          <!-- Dialog Content -->
          <VCard title="Update POI">
            <VCardText>
              <VForm ref="refUpdateForm" v-model="isFormUpdateValid" >
                <VRow>
                  <VCol cols="12">
                      <div id="" class="map-container">
                        <div id="mapContainerUpdate" style="height: 500px; width: 100%; border-radius: 8px;"></div>
                      </div>

                  </VCol>


                  <VCol cols="12" sm="6" md="4">
                    <AppTextField
                      v-model="nameUpdate"
                      label="Name"
                      placeholder="Name"
                      :rules = "[requiredValidator, nameValidator]"
                    />
                  </VCol>
                  <VCol cols="12" sm="6" md="4">
                    <AppSelect
                      v-model="typeUpdate"
                      label="Type"
                      placeholder="Type"
                      :rules = "[requiredValidator]"
                      :items = "poiTypes"

                    />
                  </VCol>
                  <VCol cols="12" sm="6" md="4">
                    <AppSelect
                      v-model="groupUpdate"
                      label="Group"
                      placeholder="Group"
                      :rules = "[requiredValidator]"
                      :items="poiGroups"
                    />
                  </VCol>


                  <VCol cols="12">
                    <div v-for="(field, index) in payloadFieldsUpdate" :key="index" class="d-flex align-center mb-2 gap-2">
                      <AppTextField
                        v-model="field.key"
                        label="Key"
                        placeholder="Enter key"
                        dense
                      />
                      <AppTextField
                        v-model="field.value"
                        label="Value"
                        placeholder="Enter value"
                        dense
                      />
                    <IconBtn @click="addPayloadFieldUpdate" class="mt-5" > 
                      <VIcon icon="tabler-hexagon-plus" />
                    </IconBtn>
                      <IconBtn  @click="removePayloadFieldUpdate(index)" class="mt-5">
                        <VIcon icon="tabler-hexagon-minus" />
                      </IconBtn>
                    </div>
                  </VCol>

                </VRow>
              </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isPoiDrawer = false"
              >
                Close
              </VBtn>
              <VBtn @click="submitUpdatePoi">
                Update
              </VBtn>
            </VCardText>
          </VCard>
        
      </VDialog>



      <!-- 👉 Add new POI-->

      <VDialog persistent v-model="isAddPoiDrawer"
      max-width="800"
      >

      <DialogCloseBtn @click="isAddPoiDrawer = !isAddPoiDrawer" />

          <!-- Dialog Content -->
          <VCard title="Add POI">
            <VCardText>
              <VForm ref="refForm" v-model="isFormValid" >
                <VRow>
                  <VCol cols="12">
                      <div id="" class="map-container">
                        <div id="mapContainer" style="height: 500px; width: 100%; border-radius: 8px;"></div>
                      </div>

                  </VCol>


                  <VCol cols="12" sm="6" md="4">
                    <AppTextField
                      v-model="name"
                      label="Name"
                      placeholder="Name"
                      :rules = "[requiredValidator, nameValidator]"
                    />
                  </VCol>
                  <VCol cols="12" sm="6" md="4">
                    <AppSelect
                      v-model="type"
                      label="Type"
                      placeholder="Type"
                      :rules = "[requiredValidator]"
                      :items = "poiTypes"

                    />
                  </VCol>
                  <VCol cols="12" sm="6" md="4">
                    <AppSelect
                      v-model="group"
                      label="Group"
                      placeholder="Group"
                      :rules = "[requiredValidator]"
                      :items="poiGroups"
                    />
                  </VCol>


                  <VCol cols="12">
                    <div v-for="(field, index) in payloadFields" :key="index" class="d-flex align-center mb-2 gap-2">
                      <AppTextField
                        v-model="field.key"
                        label="Key"
                        placeholder="Enter key"
                        dense
                      />
                      <AppTextField
                        v-model="field.value"
                        label="Value"
                        placeholder="Enter value"
                        dense
                      />
                    <IconBtn @click="addPayloadField" class="mt-5" > 
                      <VIcon icon="tabler-hexagon-plus" />
                    </IconBtn>
                      <IconBtn  @click="removePayloadField(index)" class="mt-5">
                        <VIcon icon="tabler-hexagon-minus" />
                      </IconBtn>
                    </div>
                  </VCol>

                </VRow>
              </VForm>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="isAddPoiDrawer = false"
              >
                Close
              </VBtn>
              <VBtn @click="onSubmit">
                Submit
              </VBtn>
            </VCardText>
          </VCard>
        
      </VDialog>
  
    <!-- 👉 Tabs headers-->

    <VCard class="pa-4">
      <div class="custom-tabs">
        <VTabs
          v-model="currentTab"
          class="v-tabs-pill"
          border
        >
        <VTab> <VIcon start icon="tabler-map-pin"/>POI</VTab>
        <VTab> <VIcon start icon="tabler-puzzle"/>Types</VTab>
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

          <!-- 👉 Add POI button -->
          <VBtn
            prepend-icon="tabler-category-plus"
            @click="openAddPoiDrawer"
          >
          Add POI
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
          <IconBtn @click="openPoiDrawer(item.id)">
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

          <!-- 👉 Add Group button -->
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

              <span>{{ item.description }}</span>
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

<style scoped>
.custom-tabs {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px;
}

.map-container {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
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

