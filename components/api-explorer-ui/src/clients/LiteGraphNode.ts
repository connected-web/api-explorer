export default class LiteGraphNode {
  private readonly _path: string = ''
  private readonly _nodeClass: any

  constructor (title: string, operationId: string, operationDetails: any) {
    const payloadRequired = operationDetails.requestBody?.content
    const params: string[] = operationDetails.parameters?.map((param: any) => param.name) ?? []
    if (payloadRequired !== undefined) {
      params.push('requestBody')
    }

    function CustomNode (): void {
      const self: any = this as any
      params.forEach(paramName => {
        self.addInput(paramName, 'json')
      })

      self.addOutput('output', 'json')
    }

    CustomNode.prototype.onExecute = async function () {
      const paramValues: { [key: string]: any } = {}
      params.forEach((paramName, index) => {
        paramValues[paramName] = this.getInputData(index, 'string')
      })

      this.setOutputData(paramValues, 'output')
    }

    CustomNode.title = operationId

    this._path = `${title}/${operationId}`
    this._nodeClass = CustomNode

    console.log('Created lite graph node:', this.path, { nodeClass: CustomNode })
  }

  get path (): string {
    return this._path
  }

  get nodeClass (): any {
    return this._nodeClass
  }

  static fromOpenAPISpec (openApiDocument: any): LiteGraphNode[] {
    const operations = LiteGraphNode.operationsFor(openApiDocument)

    const title = openApiDocument?.info?.title ?? 'Untitled'

    return Object.entries(operations).map(([operationId, operationDetails]) => {
      return new LiteGraphNode(title, operationId, operationDetails)
    })
  }

  static operationsFor (openApiDocument: any): { [key: string]: any } {
    return Object.entries(openApiDocument?.paths ?? {}).reduce<any>((acc, [path, pathItem]) => {
      const operations = Object.entries(pathItem as any).reduce<any>((acc, [method, operationItem]) => {
        const operationDetails = operationItem as any
        if (operationDetails?.operationId === undefined) {
          return acc
        }
        operationDetails.method = method
        operationDetails.path = path
        acc[String(operationDetails?.operationId)] = operationDetails
        return acc
      }, {})

      acc = Object.assign({}, acc, operations)
      return acc
    }, {})
  }
}
