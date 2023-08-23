<template>
  <div class="api explorer page">
    <div v-if="clientId">
      <div class="breadcrumbs row p5 left">
        <router-link to="/explore/">Explorer Index</router-link>
        <span>/</span>
        <span>{{ sentenceCase(clientId) }}</span>
      </div>
      <h1>{{ sentenceCase(clientId) }}</h1>
      <ObjectActions :model-value="clients[clientId]" />
    </div>
    <div v-else>
      <div class="breadcrumbs row p5 left">
        <span>Explorer Index</span>
      </div>
      <h1>Explorer Index</h1>
      <div class="clients">
        <p>The following API clients registered with the site:</p>
        <ul>
          <li v-for="(client, key) in clients" :key="`client_${key}`">
            <router-link :to="`/explore/${key}`">{{ sentenceCase(String(key)) }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ClientIndex from '../clients/ClientIndex'

import ObjectActions from '../actions/ObjectActions.vue'

import sentenceCase from '../actions/SentenceCase'

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
  },
  methods: {
    sentenceCase
  }
}
</script>

<style>
li {
  list-style: disc;
  margin: 5px 0 5px 2em;
  line-height: normal;
}
</style>