import userAccess from './user-access'
import dashboard from './dashboard'
import vehicles from './vehicles'


import type { HorizontalNavItems } from '@layouts/types'

export default [...dashboard, ...userAccess, ...vehicles] as HorizontalNavItems
