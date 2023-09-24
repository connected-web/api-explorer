import AuthenticatedOpenAPIClient from './AuthenticatedOpenAPIClient'
import OpenAPIClient from './OpenAPIClient'

export default class OpenAPIGraphNode {
  private readonly _path: string = ''
  private readonly _nodeClass: any

  constructor (title: string, operationId: string, operationDetails: any, client: OpenAPIClient) {
    const payloadRequired = operationDetails.requestBody?.content
    const params: string[] = operationDetails.parameters?.map((param: any) => param.name) ?? []
    if (payloadRequired !== undefined) {
      params.push('requestBody')
    }

    function CustomNode (): void {
      this.properties = {
        response: null,
        error: null
      }
      params.forEach(paramName => {
        this.addInput(paramName, 'json')
      })

      this.addOutput('output', 'json')
      this.addOutput('error', 'json')
    }

    CustomNode.prototype.onDrawForeground = function (ctx: CanvasRenderingContext2D, graphCanvas: any) {
      const [width, height] = this.size
      const inputCount: number = this.inputs?.length ?? 0
      ctx.save()
      if (this.executing === true) {
        ctx.strokeStyle = '#FFF'
        ctx.strokeRect(0, 0, width, height)
      } else if (this.properties.error?.length > 0) {
        ctx.strokeStyle = '#900'
        ctx.strokeRect(0, 0, width, height)
      }
      ctx.font = '10px Arial'
      const bottom = height
      const x = 5
      const lh = 12
      const lines = this.properties.response?.split('\n') ?? []
      const th = lines.length * lh
      const cutoff = (1 + inputCount) * lh
      lines.forEach((line, index) => {
        const liney = bottom - th + (lh * index)
        if (liney > cutoff) {
          ctx.fillText(line, x, liney, width - 10)
        }
      })
      ctx.restore()
    }

    CustomNode.prototype.onExecute = async function () {
      console.log('Executing:', this.title)
      this.executing = true
      const paramValues: { [key: string]: any } = {}
      params.forEach((paramName, index) => {
        paramValues[paramName] = this.getInputData(index, false)
      })

      try {
        const response = await client[operationId](...Object.values(paramValues))
        const data = response
        this.properties.response = JSON.stringify(data, null, 2)
        this.setOutputData(0, data)
        this.setOutputData(1, null)
      } catch (ex) {
        const error = ex as Error
        this.properties.error = JSON.stringify(error, null, 2)
        this.setOutputData(0, {})
        this.setOutputData(1, error)
      }
      this.executing = false

      console.log('Executed:', this.title, { paramValues }, { response: this.properties.response, error: this.properties.error })
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

  static fromOpenAPISpec (openApiDocument: any): OpenAPIGraphNode[] {
    const operations = OpenAPIGraphNode.operationsFor(openApiDocument)

    const title = openApiDocument?.info?.title ?? 'Untitled'
    const client = new AuthenticatedOpenAPIClient(openApiDocument)

    return Object.entries(operations).map(([operationId, operationDetails]) => {
      return new OpenAPIGraphNode(title, operationId, operationDetails, client)
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
