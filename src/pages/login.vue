<!-- ❗Errors in the form are set on line 60 -->
<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import {keycloak} from '@/services/keycloak'



const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const isPasswordVisible = ref(false)

const route = useRoute()
const router = useRouter()


const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})

const refVForm = ref<VForm>()

const credentials = ref({
  email: 'admin@demo.com',
  password: 'admin',
})

const isHidden = ref(true) // Set to `true` to hide, `false` to show



const onSubmit = async () => {
  const result = await refVForm.value?.validate();

  if (result?.valid) {
    await loginWithKeycloakOld();


  }
};



const loginWithKeycloakOld = async () => {
  try {    

    await keycloak.login({
      redirectUri: window.location.origin,
      prompt: 'login',
      scope: 'openid',
    });

    
  } catch (error) {
    console.error('Keycloak login failed:', error);
  }
};



const loginWithIframe = async () => {
  
  try {
    // Generate the login URL manually
    const loginUrl = await keycloak.createLoginUrl({
      redirectUri: window.location.origin, // Ensure it's correctly set in Keycloak
      prompt: 'login', // Forces login prompt
      scope: 'openid',
    });

    // Open login in a new tab or pop-up
    const loginWindow = window.open(loginUrl, '_blank', 'width=500,height=600');

    // Handle case where pop-ups are blocked
    if (!loginWindow) {
      console.error('Failed to open login window. Please allow pop-ups.');
      return;
    }


        // Listen for messages from the popup
        const messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return; // Security check

      if (event.data === 'keycloak-authenticated') {
        console.log('User authenticated! Refreshing token...');

        // Refresh Keycloak session
        await keycloak.updateToken(30); // Refresh token with a 30s buffer
        storeTokens();
        
        // Redirect the user after successful login
        router.replace(route.query.to ? String(route.query.to) : '/');
      }
    };

    window.addEventListener('message', messageListener);




    // await nextTick(() => {
    //   router.replace(route.query.to ? String(route.query.to) : '/')
    // })

    // Poll to check if the login window was closed
    const checkInterval = setInterval(async () => {
      if (loginWindow.closed) {
        clearInterval(checkInterval);
        window.removeEventListener('message', messageListener);
        console.log('Login window closed. Checking authentication...');

      }
    }, 1000);
  } catch (error) {
    console.error('Keycloak login failed:', error);
  }
};



</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <!-- Background Image -->
    <div class="auth-background"></div>

    <VCol
      cols="12"
      lg="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="mb-6"
          />

          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 🚙
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol v-show="!isHidden" cols="12">
                <AppTextField
                  v-model="credentials.email"
                  label="Email"
                  placeholder="johndoe@email.com"
                  type="email"
                  autofocus
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- password -->
              <VCol v-show="!isHidden" cols="12">
                <AppTextField class="mb-4"
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- Login Button -->
              <VCol cols="12">
                <VBtn block type="submit">
                  <VIcon size="30" class="me-1">tabler-user-circle</VIcon>
                  LOGIN
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>


<style scoped>
/* Make the entire page take the background */
.auth-wrapper {
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: flex-end;
  padding-right: 5vw;
  align-items: center;
  overflow: hidden;
}

/* Fullscreen Background Image */


.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; /* Ensure it covers the screen */
  background: url('/images/background.jpg') no-repeat center center;
  background-size: cover;
  z-index: 1
}



/* Center the login card */
.auth-card-v2 {
  position: relative;
  z-index: 2;
}

/* Ensure form elements are readable */
.auth-card-v2 VCard {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 20px;
}
</style>
