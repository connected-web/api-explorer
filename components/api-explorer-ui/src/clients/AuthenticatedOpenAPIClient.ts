import axios, { AxiosRequestConfig } from 'axios'
import OpenAPIClient from './OpenAPIClient'
import Auth from '../login/Auth'

export default class AuthenticatedOpenAPIClient extends OpenAPIClient {

  constructor (openApiDocument?: any, callOperation?: (baseURL: string, operationDetails:any, params:any[], payload?:any) => Promise<any>) {
    super(openApiDocument, callOperation ?? AuthenticatedOpenAPIClient.prototype.callOperation)
  }

  protected async callOperation (baseURL: string, operationDetails: any, params: any, payload: any): Promise<any> {
    const { method, path } = operationDetails
    const serviceUrl = `${baseURL}${String(path)}`.replace(/{([^}]+)}/g, (_, paramName) => {
      return params[paramName] ?? `${String(paramName)}:undefined`
    })

    const token = await Auth.getLatestAccessToken() // Get the authentication token
    if (token === false) {
      throw new Error('Unable to find a user authentication token')
    }

    const axiosConfig: AxiosRequestConfig = {
      method,
      url: serviceUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${String(token)}`
      },
      data: payload,
      validateStatus: (status) => {
        // Allow all HTTP status codes within the valid range (100 to 599)
        return status >= 100 && status <= 599
      }
    }

    try {
      const response = await axios(axiosConfig)
      return response.data
    } catch (ex) {
      const error = ex as Error
      console.error('Error calling operation', operationDetails?.operationId, error, 'with', { params, payload })
      throw new Error(`Error calling operation ${String(operationDetails?.operationId)}: ${error.message}`)
    }
  }
}
