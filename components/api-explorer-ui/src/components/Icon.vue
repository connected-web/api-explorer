<template>
  <div class="icon">
     <font-awesome-icon :icon="iconOptions" />
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import '../helpers/icons'

export default {
  props: {
    icon: String
  },
  components: { FontAwesomeIcon },
  computed: {
    iconOptions() {
      const { icon } = this
      if (typeof icon !== 'string') {
        console.error('Supplied icon key is not a string:', { icon }, 'Please stop that.')
        throw new Error(`Supplied icon key is not a string: ${typeof icon}`)
      }
      return ['fas', icon ?? dice]
    }
  }
}
</script>

<style scoped>
.icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 1.5em;
  height: 1.5em;
  text-align: center;
  vertical-align: middle;
  user-select: none;
}
</style>
