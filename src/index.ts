import {RestUtils} from "@dota/RestUtils.ts";

export interface RequestMaker<T> {
    uri(uri: string): RequestMaker<T>;
    header(header: Header): RequestMaker<T>;
    param(param: Param): RequestMaker<T>
    body(item: object): RequestMaker<T>;
    retrieve(): RequestMaker<T>;
    toEntity(): Promise<Entity<T>>;
    toVoid(): Promise<Void>;
    toResponse(): Promise<Response>;
    timeout(timeout: number): RequestMaker<T>
}

export interface Entity<T> {
    status: number;
    data: T;
    headers?: Headers;
    type?: ResponseType;
}

export interface Void {
    status: number;
    headers: Headers;
    type: ResponseType;
}

export type Header = { [key: string]: string };
export type Param = {key: string, value: string | number};
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestSetup {
    baseUri?: string,
    method?: HttpMethod
    headers?: Header,
    timeout?: number
}


/**
 * The `RestClient` class is responsible for creating and configuring HTTP clients to make RESTful API requests.
 *
 * This class provides methods to create instances of `RestRequestMaker` for various HTTP methods such as GET, POST, PUT, PATCH, and DELETE.
 * It also includes a builder pattern for setting the base URL and default headers for the `RestClient`.
 *
 * Example usage:
 * ```typescript
 * const client = RestClient.create()
 *     .baseUrl('https://api.example.com')
 *     .defaultHeaders({ 'Authorization': 'Bearer token' })
 *     .timeout(5000)
 *     .build();
 *
 * const response = await client.get<User>().uri('/users/1').retrieve().toEntity();
 * console.log(response.data);
 */
export class RestClient {

    private readonly BASE_URI!: string;
    private readonly HEADERS!: Header;
    private readonly TIMEOUT!: number;

    private constructor(uri?: string, headers?: Header, timeout?: number) {
        if (uri) {
            this.BASE_URI = uri;
        }

        if (headers) {
            this.HEADERS = headers;
        }

        if(timeout) {
            this.TIMEOUT = timeout;
        }
    }

    /**
     * Creates a new instance of the `RestClientBuilder` class, which is used to configure and build a `RestClient` instance.
     *
     * The `RestClientBuilder` class provides methods to set the base URL and default headers for the `RestClient`.
     * Once configured, the `build` method of the `RestClientBuilder` can be called to create a new `RestClient` instance
     * with the specified base URL and headers.
     *
     * @returns A new instance of the `RestClientBuilder` class.
     */
    static create() {
        class RestClientBuilder {
            BASE_URL = '';
            HEADERS!: Header;
            TIMEOUT: number = 10000;

            /**
             * Sets the base URL for the `RestClient`.
             *
             * @param url - The base URL to be used by the `RestClient`.
             * @returns The current instance of the `RestClientBuilder` for method chaining.
             */
            public baseUrl(url: string) {
                this.BASE_URL = url;
                return this;
            }


            /**
             * Sets the default headers for the `RestClient`.
             *
             * @param headers - The headers to be used by the `RestClient`.
             * @returns The current instance of the `RestClientBuilder` for method chaining.
             */
            public defaultHeaders(headers: Header) {
                this.HEADERS = headers;
                return this;
            }


            /**
             * Use this to set a timeout period after which the `fetch` call will be aborted.
             *
             * @param timeout - Time in milliseconds after which the fetch will be aborted
             * @returns The current instance of the `RestClientBuilder` for method chaining.
             */
            public timeout(timeout: number) {
                this.TIMEOUT = timeout;
                return this;
            }


            /**
             * Builds and returns a new instance of the `RestClient` with the specified base URL and headers.
             *
             * @returns A new instance of the `RestClient` configured with the specified base URL and headers.
             */
            public build() {
                return new RestClient(this.BASE_URL, this.HEADERS, this.TIMEOUT);
            }
        }

        return new RestClientBuilder();
    }


    /**
     * Creates a new `RestRequestMaker` instance configured for a POST request.
     *
     * @typeParam T - The type of the response data.
     * @returns A new `RestRequestMaker` instance configured for a POST request.
     */
    post<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'POST',
            headers: {'Content-type': 'application/json', ...this.HEADERS},
            baseUri: this.BASE_URI,
            timeout: this.TIMEOUT
        })
    }


    /**
     * Creates a new `RestRequestMaker` instance configured for a GET request.
     *
     * @typeParam T - The type of the response data.
     * @returns A new `RestRequestMaker` instance configured for a GET request.
     */
    get<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'GET',
            headers: {...this.HEADERS},
            baseUri: this.BASE_URI,
            timeout: this.TIMEOUT
        })
    }


    /**
     * Creates a new `RestRequestMaker` instance configured for a PATCH request.
     *
     * @typeParam T - The type of the response data.
     * @returns A new `RestRequestMaker` instance configured for a PATCH request.
     */
    patch<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'PATCH',
            headers: {'Content-type': 'application/json', ...this.HEADERS},
            baseUri: this.BASE_URI,
            timeout: this.TIMEOUT
        })
    }


    /**
     * Creates a new `RestRequestMaker` instance configured for a PUT request.
     *
     * @typeParam T - The type of the response data.
     * @returns A new `RestRequestMaker` instance configured for a PUT request.
     */
    put<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'PUT',
            headers: {'Content-type': 'application/json', ...this.HEADERS},
            baseUri: this.BASE_URI,
            timeout: this.TIMEOUT
        })
    }


    /**
     * Creates a new `RestRequestMaker` instance configured for a DELETE request.
     *
     * @typeParam T - The type of the response data.
     * @returns A new `RestRequestMaker` instance configured for a DELETE request.
     */
    delete<T>(): RestRequestMaker<T> {
        return new RestRequestMaker<T>({
            method: 'DELETE',
            headers: {'Content-type': 'application/json', ...this.HEADERS},
            baseUri: this.BASE_URI,
            timeout: this.TIMEOUT
        })
    }
}


