<template>
  <div class="playground">
    <div class="playground-area">
      <canvas width="2000" height="1000" id="playground"></canvas>
      <div class="buttons row p10">
        <button @click="save">
          <Icon icon="download" />
          <label>Save</label>
        </button>
        <button @click="load">
          <Icon icon="upload" />
          <label>Load</label>
        </button>
        <button @click="reset">
          <Icon icon="recycle" />
          <label>Reset</label>
        </button>
        <span class="spacer"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { LiteGraph, LGraphCanvas, LGraph } from 'litegraph.js'  
import 'litegraph.js/css/litegraph.css'

import ClientIndex from '../clients/ClientIndex'

const clients = new ClientIndex()

LiteGraph.clearRegisteredTypes()
Object.entries(clients.liteGraphNodes).forEach(([key, value]) => {
  console.log('Registering:', { key, value })
  LiteGraph.registerNodeType(key, value)
})

let graph:LGraph
let canvas:LGraphCanvas
let saveInterval:number = 0

function createDefault() {
  const getStatus1 = LiteGraph.createNode("apis/schema-api-db/getStatus")
  getStatus1.pos = [200,200]
  graph.add(getStatus1)

  const getStatus2 = LiteGraph.createNode("apis/boardgames-api/getStatus")
  getStatus2.pos = [200,500]
  graph.add(getStatus2)
}

export default {
  data() {
    return {}
  },
  mounted() {
    graph = new LGraph()
    canvas = new LGraphCanvas('#playground', graph)

    try {
      this.load()
    } catch (ex) {
      const error = ex as Error
      console.warn('Failed to load graph state', error.message)
      createDefault()
    }

    saveInterval = setInterval(() => {
      this.save()
    }, 1000)
  },
  unmounted() {
    graph.stop()
    clearInterval(saveInterval)
  },
  methods: {
    save() {
      const data = graph.serialize()
      localStorage.setItem('playground', JSON.stringify(data))
    },
    load() {
      const data = localStorage.getItem('playground')
      if (data) {
        console.log('Found existing graph state:', data)
        graph.configure(JSON.parse(data))
      } else {
        throw new Error('No graph state found')
      }
    },
    reset() {
      graph.clear()
      createDefault()
    }
  }
}
</script>

<style scoped>
div.playground {
  display: block;
  position: relative;
  margin: 0;
  padding: 0;
}
.playground-area {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}

.buttons {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
  z-index: 100;
  justify-content: flex-start;
}

canvas.playground {
  width: 100%;
  height: 100%;
}
</style>