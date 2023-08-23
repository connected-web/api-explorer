import BoardGamesApiClient from './board-games-api/BoardGamesAPIClient'
import SchemaApiDbClient from './schema-api-db/SchemaApiDbClient'

export default class ClientIndex {
  boardGamesApi: BoardGamesApiClient
  schemaApiDb: SchemaApiDbClient

  constructor () {
    this.boardGamesApi = new BoardGamesApiClient()
    this.schemaApiDb = new SchemaApiDbClient()
  }

  get index (): { [key: string]: any } {
    return {
      'board-games-api': this.boardGamesApi,
      'schema-api-db': this.schemaApiDb
    }
  }
}
