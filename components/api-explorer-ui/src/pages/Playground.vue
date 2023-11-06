<template>
  <div :class="{ playground: true, fullscreen }">
    <div :class="{ showDialog, 'json-dialog': true, column: true }">
      <div class="dialog-header row p10">
        <h3>Dialog Title</h3>
        <button @click="showDialog = false">
          <Icon icon="recycle" />
          <label>Close</label>
        </button>
      </div>
      <div class="dialog-body column p5">
        <p>Dialog content here</p>
        <div class="buttons row">
          <span class="spacer"></span>
          <button @click="showDialog = false">
            <Icon icon="recycle" />
            <label>Close</label>
          </button>
        </div>
      </div>
    </div>
    <div :class="{ 'playground-area': true, litegraph: true }" ref="litegraph-area">
      <canvas width="800" height="600" id="playground" ref="litegraph-canvas"></canvas>
      <div :class="{ buttons: true, row: true, p10: true, showButtons }">
        <button @click="save">
          <Icon icon="download" />
          <label>Save</label>
        </button>
        <button @click="load">
          <Icon icon="upload" />
          <label>Load</label>
        </button>
        <button @click="clearGraph">
          <Icon icon="recycle" />
          <label>Clear</label>
        </button>
        <button @click="run" :disabled="running">
          <LoadingSpinner v-if="running" />
          <Icon v-else icon="play" />
          <label>{{ running ? 'Running' : 'Run' }}</label>
        </button>
        <button @click="toggleFullscreen">
          <Icon :icon="fullscreen ? 'compress' : 'expand'" />
          <span>{{ fullscreen ? 'Shrink' : 'Expand' }}</span>
        </button>
        <span class="spacer"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { LiteGraph, LGraphCanvas, LGraph } from 'litegraph.js'
import 'litegraph.js/css/litegraph.css'
import { singleton as NodeEventBus } from '../graphnodes/NodeEventBus'

import ClientIndex from '../clients/ClientIndex'
import JsonGraphNode from '../graphnodes/JsonGraphNode'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const clients = new ClientIndex()

LiteGraph.clearRegisteredTypes()
Object.entries(clients.liteGraphNodes).forEach(([key, value]) => {
  console.log('Registering:', { key, value })
  LiteGraph.registerNodeType(key, value)
})

JsonGraphNode.create().forEach(node => {
  console.log('Registering:', { key: node.path, value: node.nodeClass })
  LiteGraph.registerNodeType(node.path, node.nodeClass)
})

let graph: LGraph
let canvas: LGraphCanvas
let saveInterval: number = 0

class LGraphAsync extends LGraph {
  /**
    * Run N steps (cycles) of the graph
    * @method runStep
    * @param {number} num number of steps to run, default is 1
    * @param {Boolean} do_not_catch_errors [optional] if you want to try/catch errors 
    * @param {number} limit max number of nodes to execute (used to execute from start to a node)
    */
  async runStepAsync(num: number, limit: number) {
    num = num || 1

    var start = LiteGraph.getTime();
    this.globaltime = 0.001 * (start - this.starttime)

    var nodes = this._nodes_executable
      ? this._nodes_executable
      : this._nodes
    if (!nodes) {
      return
    }

    limit = limit || nodes.length

    try {
      //iterations
      for (var i = 0; i < num; i++) {
        for (var j = 0; j < limit; ++j) {
          var node = nodes[j];
          if (node.mode == LiteGraph.ALWAYS && node.onExecute) {
            await node.onExecute()
          }
        }

        this.fixedtime += this.fixedtime_lapse;
        if (this.onExecuteStep) {
          this.onExecuteStep()
        }
      }

      if (this.onAfterExecute) {
        this.onAfterExecute()
      }
      this.errors_in_execution = false;
    } catch (err) {
      this.errors_in_execution = true;
      if (LiteGraph.throw_errors) {
        throw err;
      }
      if (LiteGraph.debug) {
        console.log("Error during execution: " + err)
      }
      this.stop()
    }

    var now = LiteGraph.getTime()
    var elapsed = now - start
    if (elapsed == 0) {
      elapsed = 1
    }
    this.execution_time = 0.001 * elapsed
    this.globaltime += 0.001 * elapsed
    this.iteration += 1
    this.elapsed_time = (now - this.last_update_time) * 0.001
    this.last_update_time = now
    this.nodes_executing = []
    this.nodes_actioning = []
    this.nodes_executedAction = []
  }
}

