import BoardGamesApiClient from './board-games-api/BoardGamesAPIClient'
import SchemaApiDbClient from './schema-api-db/SchemaApiDbClient'

import BoardGamesAPISpec from './board-games-api/boardgames-api-services.json' 
import SchemaApiDbSpec from './schema-api-db/schema-api-db-services.json'


async function callOperation (operationDetails: any, params: any, payload: any) {
  const { method, path } = operationDetails
  const serviceUrl = `${this.selectedServer}${path}`.replace(/{([^}]+)}/g, (_, paramName) => {
    return params[paramName]
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

export class OpenAPIClient {
  openApiDocument: any
  selectedServer: string

  constructor(openApiDocument: any) {
    this.openApiDocument = openApiDocument
    this.selectedServer = openApiDocument.servers[0].url

    const operations = this.operations
    Object.entries(operations).forEach(([operationId, operationDetails]) => {
      const params = operationDetails.parameters?.map((param: any) => param.name).join(', ') || ''
      eval(`OpenAPIClient.prototype.${operationId} = async function (${params}) { return this.callOperation(operationDetails, params) }`)
    })
  }

  get operations(): { [key: string]: any } {
    return Object.entries(this.openApiDocument?.paths ?? {}).reduce((acc, [path, pathItem]) => {
      const operations = Object.entries(pathItem as any).reduce((acc, [method, operationItem]) => {
        const operationDetails = operationItem as any
        if (operationDetails?.operationId === undefined) {
          return acc
        }
        operationDetails.method = method
        operationDetails.path = path
        acc[String(operationDetails?.operationId)] = operationDetails
        return acc
      }, {} as any)

      acc = Object.assign({}, acc, operations)
      return acc
    }, {} as any)
  }
}

export default class ClientIndex {
  boardGamesApi: BoardGamesApiClient
  schemaApiDb: SchemaApiDbClient

  constructor () {
    this.boardGamesApi = new BoardGamesApiClient()
    this.schemaApiDb = new SchemaApiDbClient()
  }

  get index (): { [key: string]: any } {
    return {
      'board-games-api': new OpenAPIClient(BoardGamesAPISpec),
      'schema-api-db': new OpenAPIClient(SchemaApiDbSpec)
    }
  }

  get documents(): { [key: string]: any } {
    return {
      'board-games-api': BoardGamesAPISpec,
      'schema-api-db': SchemaApiDbSpec
    }
  }
}
