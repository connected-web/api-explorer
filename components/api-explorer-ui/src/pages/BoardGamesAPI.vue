<template>
  <div class="api explorer page">
    <h1>Board Games API</h1>
    <ObjectActions />
  </div>
</template>

<script lang="ts">
import ObjectActions from '../actions/ObjectActions.vue'

export default {
  components: { ObjectActions }
}
</script>