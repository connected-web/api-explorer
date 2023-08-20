<template>
  <div class="hidden-by-default">
    <b
      v-if="hidden"
      class="show button"
      title="Click to show hidden value"
      @click="hidden = false"
    >
      <span>{{ reason }}</span>
      <Icon icon="eye-low-vision" />
    </b>
    <span v-else style="font-family: monospace; white-space: nowrap;">
      <slot />
    </span>
    <b
      v-if="!hidden"
      class="hide button"
      title="Hide value"
      @click="hidden = true"
    >
      <span style="display: none">Hide value</span>
      <Icon icon="eye" />
    </b>
    <b class="copy button" title="Copy value to clipboard" @click="copy">
      <span style="display: none">{{ copied ? 'Copied' : 'Copy' }} to clipboard</span>
      <Icon :icon="copyIcon" />
    </b>
    <div ref="dataslot" style="display: none;">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    reason: {
      type: String,
      default: 'Hidden value'
    }
  },
  data () {
    return {
      hidden: true,
      copied: false
    }
  },
  computed: {
    copyIcon () {
      return this.copied ? 'clipboard-check' : 'clipboard'
    }
  },
  methods: {
    copy () {
      const value = (this.$refs.dataslot.textContent + '').trim()
      navigator.clipboard.writeText(value)
      this.copied = true
    }
  }
}
</script>

<style scoped>
.hidden-by-default {
  display: flex;
  font-size: 1.0em;
  gap: 2px;
}
.button {
  display: inline-flex;
  border-radius: 0.5em;
  background: #ccc;
  padding: 0 0.3em;
  margin: 2px 0;
  cursor: default;
  transition: background 0.2s linear;
  vertical-align: middle;
}
.button:hover {
  background: #bbb;
}
.button:active {
  background: #999;
}
.show.button .icon, .copy.button .icon, .hide.button .icon {
  margin: 0;
}
</style>