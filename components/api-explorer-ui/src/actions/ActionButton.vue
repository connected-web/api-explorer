<template>
  <button
    variant="tonal"
    :disabled="action?.loading"
    @click="activateAction"
    class="text-none action-button"
    :title="action.errored ? action.error?.message : action.description"
  >
    <LoadingSpinner v-if="action?.loading && !action?.loadingIcon" />
    <Icon v-else :icon="iconToShow" />
    <label>{{ labelToShow }}</label>
  </button>
</template>

<script lang="ts">

import Action from '../actions/Action'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  components: { LoadingSpinner },
  data() {
    return {
      internalAction: Action.example
    }
  },
  props: {
    modelValue: {
      type: Action,
      default: null
    },
    params: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    action() {
      return this.modelValue ?? this.internalAction;
    },
    activationParams() {
      const { params } = this;
      if (!Array.isArray(params)) {
        console.warn("Activation params for", this, "have not been provided as an array:", { params });
      }
      return Array.isArray(params) ? params : [];
    },
    disabled() {
      return !this.action?.loading;
    },
    showLoadingSpinner() {
      const { action } = this
      return action?.loading && !action?.loadingIcon
    },
    iconToShow() {
      const { action } = this
      return action?.loading ? action?.loadingIcon : action?.icon
    },
    labelToShow() {
      const { action } = this
      if (action?.inStartState) {
        return action?.startLabel
      }

      if (action?.errored) {
        return action?.errorLabel ?? action?.startLabel
      }

      if (action?.loading) {
        return action?.loadingLabel ?? action.startLabel
      }

      return action?.finishedLabel ?? action?.startLabel
    }
  },
  mounted() {
    this.registerAction(this.action)
  },
  methods: {
    activateAction() {
      const { action, activationParams } = this
      action.activate(...activationParams)
      this.$forceUpdate()
    },
    registerAction(action:Action<any>) {
      const self = this
      if (action) {
        action.on('loading', () => {
          self.$emit("loading", action)
          this.$forceUpdate()
        });
        action.on('updated', () => {
          self.$emit('update:modelValue', action)
          this.$forceUpdate()
        })
        action.on('result', (result) => {
          self.$emit('result', (result as CustomEvent).detail)
          this.$forceUpdate()
        })
        action.on('error', (error) => {
          self.$emit('error', (error as CustomEvent).detail)
          this.$forceUpdate()
        })
      }
    }
  },
  watch: {
    modelValue(action) {
      if (action) {
        this.registerAction(action)
      }
    }
  },
}
</script>
<style scoped>
.action-button .loading {
  margin-right: 5px;
}
</style>