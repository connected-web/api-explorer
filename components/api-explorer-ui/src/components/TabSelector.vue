<template>
  <div class="tab-selector buttons">
    <label v-if="label">{{ label }}</label>
    <slot :tabs="tabs">
      <div
        v-for="tab in tabs"
        :key="`type_${tabId(tab)}`"
        :class="selectedClass(modelValue, tab)"
        @click="$emit('update:modelValue', tab)"
      >
        <icon :icon="tabIcon(tab)" />
        <span>{{ tabLabel(tab) }}</span>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    modelValue: {
      type: null,
      default: false
    },
    tabs: {
      type: Array,
      default: () => {
        return []
      }
    },
    label: {
      type: String,
      default: ''
    }
  },
  methods: {
    selectedClass(actual: any, current: any) {
      if (JSON.stringify(actual) === JSON.stringify(current)) {
        return 'button selected'
      }
      return 'button'
    },
    tabIcon(tab: any) {
      return tab?.icon ?? 'star'
    },
    tabId(tab: any) {
      const entry = Array.isArray(tab) ? tab[1] : null
      return entry ?? tab?.id ?? tab?.key ?? tab?.label ?? tab?.name ?? tab?.value ?? tab
    },
    tabLabel(tab: any) {
      const entry = Array.isArray(tab) ? tab[1] : null
      return entry ?? tab?.label ?? tab?.name ?? tab?.value ?? tab?.name ?? tab
    }
  }
}
</script>


<style scoped>
.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  font-size: 0.8em;
}
.buttons * {
  cursor: pointer;
}
.buttons > label {
  margin: 0.1em 0.5em;
  padding: 0.2em 0.5em;
  background: #eee;
  border-radius: 0.2em;
}
.buttons > span {
  margin: 0.1em 0.5em;
  padding: 0.2em 0.5em;
}

.button {
  padding: 0.3em 0.6em;
  margin-right: 0.2em;
}
</style>