<template>
  <div class="object-actions">
    <div v-for="item in signatures" :key="`${item.description}_group`" class="object-action column p5">
      <h4>{{ sentenceCase(item.prop) }}</h4>
      <div v-if="item.params" class="inputs">
        <div v-for="param in item.params" :key="`${item.description}_${param}_input`" class="input row">
          <label>{{ sentenceCase(param) }}</label>
          <input v-model="item.inputs[param]" :placeholder="param" @input="$forceUpdate()" />
        </div>
      </div>
      <div class="row p5">
        <button @click="item?.action.reset()" :disabled="item?.action.inStartState">
          <icon icon="recycle" />
          <span>Reset</span>
        </button>
        <span class="spacer"></span>
        <ActionButton v-model="item.action" :params="inputParams(item)" />
      </div>
      <pre v-if="item?.action?.loading">Loading...</pre>
      <pre v-if="item?.action?.errored">Error: {{ item?.action?.error  }}</pre>
      <SmartTable v-if="item?.action?.finished" :value="results[item.action?.id] ?? 'No result'" />
      <div v-if="item?.action?.spiedLogs?.length > 0">
        <h4>Console Logs</h4>
        <pre><code>{{
          item?.action?.spiedLogs.map(n => n.map(m => JSON.stringify(m)).join(' ')).join('\n')
        }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ActionButton from './ActionButton.vue'
import IconSearch from './IconSearch'

import Action from './Action'
import describeObject from './DescribeObject'
import sentenceCase from './SentenceCase'

import SmartTable from '../components/SmartTable.vue'
import { ObjectDescription } from './DescribeObject'

class HelloWorld {
  helloWorld(success:boolean=true) {
    let succeed: (value: unknown) => void, fail: (reason?: any) => void
    const future = new Promise((resolve, reject) => {
      succeed = resolve
      fail = reject
    })
    setTimeout(() => {
      if (success) {
        succeed('Hello world')
      } else {
        fail('Error world')
      }
    }, 2500)

    return future
  }
}

interface ObjectSignature extends ObjectDescription {
  inputs: { [key: string ]: string }
  action: Action<any>
}

export default {
  components: { ActionButton, SmartTable },
  data() {
    return {
      iconSearch: new IconSearch(),
      actions: {} as { [key: string]: Action<unknown> },
      results: {} as { [key: string]: any },
      resolved: {} as any
    }
  },
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return new HelloWorld()
      }
    }
  },
  computed: {
    signatures():Array<ObjectSignature> {
      const { resolved } = this
      if (!resolved) {
        return []
      }
      const items = describeObject(Object.getPrototypeOf(resolved))
      // console.log('Describing', { resolved, items, keys: Object.keys(resolved) })
      return items.map(item => {
        return { ...item, inputs: {}, action: this.createActionFor(item, resolved) } as ObjectSignature
      })
    }
  },
  methods: {
    describeObject,
    sentenceCase,
    createActionFor(item:any, context:any) {
      const { actions, iconSearch } = this
      const actionFunction = item.type === 'function' ? async (...args) => {
        return item.value.apply(context, args)
      } : () => item.value
      const action = actions[item.prop]?.on ? actions[item.prop] : new Action(actionFunction)
      action.startLabel = sentenceCase(item.prop)
      const suggestedIcon = iconSearch.findIcon(action.startLabel)
      if (typeof suggestedIcon !== 'string') {
        console.log('Suggested icon:', { suggestedIcon, startLabel: action.startLabel })
      }
      action.icon = suggestedIcon ?? 'star'
      actions[item.prop] = action
      this.actions = actions

      try {
        action.on('loading', () => {
          this.$forceUpdate()
        });
        action.on('updated', () => {
          this.$forceUpdate()
        })
        action.on('result', async (result: CustomEvent) => {
          this.results[action.id] = await action.actionResult
          this.$forceUpdate()
        })
        action.on('error', (error: CustomEvent) => {
          console.log('Action errored')
          this.$forceUpdate()
        })
      } catch (error) {
        console.log('Action:', action, 'Error:', { error })
      }

      return action
    },
    inputParams(item: any) {
      return (item.params ?? []).map((param: any) => {
        let value = item.inputs[param]
        try {
          value = JSON.parse(value)
          // console.log('Converted', param, 'from JSON into', { value })
        } catch (ex) {
          // leave value as is
        }
        return value
      })
    }
  },
  async mounted() {
    const resolved = await Promise.resolve(this.modelValue)
    this.resolved = resolved
  },
  watch: {
    async modelValue() {
      this.actions = {}
      this.results = {}
      this.resolved = await Promise.resolve(this.modelValue)
    }
  }
}
</script>

<style scoped>
.input.row {
  margin: 4px 0;
}
.input.row > label {
  min-width: 250px; 
  font-weight: bold;
}
.input.row > input {
  flex: 1 1;
  padding: 0.5em;
}

.object-action {
  border-radius: 0.5em;
  box-shadow: 2px #ddd;
  background: #eee;
  padding: 0.5em;
  margin: 0.5em 0;
}

.object-action pre {
  overflow-y: clip;
  overflow-x: auto;
}
</style>