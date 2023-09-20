<template>
  <div :class="{ sidenav: true, show }">
    <router-link to="/">Home</router-link>

    <label>User</label>
    <router-link to="/user/details">User Details</router-link>

    <label>Explore</label>
    <router-link to="/explore">Index</router-link>

    <label>APIs</label>
    <router-link v-for="document in documents" :key="document.id"
     :to="`/explore/${document.id}`">{{ document.name }}</router-link>

    <label>Extras</label>
    <router-link to="/playground">Playground</router-link>
    <router-link to="/extras/icons">Icon Browser</router-link>
  </div>
</template>

<script lang="ts">
import { inject } from 'vue'

import ClientIndex from '../clients/ClientIndex'

const documents = new ClientIndex().documents

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      screenSize: null
    }
  },
  computed: {
    documents() {
      return Object.entries(documents).map(([id, document]) => {
        return {
          id,
          name: document?.info?.title
        }
      })
    }
  },
  setup() {
    return {
      screenSize: inject('screenSize')
    }
  }
}
</script>

<style scoped>
  .sidenav {
    display: flex;
    flex-direction: column;
    gap: 1px;
    justify-content: flex-start;
    min-width: 200px;
    width: 200px;
    max-width: 200px;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 2px solid #ddd;
    transition: min-width 200ms ease-in-out, max-width 200ms ease-in-out, width 200ms ease-in-out, background-color 200ms ease-in-out;
    z-index: 100;
  }
  .sidenav > * {
    white-space: nowrap;
  }
  
  .sidenav > label {
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 4px;
    font-weight: 600;
    color: #666;
  }
  .sidenav > a {
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
  }
  
  @media only screen and (max-width: 768px) {
    .sidenav {
      position: absolute;
      display: block;
      top: 0;
      left: 0;
      min-width: 0;
      width: 0;
      max-width: 0;
      overflow: hidden;
      background: #666;
      transition: min-width 200ms ease-in-out, max-width 200ms ease-in-out, width 200ms ease-in-out, background-color 200ms ease-in-out;
    }
    .sidenav.show {
      min-width: 100%;
      max-width: 100%;
      background: rgb(255, 255, 255);
    }
    .sidenav > * {
      display: none;
      white-space: nowrap;
    }    
    .sidenav.show > * {
      display: block;
      white-space: nowrap;
    }   
  }
  </style>