import jsonpath from 'jsonpath'

function JsonPathSelector (): void {
  this.properties = {
    jsonpath: '$',
    single: true
  }
  this.addInput('data', 'json')
  this.addWidget('text', 'Path', '$', { property: 'jsonpath' })
  this.addWidget('toggle', 'Single result', true, { property: 'single' })
  this.serialize_widgets = true

  this.addOutput('output', 'json')
  this.addOutput('error', 'json')
}

JsonPathSelector.prototype.onExecute = async function () {
  const data = this.getInputData(0)
  const selector = this.properties.jsonpath
  console.log('SelectNode.onExecute (A)', { data, selector })
  if (data !== undefined && selector !== undefined) {
    try {
      let result = jsonpath.query(data, selector)
      if (Array.isArray(result) && result.length === 1 && this.properties.single === true) {
        result = result[0]
      }
      console.log('SelectNode.onExecute (B)', { data, selector, result })
      this.result = JSON.stringify(result, null, 2)
      this.error = null
      this.setOutputData(0, result)
      this.setOutputData(1, null)
    } catch (ex) {
      const error = ex as Error
      this.error = JSON.stringify(error, null, 2)
      this.setOutputData(0, {})
      this.setOutputData(1, error)
    }
  }
}

JsonPathSelector.title = 'Json Path Selector'

function JsonViewer (): void {
  this.properties = {}
  this.addInput('data', 'json')
}

JsonViewer.prototype.onDrawForeground = function (ctx: CanvasRenderingContext2D, graphCanvas: any) {
  const data = this.getInputData(0) ?? ''
  const format = JSON.stringify(data, null, 2) ?? this.properties.parseError ?? ''
  const [width, height] = this.size
  ctx.save()
  ctx.font = '10px Arial'
  const bottom = height
  const x = 5
  const lh = 12
  const lines = format.split('\n') ?? []
  const th = lines.length * lh
  const cutoff = lh
  lines.forEach((line, index) => {
    const liney = bottom - th + (lh * index)
    if (liney > cutoff) {
      ctx.fillText(line, x, liney, width - 10)
    }
  })
  ctx.restore()
}

JsonViewer.title = 'Json Viewer'

function JsonInput (): void {
  this.properties = {
    content: '{}'
  }
  this.addWidget('text', 'Value', '{}', { property: 'content' })
  this.addWidget('button', 'Edit Value', '????', function (node: any) { console.log('Hello world!', node) })
  this.serialize_widgets = true

  this.addOutput('as json', 'json')
  this.addOutput('as string', 'string')
}

JsonInput.prototype.onExecute = async function () {
  const json = this.properties.content
  let data = {}
  try {
    data = JSON.parse(json)
    this.properties.parseError = null
  } catch (ex) {
    const error = ex as Error
    this.properties.parseError = error.message
  }

  this.setOutputData(0, data)
  this.setOutputData(1, json)
}

JsonInput.title = 'Json Input'

JsonInput.prototype.onDrawForeground = function (ctx: CanvasRenderingContext2D, graphCanvas: any) {
  const data = this.getInputData(0) ?? ''
  const format = this.properties.parseError ?? JSON.stringify(data ?? '', null, 2)
  const [width, height] = this.size
  ctx.save()
  ctx.font = '10px Arial'
  const bottom = height
  const x = 5
  const lh = 12
  const lines = format.split('\n') ?? []
  const th = lines.length * lh
  const cutoff = lh
  lines.forEach((line, index) => {
    const liney = bottom - th + (lh * index)
    if (liney > cutoff) {
      ctx.fillText(line, x, liney, width - 10)
    }
  })
  ctx.restore()
}


export default class JsonGraphNode {
  private readonly _path: string = ''
  private readonly _nodeClass: any

  constructor (path: string, nodeClass: any) {
    this._path = path
    this._nodeClass = nodeClass
  }

  get path (): string {
    return this._path
  }

  get nodeClass (): any {
    return this._nodeClass
  }

  static create (): JsonGraphNode[] {
    const nodes: JsonGraphNode[] = []
    nodes.push(new JsonGraphNode('Json/select', JsonPathSelector))
    nodes.push(new JsonGraphNode('Json/viewer', JsonViewer))
    nodes.push(new JsonGraphNode('Json/input', JsonInput))
    return nodes
  }
}
