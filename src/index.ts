import {RestUtils} from "./RestUtils";

export {RestUtils};
export interface RequestMaker<T> {
    uri(uri: string): RequestMaker<T>;
    header(header: Header): RequestMaker<T>;
    param(param: Param): RequestMaker<T>
    body(item: object): RequestMaker<T>;
    retrieve(): RequestMaker<T>;
    toEntity(): Promise<Entity<T>>;
    toVoid(): Promise<void>;
    toResponse(): Promise<Response>
}

export interface Entity<T> {
    status: number;
    data: T
}

export type Header = { [key: string]: string };
export type Param = {key: string, value: string}
export type RequestMakerConstructor = {method: string, headers?: Header, baseUri?: string};

export class RestClient {

    private readonly BASE_URI!: string;
    private readonly HEADERS!: Header;

    private constructor(uri?: string, headers?: Header) {
        if (uri) {
            this.BASE_URI = uri;
        }

        if (headers) {
            this.HEADERS = headers;
        }
    }

    static create() {
        class RestClientBuilder {
            BASE_URL = '';
            HEADERS!: Header;

            public baseUrl(url: string) {
                this.BASE_URL = url;
                return this;
            }

            public defaultHeaders(headers: Header) {
                this.HEADERS = headers;
                return this;
            }

            public build() {
                return new RestClient(this.BASE_URL, this.HEADERS);
            }
        }

        return new RestClientBuilder();
    }

    post<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'POST', headers: {'Content-type': 'application/json', ...this.HEADERS}, baseUri: this.BASE_URI
        })
    }

    get<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'GET', headers: {...this.HEADERS}, baseUri: this.BASE_URI
        })
    }

    patch<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'PATCH', headers: {'Content-type': 'application/json', ...this.HEADERS}, baseUri: this.BASE_URI
        })
    }

    put<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'PUT', headers: {'Content-type': 'application/json', ...this.HEADERS}, baseUri: this.BASE_URI
        })
    }

    delete<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'DELETE', headers: {'Content-type': 'application/json', ...this.HEADERS}, baseUri: this.BASE_URI
        })
    }
}

export class RestRequestMaker<T> implements RequestMaker<T>{

    private readonly baseUri!: string
    private readonly method!: string;
    private _headers!: Header
    private _response!: Promise<Response>;
    private _body!: string;
    private _uri!: string;
    private readonly _params!: URLSearchParams;

    constructor({method, headers, baseUri}: RequestMakerConstructor) {
        this.method = method;
        if (headers) {
            this._headers = headers;
        }
        if (baseUri) {
            this.baseUri = baseUri
        }
        this._params = new URLSearchParams();
    }


    body(item: object): RequestMaker<T> {
        this._body = JSON.stringify(item);
        return this;
    }

    header(header: Header): RequestMaker<T> {
        this._headers = {...header, ...this._headers}
        return this;
    }

    retrieve(): RequestMaker<T> {
        const uri = RestUtils.createURI({baseURI: this.baseUri, uri: this._uri, params: this._params});
        console.log(uri)
        this._response = RestUtils.performFetch({
            uri: uri,
            method: this.method,
            headers: this._headers,
            body: this._body
        });
        return this;
    }

    async toEntity(): Promise<ResponseEntity<T>> {
        const response = await this._response;
        return new ResponseEntity<T>(
            response.status,
            await response.json()
        )
    }

    async toVoid(): Promise<void> {
        return Promise.resolve(undefined);
    }

    uri(uri: string): RequestMaker<T> {
        this._uri = uri;
        return this;
    }

    async toResponse(): Promise<Response> {
        return this._response;
    }

    param(param: Param): RequestMaker<T> {
        this._params.append(param.key, param.value)
        return this;
    }
}

export class ResponseEntity<T> implements Entity<T>{
    constructor(public status: number, public data: T) {
    }
}

