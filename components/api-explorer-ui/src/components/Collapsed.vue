<template>
  <div :class="collapsableClass">
    <div class="title bar" v-on:click="toggle">
      <label class="title"><Icon icon="seedling" />{{ title || 'No title set' }}</label>
      <label class="status">
        <span>{{ collapsed ? 'Show' : 'Hide' }}</span>
        <Icon :icon="collapseIcon" />
      </label>
    </div>
    <div v-if="!collapsed" class="hideable">
      <slot>No hideable content provided</slot>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      collapsed: true
    }
  },
  computed: {
    collapsableClass() {
      const state = this.collapsed ? 'collapsed' : 'expanded'
      return ['collapsable', state].join(' ')
    },
    collapseIcon() {
      return this.collapsed ? 'angle-down' : 'angle-up'
    }
  },
  methods: {
    toggle() {
      this.collapsed = !this.collapsed
    }
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
div.collapsable {
  margin: 1.0em 0;
}
div.title.bar {
  display: flex;
  flex-wrap: wrap;
  margin: 0.2em 0;
  background: #f5f5f5;
  transition: background 0.1s ease-in;
}
div.title.bar:hover {
  background: #f0f0f0;
}
div.collapsable.expanded > div.title.bar {
  background: #a0f090;
} 
div.collapsable.expanded > div.title.bar:hover {
  background: #afff9f;
} 
div.title.bar > label {
  flex: 2 4;
  white-space: nowrap;
  padding: 0.3em 0.3em;
}
label.title {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  text-align: right;
  font-weight: bold;
}
label.status {
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  text-align: right;
  font-weight: bold;
}
div.hideable {
  overflow: hidden;
}
</style>