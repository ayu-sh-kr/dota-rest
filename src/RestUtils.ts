import {Header} from "./index";

export class RestUtils {

    /**
     * Creates a full URI by combining the base URI, path, and query parameters.
     *
     * @param options - The options for creating the URI.
     * @param options.baseURI - The base URI to prepend to the path.
     * @param options.uri - The path or endpoint to append to the base URI.
     * @param options.params - The query parameters to append to the URI.
     * @returns The full URI with the base URI, path, and query parameters.
     */
    static createURI = ({baseURI, uri, params}: { baseURI?: string, uri: string, params?: URLSearchParams }) => {
        if (baseURI) {
            let url = `${baseURI}${uri}`;
            if(params && params.size > 0) {
                return `${url}?${params.toString()}`
            }

            return url;
        }

        if(params && params.size > 0) {
            return `${uri}?${params.toString()}`
        }

        return uri;
    }


    /**
     * Performs a fetch request with the specified URI, method, headers, and body.
     *
     * @param options - The options for performing the fetch request.
     * @param options.uri - The URI to which the request is sent.
     * @param options.method - The HTTP method to use for the request (e.g., 'GET', 'POST').
     * @param options.headers - Optional headers to include in the request.
     * @param options.body - Optional body content to include in the request.
     * @returns A promise that resolves to the response of the fetch request.
     */
    static performFetch = ({uri, method, headers, body}: {
        uri: string,
        method: string,
        headers?: Header,
        body?: string
    }) => {
        const requestInit: RequestInit = {
            method: method
        }

        if(headers) {
            requestInit.headers = headers;
        }

        if (body) {
            requestInit.body = body;
        }

        return fetch(uri, requestInit)
    }
}