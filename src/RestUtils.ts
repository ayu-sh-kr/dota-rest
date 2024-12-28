import {Header} from "./index";

export class RestUtils {
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