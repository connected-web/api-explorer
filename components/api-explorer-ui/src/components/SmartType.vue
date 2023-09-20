<template>
  <div :class="smartClass">
    <b v-if="showName">{{ name }}</b>
    <div v-if="smartType === 'object'">
      <smart-type
        v-for="[entryKey, entryValue] in objectEntries(value)"
        :key="`st_${entryKey}`"
        :name="entryKey"
        :value="entryValue"
        :show-name="true"
      />
    </div>
    <span v-else-if="smartType === 'icon'">
      <icon :icon="value" />
    </span>
    <div v-else-if="smartType === 'color'" style="text-transform: uppercase; font-family: monospace;">
      <span>{{ value }}</span>
      <icon icon="square" :style="`color: ${value}`" />
    </div>
    <div v-else-if="smartType === 'url'" style="font-family: monospace; white-space: nowrap;">
      <icon icon="earth-americas" />
      <a :href="value">/{{ value.split('/').pop().split('?')[0] }}</a>
    </div>
    <div v-else-if="smartType === 'date'">
      <RelativeDate v-if="parseDate(value)" :date="parseDate(value)">
        ({{ value }})
      </RelativeDate>
      <b v-else>{{ value }}</b>
    </div>
    <div v-else-if="smartType === 'datetime'">
      <RelativeDate v-if="parseDate(value)" :date="parseDate(value)">
        ({{ value }})
      </RelativeDate>
      <b v-else>{{ value }}</b>
    </div>
    <div v-else-if="smartType === 'apikey'">
      <HiddenByDefault>
        {{ value }}
      </HiddenByDefault>  
    </div>
    <span v-else-if="smartType === 'aws-arn'">
      <hidden-by-default reason="Long value">{{ value }}</hidden-by-default>
    </span>
    <span v-else-if="(smartType === 'string' && value.length > 30 && !value.match(/\s/))">
      <hidden-by-default reason="Long value">{{ value }}</hidden-by-default>
    </span>
    <span v-else>
      {{ value }}
    </span>
  </div>
</template>

<script lang="ts">
import flattenObject from './FlattenObject'
import HiddenByDefault from './HiddenByDefault.vue'
import RelativeDate from './RelativeDate.vue'

const keyTypes = {
  icon: 'icon',
  color: 'color'
}

export default {
  name: "SmartType",
  components: { HiddenByDefault, RelativeDate },
  props: {
    name: {
      type: String,
      default: ''
    },
    value: {
      type: null,
      default() {
        return ''
      }
    },
    showName: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    smartClass() {
      const { smartType, showName } = this
      const withName = showName ? 'with-name' : false
      return ['smart', 'property', smartType, withName].filter(n => n).join(' ')
    },
    smartType() {
      const { name, value } = this
      const keyString = (name + '').toLowerCase()
      const valueString = (value + '').toLowerCase()

      const knownKeyType = keyTypes[keyString]
      if (knownKeyType) {
        return knownKeyType
      }
      if (valueString.includes('https://')) {
        return 'url'
      }
      if (valueString.includes('arn:')) {
        return 'aws-arn'
      }
      if (keyString.includes('date')) {
        return 'date'
      }
      if (keyString.includes('api') && keyString.includes('key')) {
        return 'apikey'
      }
      if (keyString.includes('timestamp')) {
        return 'datetime'
      }
      if (valueString.match(/^[0-9]{4}-(0[1-9]|1[0-2])/)) {
        return 'datetime'
      }
      return typeof value
    }
  },
  methods: {
    objectEntries(value) {
      const flattened = flattenObject(value)
      return Object.entries(flattened)
    },
    parseDate(value) {
      const date = new Date(value)
      return (date.toString() === 'Invalid Date') ? new Date() : date
    }
  }
}
</script>

<style scoped>
.smart.property {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 2px;
}
.smart.property.object > div {
  width: 100%;
}
.smart.property.with-name {
  justify-content: space-between;
}
.smart.property > b {
  margin: 0 0.5em 0 0;
}
.smart.property.boolean > span::before {
  content: 'bool:'
}
.smart.property.boolean > span {
  display: inline-block;
  border-radius: 0.5em;
  padding: 0 0.5em;
  background: #ccc;
}

</style>