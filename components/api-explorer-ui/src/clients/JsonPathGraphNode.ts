import jsonpath from 'jsonpath'

function JsonPathSelector (): void {
  this.properties = {
    jsonPath: undefined,
    response: null,
    error: null
  }
  this.addInput('data', 'json')
  this.addWidget('text', 'path', '', { property: 'jsonPath' })
  this.serialize_widgets = true

  this.addOutput('output', 'json')
  this.addOutput('error', 'json')
}

JsonPathSelector.prototype.onExecute = async function () {
  const data = this.getInputData(0)
  const jsonPath = this.properties.jsonPath
  console.log('SelectNode.onExecute (A)', { data, jsonPath })
  if (data !== undefined && jsonPath !== undefined) {
    try {
      const result = jsonpath.query(data, jsonPath)
      console.log('SelectNode.onExecute (B)', { data, jsonPath, result })
      this.properties.result = JSON.stringify(result, null, 2)
      this.setOutputData(0, result)
      this.setOutputData(1, null)
    } catch (ex) {
      const error = ex as Error
      this.properties.error = JSON.stringify(error, null, 2)
      this.setOutputData(0, {})
      this.setOutputData(1, error)
    }
  }
}

export default class JsonPathGraphNode {
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

  static create (): JsonPathGraphNode[] {
    const nodes: JsonPathGraphNode[] = []
    nodes.push(new JsonPathGraphNode('Json Path/select', JsonPathSelector))
    return nodes
  }
}
