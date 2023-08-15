<template>
  <div class="loading">
    <div class="spinner" />
    <div class="label">
      <slot />
    </div>
  </div>
</template>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to { 
    transform: rotate(360deg);
  }
}

@-webkit-keyframes rotate {
  from {
    -webkit-transform: rotate(0deg);
  }
  to { 
    -webkit-transform: rotate(360deg);
  }
}

.loading {
  display: flex;
  flex-direction: row;
}
.loading > .spinner {
  display: inline-block;
	width: 0.5em;
	height: 0.5em;
	margin: auto 0;
	border:solid 4px rgb(107, 185, 105);
	border-radius: 50%;
	border-right-color: transparent;
	border-bottom-color: transparent;
  -webkit-transition: all 0.5s ease-in;
  -webkit-animation-name: rotate; 
  -webkit-animation-duration: 1.0s; 
  -webkit-animation-iteration-count:infinite;
  -webkit-animation-timing-function: linear;
	
  transition: all 0.5s ease-in;
  animation-name: rotate; 
  animation-duration: 1.0s; 
  animation-iteration-count:infinite;
  animation-timing-function: linear; 
  vertical-align: middle;
}
.label {
  margin-left: 0.5em;
}
</style>