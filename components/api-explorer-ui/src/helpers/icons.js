import Icon from '../components/Icon.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default function setupIcons (app) {
  library.add(fas)
  app.component('FontAwesomeIcon', FontAwesomeIcon)
  app.component('Icon', Icon)
}
