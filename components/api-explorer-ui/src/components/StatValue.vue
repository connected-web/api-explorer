<template>
  <div class="stat">
    <label>{{ label }}</label>
    <span class="value">
      <slot></slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'StatValue',
  props: ['label']
}
</script>

<style scoped>
div.stat {
  display: flex;
  flex-wrap: wrap;
  margin: 0.2em 0;
  padding: 8px 8px;
  background: #f5f5f5;
}
div.stat > label {
  flex: 2 4;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
div.stat > span.value {
  flex: 2 4;
  text-align: right;
  font-weight: bold;
  display: flex;
  gap: 5px;
  justify-content: flex-end;
  align-items: center;
}
</style>