/**
 * The `RestRequestMaker` class is responsible for constructing and executing HTTP requests.
 *
 * This class provides methods to set the request URI, headers, body, and query parameters.
 * It also provides methods to initiate the request and process the response in various formats.
 *
 * @typeParam T - The type of the response data.
 */
export class RestRequestMaker<T> implements RequestMaker<T>{

    private readonly baseUri!: string
    private readonly method!: HttpMethod;
    private _headers!: Header;
    private _timeout!: number;
    private _response!: Promise<Response>;
    private _body!: string;
    private _uri!: string;
    private readonly _params!: URLSearchParams;

    constructor(requestSetup: RequestSetup) {
        const {method, headers, baseUri, timeout} = requestSetup;
        if(method) {
            this.method = method;
        }
        if (headers) {
            this._headers = headers;
        }
        if (baseUri) {
            this.baseUri = baseUri
        }

        if (timeout) {
            this._timeout = timeout;
        }

        this._params = new URLSearchParams();
    }


    /**
     * Sets the request body with the provided item.
     *
     * @param item - The object to be used as the request body.
     * @returns The current instance of the `RestRequestMaker` for method chaining.
     */
    body(item: object): RequestMaker<T> {
        this._body = JSON.stringify(item);
        return this;
    }


    /**
     * Adds the provided header to the request.
     *
     * @param header - The header to be added to the request.
     * @returns The current instance of the `RestRequestMaker` for method chaining.
     */
    header(header: Header): RequestMaker<T> {
        this._headers = {...header, ...this._headers}
        return this;
    }


    /**
     * Initiates the fetch request with the configured URI, method, headers, and body.
     *
     * @returns The current instance of the `RestRequestMaker` for method chaining.
     */
    retrieve(): RequestMaker<T> {
        const uri = RestUtils.createURI({baseURI: this.baseUri, uri: this._uri, params: this._params});
        this._response = RestUtils.performFetch({
            uri: uri,
            method: this.method,
            headers: this._headers,
            body: this._body,
            timeout: this._timeout
        });
        return this;
    }


    /**
     * Converts the response to an `Entity` object containing the status and data.
     *
     * @returns A promise that resolves to an `Entity` object containing the response status and data.
     */
    async toEntity(): Promise<ResponseEntity<T>> {
        const response = await this._response;
        const entity = ResponseEntity.create<T>(response);

        const contentType = response.headers.get('Content-Type');
        if(contentType && contentType.includes('application/json')) {
            entity.data = await response.json();
        } else {
            entity.data = await response.text() as unknown as T;
        }
        return entity;
    }


    /**
     * Converts the response to void.
     *
     * @returns A promise that resolves to void.
     */
    async toVoid(): Promise<Void> {
        const response = await this._response;
        return ResponseVoid.create(response);
    }


    /**
     * Sets the URI for the request.
     *
     * @param uri - The URI to be used for the request.
     * @returns The current instance of the `RestRequestMaker` for method chaining.
     */
    uri(uri: string): RequestMaker<T> {
        this._uri = uri;
        return this;
    }


    /**
     * Converts the response to a `Response` object.
     *
     * @returns A promise that resolves to a `Response` object.
     */
    async toResponse(): Promise<Response> {
        return this._response;
    }


    /**
     * Adds a query parameter to the request URI.
     *
     * @param param - The query parameter to be added to the request URI.
     * @returns The current instance of the `RestRequestMaker` for method chaining.
     */
    param(param: Param): RequestMaker<T> {
        this._params.append(param.key, param.value.toString())
        return this;
    }


    /**
     * Update the timeout to the fetch call.
     * @param timeout - The time in millisecond to be assigned to fetch before abort.
     * @return The current instance of the `RestRequestMaker` for method chaining.
     */
    timeout(timeout: number): RequestMaker<T> {
        this._timeout = timeout;
        return this;
    }
}


/**
 * The `ResponseEntity` class represents the response from an HTTP request.
 *
 * This class encapsulates the response data, status, headers, and type.
 * It provides a structured way to handle and access the response information.
 *
 * @typeParam T - The type of the response data.
 */
export class ResponseEntity<T> implements Entity<T>{
    public data!: T;


    private constructor(
        public readonly status: number,
        public readonly headers: Headers,
        public readonly type: ResponseType,
        public readonly statusText: string,
        public readonly isRedirected: boolean,
    ) {
    }

    static create<T>(response: Response) {
        return new ResponseEntity<T>(
            response.status, response.headers, response.type, response.statusText, response.redirected,
        );
    }
}


/**
 * The `ResponseVoid` class represents an HTTP response with no body content.
 *
 * This class encapsulates the response status, headers, and type.
 * It provides a structured way to handle and access the response information when no body content is expected.
 */
export class ResponseVoid implements Void{


    private constructor(
        public readonly status: number,
        public readonly headers: Headers,
        public readonly type: ResponseType,
        public readonly statusText: string,
        public readonly isRedirected: boolean,
    ) {
    }

    static create(response: Response) {
        return new ResponseVoid(
            response.status, response.headers, response.type, response.statusText, response.redirected,
        );
    }
}
