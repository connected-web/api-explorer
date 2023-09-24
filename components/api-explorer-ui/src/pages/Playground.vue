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
        <button @click="clearGraph">
          <Icon icon="recycle" />
          <label>Clear</label>
        </button>
        <button @click="run">
          <Icon icon="play" />
          <label>Run</label>
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
import JsonPathGraphNode from '../clients/JsonPathGraphNode'

const clients = new ClientIndex()

LiteGraph.clearRegisteredTypes()
Object.entries(clients.liteGraphNodes).forEach(([key, value]) => {
  console.log('Registering:', { key, value })
  LiteGraph.registerNodeType(key, value)
})

JsonPathGraphNode.create().forEach(node => {
  console.log('Registering:', { key: node.path, value: node.nodeClass })
  LiteGraph.registerNodeType(node.path, node.nodeClass)
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

class LGraphAsync extends LGraph {
  /**
    * Run N steps (cycles) of the graph
    * @method runStep
    * @param {number} num number of steps to run, default is 1
    * @param {Boolean} do_not_catch_errors [optional] if you want to try/catch errors 
    * @param {number} limit max number of nodes to execute (used to execute from start to a node)
    */
    async runStepAsync (num:number, limit:number) {
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
      graphInfo: {}
    }
  },
  mounted() {
    graph = new LGraphAsync()
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
    clearGraph() {
      graph.clear()
      createDefault()
    },
    run() {
      console.log('Running graph')
      graph.runStepAsync(1)
      graph.stop()
      

      this.graphInfo = {
        keys: Object.keys(graph),
        serialized: graph.serialize()
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