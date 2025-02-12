import userAccess from './user-access'
import dashboard from './dashboard'
import telematicsCenter from './telematics-center'


import type { HorizontalNavItems } from '@layouts/types'

export default [...dashboard, ...userAccess, ...telematicsCenter] as HorizontalNavItems
