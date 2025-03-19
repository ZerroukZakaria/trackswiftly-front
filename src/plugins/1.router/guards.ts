import type { Router } from 'vue-router'
// Remove or update the CASL import if you're not using it with Keycloak
// import { canNavigate } from '@layouts/plugins/casl'

export const setupGuards = (router: Router) => {
  router.beforeEach(async (to, from) => {
    if (to.meta.public)
      return

    const isLoggedIn = !!(localStorage.getItem('access_token'))

    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn) {
        return { name: 'dashboards-crm' }
      } else {
        return undefined
      }
    }

    // Replace the CASL check with a simple authentication check
    if (!isLoggedIn) {
      return {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      }
    }

    // If user is authenticated and accessing the root path, redirect to dashboard
    if (isLoggedIn && to.path === '/') {
      return { name: 'dashboards-crm' }
    }
  })
}