export default {
  data() {
    return {
      graphInfo: {},
      running: false,
      showDialog: false,
      fullscreen: false
    }
  },
  computed: {
    showButtons() {
      return !this.running && !this.showDialog
    }
  },
  mounted() {
    graph = new LGraphAsync();
    canvas = new LGraphCanvas('#playground', graph)
    try {
      this.load()
    }
    catch (ex) {
      const error = ex as Error;
      console.warn('Failed to load graph state', error.message)
    }
    saveInterval = setInterval(() => {
      this.save();
    }, 1000)

    NodeEventBus.on('edit-json', (event: Event) => {
      const node:JsonGraphNode = (event as CustomEvent)?.detail
      console.log('Display dialog to edit JSON:', node)
      this.showDialog = true
    })

    this.fitCanvasToContainer()
    window.onresize = () => {
      this.fitCanvasToContainer()
    }
  },
  unmounted() {
    graph.stop()
    clearInterval(saveInterval)
    NodeEventBus.off('edit-json')
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
      }
      else {
        throw new Error('No graph state found')
      }
    },
    clearGraph() {
      graph.clear()
    },
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
      const $canvas:HTMLCanvasElement = this.$refs['litegraph-canvas'] as HTMLCanvasElement
      if (this.fullscreen) {
        $canvas.width =  window.innerWidth
        $canvas.height = window.innerHeight
        document.body.style.overflow = 'hidden'
        document.body.scrollTop = document.documentElement.scrollTop = 0
        graph.change()
      } else {
        document.body.style.overflow = 'auto'
        $canvas.width = 800
        $canvas.height = 600
        graph.change()
        this.fitCanvasToContainer()
      }
    },
    fitCanvasToContainer() {
      const $canvas:HTMLCanvasElement = this.$refs['litegraph-canvas'] as HTMLCanvasElement
      const $area:HTMLDivElement = this.$refs['litegraph-area'] as HTMLDivElement

      $canvas.width = $area.clientWidth
      $canvas.height = $area.clientHeight

      graph.change()
    },
    async run() {
      this.running = true
      console.log('Running graph');
      await graph.runStepAsync(1)
      graph.stop();
      this.graphInfo = {
        keys: Object.keys(graph),
        serialized: graph.serialize()
      };
      this.running = false
    }
  },
  components: { LoadingSpinner }
}
</script>

<style>
div.playground.page {
  display: block;
  position: relative;
  margin: 0;
  padding: 0;
}

div.playground.fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}

.playground-area {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
}
.litegraph {
  position: relative;
  overflow: hidden;
}

.fullscreen .litegraph {
  display: block;
  border: none;
  width: 100%;
  height: 100%;
}
.fullscreen .litegraph > canvas {
  width: 100vw;
  height: 100vh;
}


.buttons {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px;
  z-index: 100;
  justify-content: flex-start;
}

canvas.playground {
  width: 100%;
  height: 100%;
}

.json-dialog {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgba(0,0,0,0.5);
  justify-content: space-between;
  z-index: 20;
}

.showDialog {
  display: flex;
}

.showButtons {
  display: flex;
}

.json-dialog .dialog-header {
  position: relative;
  background: #111;
  color: #fff;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 20px 20px 0 20px;
  border-radius: 10px 10px 0 0;
  border: 2px solid #222;
  border-bottom: none;
}
.json-dialog .dialog-header h3 {
  color: white;
  margin: 0;
  padding: 0;
}

.json-dialog .dialog-body {
  position: relative;
  background: rgba(100,100,100,0.9);
  color: #fff;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 0 20px 20px 20px;
  flex: 1 10;
  border-radius: 0 0 10px 10px;
  border: 2px solid #333;
  border-top: none;
}

.litegraph .dialog .property_value {
  text-align: left;
  white-space: pre;
}
</style>