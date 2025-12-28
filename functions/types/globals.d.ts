declare module "@azure/functions" {
  export interface HttpRequest {
    method?: string;
    url?: string;
    headers: { [key: string]: any };
    query?: { [key: string]: any };
    body?: any;
    params?: { [key: string]: any };
  }

  export interface Context {
    invocationId?: string;
    executionContext?: any;
    bindings: { [key: string]: any };
    bindingData: { [key: string]: any };
    req: HttpRequest;
    res?: any;
    log: any;
    done?: (err?: any, result?: any) => void;
  }

  export type AzureFunction = (context: Context, req: HttpRequest) => Promise<void> | void;

  export interface HttpResponse {
    status?: number;
    body?: any;
    headers?: { [key: string]: string };
  }
}

declare module "bcryptjs";
declare module "uuid";
declare module "mssql" {
  const mssql: any;
  export default mssql;
}
declare module "jsonwebtoken";
declare module "@azure/keyvault-secrets";
