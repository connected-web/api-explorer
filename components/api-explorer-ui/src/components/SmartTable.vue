<template>
  <div class="smart-table column p5">
    <TabSelector v-if="value" :tabs="modes" v-model="mode" />
    <pre v-if="mode.label === 'json'"><code>{{ value }}</code></pre>
    <Tabulation v-if="mode.label === 'table'" :items="valueAsArray(value)" />
    <PaginatedItems v-if="mode.label === 'paged'" :items="valueAsArray(value)" :page-size="5">
      <template v-slot="{ paginatedItems }">
        <div v-for="item in paginatedItems" :key="item?.id ?? JSON.stringify(item)" class="paged-item">
          <Tabulation :items="valueAsArray(item)" />
        </div>
      </template>
    </PaginatedItems>
    <PaginatedItems v-if="mode.label === 'paged json'" :items="valueAsArray(value)" :page-size="5">
      <template v-slot="{ paginatedItems }">
        <div v-for="item in paginatedItems" :key="item?.id ?? JSON.stringify(item)" class="paged-item">
          <pre><code>{{ item }}</code></pre>
        </div>
      </template>
    </PaginatedItems>
  </div>
</template>

<script>

import TabSelector from './TabSelector.vue'
import Tabulation from './Tabulation.vue'
import PaginatedItems from './PaginatedItems.vue'

import tabulate from './Tabulate'

const modes = [
  { label: 'table', icon: 'table' },
  { label: 'json', icon: 'code' },
  { label: 'paged', icon: 'list-alt' },
  { label: 'paged json', icon: 'file-code' }
]

export default {
  components: { TabSelector, Tabulation, PaginatedItems },
  props: {
    value: {
      type: null,
      default: null
    }
  },
  data() {
    return {
      mode: modes[0],
      modes
    }
  },
  methods: {
    tabulate,
    valueAsArray(value) {
      if (Array.isArray(value)) {
        return value
      }
      if (Object.keys(value).length === 1) {
        // dig a little deeper
        const onlyKey = Object.keys(value)[0]
        return this.valueAsArray(value[onlyKey])
      }
      return [value]
    }
  }
}
</script>

<style scoped>
.smart-table {
  width: 100%;
  overflow-x: auto;
}
.paged-item {
  margin: 0.5em 0;
}
</style>