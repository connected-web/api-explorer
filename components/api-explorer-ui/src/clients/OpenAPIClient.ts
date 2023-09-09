// import Ajv, { ValidateFunction } from 'ajv/dist/2020'
// import addFormats from 'ajv-formats'
// import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json'

export default class OpenAPIClient {
  openApiDocument: any

  constructor (openApiDocument?: any, callOperation?: (baseURL: string, operationDetails:any, params:any[], payload?:any) => Promise<any>) {
    if (openApiDocument !== undefined) {
      this.openApiDocument = openApiDocument
      const baseURL = openApiDocument?.servers[0]?.url
      const makeRequest = callOperation ?? this.callOperation

      const title: string = openApiDocument?.info?.title ?? 'Untitled API'
      const className = title.replace(/[^a-zA-Z0-9]/g, '') + 'Client'
      console.log('Creating client class', className, 'for API', title)

      const CustomClient = class extends OpenAPIClient { }

      const operations = this.operations
      Object.entries(operations).forEach(([operationId, operationDetails]) => {
        const payload = undefined
        const params: string[] = operationDetails.parameters?.map((param: any) => param.name) ?? []
        if (payload !== undefined) {
          params.push('payload')
        }
        const paramNames = params.join(', ')
        /* eslint-disable no-eval */
        eval(`CustomClient.prototype.${operationId} = async function (${paramNames}) { return makeRequest(baseURL, operationDetails, params, payload) }`)
      })

      return new CustomClient()
    }
  }

  protected async callOperation (baseURL: string, operationDetails: any, params: any, payload: any): Promise<any> {
    console.log('Call operation: ', operationDetails?.operationId, 'with params', { params, payload })
    const { method, path } = operationDetails
    const serviceUrl = `${baseURL}${String(path)}`.replace(/{([^}]+)}/g, (_, paramName) => {
      return params[paramName] ?? `${String(paramName)}:undefined`
    })
    console.log('Activating operation', operationDetails?.operationId, 'with params', { params, serviceUrl })
    const response = await fetch(serviceUrl, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    const json = await response.json()
    return json
  }

  get operations (): { [key: string]: any } {
    return Object.entries(this.openApiDocument?.paths ?? {}).reduce<any>((acc, [path, pathItem]) => {
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
