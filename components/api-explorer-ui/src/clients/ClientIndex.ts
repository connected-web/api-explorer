import BoardGamesApiClient from './board-games-api/BoardGamesAPIClient'
import SchemaApiDbClient from './schema-api-db/SchemaApiDbClient'

import BoardGamesAPISpec from './board-games-api/boardgames-api-services.json'
import SchemaApiDbSpec from './schema-api-db/schema-api-db-services.json'

import AuthenticatedOpenAPIClient from './AuthenticatedOpenAPIClient'
import LiteGraphNode from './LiteGraphNode'

export default class ClientIndex {
  boardGamesApi: BoardGamesApiClient
  schemaApiDb: SchemaApiDbClient

  constructor () {
    this.boardGamesApi = new BoardGamesApiClient()
    this.schemaApiDb = new SchemaApiDbClient()
  }

  get index (): { [key: string]: any } {
    return {
      'board-games-api': new AuthenticatedOpenAPIClient(BoardGamesAPISpec),
      'schema-api-db': new AuthenticatedOpenAPIClient(SchemaApiDbSpec)
    }
  }

  get documents (): { [key: string]: any } {
    return {
      'board-games-api': BoardGamesAPISpec,
      'schema-api-db': SchemaApiDbSpec
    }
  }

  get liteGraphNodes (): { [key: string]: any } {

    const allNodes = Object.values(this.documents).map((document: any) => {
      return LiteGraphNode.fromOpenAPISpec(document)
    })

    return allNodes.flat().reduce((acc: any, val: LiteGraphNode) => {
      acc[val.path] = val.nodeClass
      return acc
    }, {} as { [key: string]: any })
  }
}
