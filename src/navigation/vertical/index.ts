import userAccess from './user-access'
import charts from './charts'
import dashboard from './dashboard'
import forms from './forms'
import others from './others'
import uiElements from './ui-elements'
import type { VerticalNavItems } from '@layouts/types'
import telematicsCenter from './telematics-center'

export default [...dashboard, ...userAccess, ...telematicsCenter] as VerticalNavItems
// export default [...dashboard, ...appsAndPages, ...uiElements, ...forms, ...charts, ...others] as VerticalNavItems
