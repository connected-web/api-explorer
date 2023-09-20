<template>
  <div class="playground">
    <div class="playground-area">
      <canvas width="2000" height="1000" id="playground"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { LiteGraph, LGraphCanvas, LGraph } from 'litegraph.js'  
import 'litegraph.js/css/litegraph.css'

let graph:LGraph
let canvas:LGraphCanvas
let saveInterval:number = 0

function createDefault() {
  const node_const = LiteGraph.createNode("basic/const");
  node_const.pos = [200,200];
  graph.add(node_const);
  node_const.setValue(4.5);

  const node_watch = LiteGraph.createNode("basic/watch");
  node_watch.pos = [700,200];
  graph.add(node_watch);

  node_const.connect(0, node_watch, 0 );
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
    graph.start()

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

canvas.playground {
  width: 100%;
  height: 100%;
}
</style>