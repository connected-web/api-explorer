import OpenAPIClientAxios, { OpenAPIV3 } from 'openapi-client-axios'
import BoardgamesAPIDocument from './boardgames-api-services.json'
import Auth from '../login/Auth'
import { Client } from './BoardGamesAPIClientTypes'

interface ServerInfo {
  baseUrl: string
  headers: {
    [param: string]: string
  }
}

async function getServerInfo (): Promise<ServerInfo> {
  const authToken = await Auth.getLatestAccessToken()
  const server: ServerInfo = {
    baseUrl: 'https://boardgames-api.prod.connected-web.services',
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
      definition: BoardgamesAPIDocument as OpenAPIV3.Document,
      axiosConfigDefaults: { headers: serverInfo.headers }
    })

    return await client.getClient<Client>()
  }
}
