<script setup lang="ts">
import { keycloak, removeTokens } from '@/services/keycloak'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'



const router = useRouter()

const user = ref<any>(null)

// Function to fetch user data (simulating a backend call)
const fetchUserData = async () => {
  // Simulate API call to get user data (you can replace this with an actual API call)
  // Example: user.value = await fetchUserDataFromAPI()

  // Hardcoded data for example purposes
  user.value = {
    fullName: 'John Doe',
    username: 'johndoe',
    role: 'Admin',
    avatar: 'https://example.com/avatar.jpg',
  }
}

// Fetch user data when component is mounted
fetchUserData()


const logout = async () => {

  logoutFromKeycloak()
  // Remove "accessToken" from cookie
  // useCookie('accessToken').value = null

  // Redirect to login page
  await router.push('/login')


}

const logoutFromKeycloak = async () => {
  try {
    removeTokens();
    await keycloak.logout({
      redirectUri: window.location.origin + '/login',
    });

    console.log("Logged out successfully");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};


const userProfileList = [
  { type: 'divider' },
  // { type: 'navItem', icon: 'tabler-user', title: 'Profile', to: { name: 'apps-user-view-id', params: { id: 21 } } },
  { type: 'navItem', icon: 'tabler-user', title: 'Profile', to: { name: 'pages-account-settings-tab', params: { tab: 'account' } } },
  // { type: 'navItem', icon: 'tabler-settings', title: 'Settings', to: { name: 'pages-account-settings-tab', params: { tab: 'account' } } },
  // { type: 'navItem', icon: 'tabler-credit-card', title: 'Billing', to: { name: 'pages-account-settings-tab', params: { tab: 'billing-plans' } }, badgeProps: { color: 'error', content: '3' } },
  { type: 'divider' },
  // { type: 'navItem', icon: 'tabler-currency-dollar', title: 'Pricing', to: { name: 'pages-pricing' } },
  // { type: 'navItem', icon: 'tabler-help-circle', title: 'FAQ', to: { name: 'pages-faq' } },
  // { type: 'divider' },
  { type: 'navItem', icon: 'tabler-logout', title: 'Logout', onClick: logout },
]
</script>

<template>
  <VBadge
    v-if="user"
    dot
    bordered
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      :color="!(user && user.avatar) ? 'primary' : undefined"
      :variant="!(user && user.avatar) ? 'tonal' : undefined"
    >
      <VImg
        v-if="user && user.avatar"
        :src="user.avatar"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="!(user && user.avatar) ? 'primary' : undefined"
                    :variant="!(user && user.avatar) ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="user && user.avatar"
                      :src="user.avatar"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-medium">
              {{ user.fullName || user.username }}
            </VListItemTitle>
            <VListItemSubtitle>{{ user.role }}</VListItemSubtitle>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
                @click="item.onClick && item.onClick()"
              >
                <template #prepend>
                  <VIcon
                    class="me-2"
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template
                  v-if="item.badgeProps"
                  #append
                >
                  <VBadge v-bind="item.badgeProps" />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
