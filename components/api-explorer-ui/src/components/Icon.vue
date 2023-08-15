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
      const icon = this.icon || 'dice'
      return ['fas', icon]
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
