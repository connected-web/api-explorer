import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig
} from 'openapi-client-axios'

declare namespace Components {
  namespace Schemas {
    /**
         * Basic Object
         * A basic JSON object with key value pairs
         */
    export interface BasicObjectModel {
      [name: string]: any
    }
    /**
         * Schema Delete
         */
    export interface SchemaDeleteResponseModel {
      message: string
    }
    /**
         * Schema Not Found
         */
    export interface SchemaGetNotFoundModel {
      message: string
    }
    /**
         * Stored Schema
         */
    export interface SchemaGetResponseModel {
      $schema: string
      title: string
    }
    /**
         * List Schemas
         */
    export interface SchemaListResponseModel {
      schemaIds?: string[]
    }
    /**
         * Schema Put
         */
    export interface SchemaPutResponseModel {
      message: string
    }
    /**
         * Status
         */
    export interface StatusResponseModel {
      /**
             * The UTC timestamp representing the last time the server was updated
             */
      deploymentTime: string
    }
  }
}
declare namespace Paths {
  namespace DeleteSchema {
    namespace Parameters {
      export type SchemaId = string
    }
    export interface PathParameters {
      schemaId: Parameters.SchemaId
    }
    namespace Responses {
      export type $200 = /* Schema Delete */ Components.Schemas.SchemaDeleteResponseModel
    }
  }
  namespace GetOpenAPISpec {
    namespace Responses {
      export type $200 = /**
             * Basic Object
             * A basic JSON object with key value pairs
             */
            Components.Schemas.BasicObjectModel
    }
  }
  namespace GetSchema {
    namespace Parameters {
      export type SchemaId = string
    }
    export interface PathParameters {
      schemaId: Parameters.SchemaId
    }
    namespace Responses {
      export type $200 = /* Stored Schema */ Components.Schemas.SchemaGetResponseModel
      export type $404 = /* Schema Not Found */ Components.Schemas.SchemaGetNotFoundModel
    }
  }
  namespace GetStatus {
    namespace Responses {
      export type $200 = /* Status */ Components.Schemas.StatusResponseModel
    }
  }
  namespace ListSchemas {
    namespace Responses {
      export type $200 = /* List Schemas */ Components.Schemas.SchemaListResponseModel
    }
  }
  namespace PutSchema {
    namespace Parameters {
      export type SchemaId = string
    }
    export interface PathParameters {
      schemaId: Parameters.SchemaId
    }
    namespace Responses {
      export type $200 = /* Schema Put */ Components.Schemas.SchemaPutResponseModel
    }
  }
  namespace Schema$SchemaId {
    namespace Options {
      namespace Parameters {
        export type SchemaId = string
      }
      export interface PathParameters {
        schemaId: Parameters.SchemaId
      }
    }
  }
}

export interface OperationMethods {
  /**
   * getSchema
   */
  'getSchema': (
    parameters?: Parameters<Paths.GetSchema.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetSchema.Responses.$200>
  /**
   * putSchema
   */
  'putSchema': (
    parameters?: Parameters<Paths.PutSchema.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.PutSchema.Responses.$200>
  /**
   * deleteSchema
   */
  'deleteSchema': (
    parameters?: Parameters<Paths.DeleteSchema.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.DeleteSchema.Responses.$200>
  /**
   * getStatus
   */
  'getStatus': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetStatus.Responses.$200>
  /**
   * getOpenAPISpec
   */
  'getOpenAPISpec': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.GetOpenAPISpec.Responses.$200>
  /**
   * listSchemas
   */
  'listSchemas': (
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig
  ) => OperationResponse<Paths.ListSchemas.Responses.$200>
}

export interface PathsDictionary {
  ['/schema/{schemaId}']: {
    /**
     * getSchema
     */
    'get': (
      parameters?: Parameters<Paths.GetSchema.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetSchema.Responses.$200>
    /**
     * putSchema
     */
    'put': (
      parameters?: Parameters<Paths.PutSchema.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.PutSchema.Responses.$200>
    /**
     * deleteSchema
     */
    'delete': (
      parameters?: Parameters<Paths.DeleteSchema.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.DeleteSchema.Responses.$200>
  }
  ['/status']: {
    /**
     * getStatus
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetStatus.Responses.$200>
  }
  ['/schema']: {
  }
  ['/openapi']: {
    /**
     * getOpenAPISpec
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.GetOpenAPISpec.Responses.$200>
  }
  ['/schemas']: {
    /**
     * listSchemas
     */
    'get': (
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig
    ) => OperationResponse<Paths.ListSchemas.Responses.$200>
  }
  ['/']: {
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
