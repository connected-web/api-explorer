import OpenAPIClientAxios, { OpenAPIV3 } from 'openapi-client-axios'
import OpenAPIDocument from './boardgames-api-services.json'
import Auth from '../../login/Auth'
import { Client, Components } from './BoardGamesAPIClientTypes'

interface ServerInfo {
  baseURL: string
  headers: {
    [param: string]: string
  }
}

async function getServerInfo (): Promise<ServerInfo> {
  const authToken = await Auth.getLatestAccessToken()
  const server: ServerInfo = {
    baseURL: 'https://boardgames-api.prod.connected-web.services',
    headers: {
      Authorization: `Bearer ${authToken as string}`
    }
  }

  return server
}

function validateStatus (status: number): boolean {
  return status >= 200 && status < 600; // default
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
      axiosConfigDefaults: Object.assign({}, serverInfo, { validateStatus }),
    })

    return await client.getClient<Client>()
  }

  async getStatus (): Promise<Components.Schemas.StatusResponseModel> {
    const client = await this.getInstance()
    const response = await client.getStatus()
    return response.data
  }

  async listPlayRecords (): Promise<Components.Schemas.PlayRecordsModel> {
    const client = await this.getInstance()
    const response = await client.listPlayRecords()
    return response.data
  }

  async listPlayRecordsByDate (dateCode: string): Promise<Components.Schemas.PlayRecordsModel> {
    const client = await this.getInstance()
    const response = await client.listPlayRecordsByDate({ dateCode })
    return response.data
  }

  async createPlayRecord (playRecord: any): Promise<Components.Schemas.BasicObjectModel> {
    const client = await this.getInstance()
    const response = await client.createPlayRecord(null, playRecord)
    return response.data
  }

  async deletePlayRecord (keypath: string): Promise<Components.Schemas.BasicObjectModel> {
    const client = await this.getInstance()
    const response = await client.deletePlayRecord(null, { keypath })
    return response.data
  }

  async helloWorld (name: string): Promise<Components.Schemas.MessageResponseModel> {
    const client = await this.getInstance()
    const response = await client.helloWorld({ name })
    return response.data
  }
}
