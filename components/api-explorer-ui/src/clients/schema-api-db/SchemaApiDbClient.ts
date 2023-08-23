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
      axiosConfigDefaults: serverInfo
    })

    return await client.getClient<Client>()
  }

  async getStatus (): Promise<Components.Schemas.StatusResponseModel> {
    const client = await this.getInstance()
    const response = await client.getStatus()
    return response.data
  }
}
