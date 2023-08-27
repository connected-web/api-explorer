import OpenAPIClientAxios, { OpenAPIV3 } from 'openapi-client-axios'
import OpenAPIDocument from './schema-api-db-services.json'
import Auth from '../../login/Auth'
import { Client, Components } from './SchemaApiDbClientTypes'

interface ServerInfo {
  baseURL: string
  headers: {
    [param: string]: string
  }
}

async function getServerInfo (): Promise<ServerInfo> {
  const authToken = await Auth.getLatestAccessToken()
  const server: ServerInfo = {
    baseURL: 'https://schema-api-db.prod.connected-web.services',
    headers: {
      Authorization: `Bearer ${authToken as string}`
    }
  }

  return server
}

function validateStatus (status: number): boolean {
  return status >= 200 && status < 600 // default
}

export type BoardGamesApiClientType = Client

export default class BoardGamesApiClient {
  static readonly singleton: BoardGamesApiClient = new BoardGamesApiClient()

  static getSingleton (): BoardGamesApiClient {
    return BoardGamesApiClient.singleton
  }

  async getInstance (): Promise<Client> {
    const serverInfo = await getServerInfo()
    const client = new OpenAPIClientAxios({
      definition: OpenAPIDocument as OpenAPIV3.Document,
      axiosConfigDefaults: Object.assign({}, serverInfo, { validateStatus })
    })

    return await client.getClient<Client>()
  }

  async getStatus (): Promise<Components.Schemas.StatusResponseModel> {
    const client = await this.getInstance()
    const response = await client.getStatus()
    return response.data
  }

  async getSchema (schemaId: string): Promise<Components.Schemas.StorableSchemaModel> {
    const client = await this.getInstance()
    const response = await client.getSchema({ schemaId })
    return response.data
  }

  async putSchema (schemaId: string, schemaDoc: any): Promise<Components.Schemas.SchemaStoredModel> {
    const client = await this.getInstance()
    const response = await client.putSchema({ schemaId }, schemaDoc)
    return response.data
  }

  async deleteSchema (schemaId: string): Promise<Components.Schemas.SchemaDeletedModel> {
    const client = await this.getInstance()
    const response = await client.deleteSchema({ schemaId })
    return response.data
  }

  async listSchemas (): Promise<Components.Schemas.SchemaListModel> {
    const client = await this.getInstance()
    const response = await client.listSchemas()
    return response.data
  }

  async getData (schemaId: string, itemId: string): Promise<Components.Schemas.DataItemModel> {
    const client = await this.getInstance()
    const response = await client.getData({ schemaId, itemId })
    return response.data
  }

  async putData (schemaId: string, itemId: string, dataDoc: any): Promise<Components.Schemas.DataItemStoredModel> {
    const client = await this.getInstance()
    const response = await client.putData({ schemaId, itemId }, dataDoc)
    return response.data
  }

  async deleteData (schemaId: string, itemId: string): Promise<Components.Schemas.DataItemDeletedModel> {
    const client = await this.getInstance()
    const response = await client.deleteData({ schemaId, itemId })
    return response.data
  }

  async listData (schemaId: string): Promise<Components.Schemas.DataItemListModel> {
    const client = await this.getInstance()
    const response = await client.listItems({ schemaId })
    return response.data
  }
}
