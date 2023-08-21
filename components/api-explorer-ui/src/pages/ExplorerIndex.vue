<template>
  <div class="api explorer page">
    <h1>Explorer Index</h1>
    <div class="clients">
      <div v-for="(client, key) in clients" :key="`client_${key}`">
        <pre><code>{{ { client, key } }}</code></pre>
        <ObjectActions :model-value="client?.getInstance() ?? client" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ClientIndex from '../clients/ClientIndex'

import ObjectActions from '../actions/ObjectActions.vue'

export default {
  components: { ObjectActions },
  props: {
    clientId: {
      type: String,
      default: null 
    }
  },
  data() {
    return {
      clientIndex: new ClientIndex()
    }
  },
  computed: {
    clients() {
      return this.clientIndex.index
    }
  }
}
</script>