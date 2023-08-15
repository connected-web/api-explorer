<template>
  <div class="icon list">
    <div>
      <input v-model="iconFilter" placeholder="Filter icon by name..." />
    </div>
    <p v-for="icon in filteredIcons" :key="icon">
      <icon :icon="icon" />
      <label>{{ icon }}</label>
    </p>
  </div>
</template>

<script>
import icons from './src/icons'

export default {
  data() {
    return {
      iconFilter: 'ice',
      icons: icons()
    }
  },
  computed: {
    filteredIcons() {
      const { iconFilter, icons } = this
      const filter = iconFilter.toLowerCase()
      const result = iconFilter ? icons.filter(icon => icon.includes(filter) || filter.includes(icon)) : icons   
      return result.slice(0, 40)
    }
  }
}
</script>

<style scoped>
input {
  font-size: 1em;
  padding: 0.5em;
}
.icon {
  font-size: 1.2em;
}
</style>

</style