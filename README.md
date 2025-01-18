# Project Documentation

## Overview

This project provides a `RestClient` class for creating and configuring HTTP clients to make RESTful API requests. It includes methods for various HTTP methods such as GET, POST, PUT, PATCH, and DELETE.

## Installation

To install the project dependencies, run:

```bash
npm install @ayu-sh-kr/dota-rest
```

## Usage

### Initializing the RestClient

To create and configure an instance of `RestClient`, use the `RestClientBuilder`:

```typescript
import {RestClient} from "@ayu-sh-kr/dota-rest";

const client = RestClient.create()
    .baseUrl('https://api.example.com')
    .defaultHeaders({'Authorization': 'Bearer token'})
    .build();
```

### Performing Requests

#### GET Request

To perform a GET request:

```typescript
const response = await client.get<User>()
    .uri('/users/1')
    .retrieve()
    .toEntity();

console.log(response.data);
```

#### POST Request

To perform a POST request:

```typescript
const response = await client.post<User>()
    .uri('/users')
    .body({ name: 'John Doe', email: 'john.doe@example.com' })
    .retrieve()
    .toEntity();

console.log(response.data);
```

#### PUT Request

To perform a PUT request:

```typescript
const response = await client.put<User>()
    .uri('/users/1')
    .body({ name: 'John Doe', email: 'john.doe@example.com' })
    .retrieve()
    .toEntity();

console.log(response.data);
```

#### PATCH Request

To perform a PATCH request:

```typescript
const response = await client.patch<User>()
    .uri('/users/1')
    .body({ email: 'john.newemail@example.com' })
    .retrieve()
    .toEntity();

console.log(response.data);
```

#### DELETE Request

To perform a DELETE request:

```typescript
const response = await client.delete<void>()
    .uri('/users/1')
    .retrieve()
    .toVoid();

console.log('User deleted');
```

#### Resolving request to response
To get the `Response` object of the fetch request and taking action as per your requirement.

```typescript
const response = await client.get<User>()
    .url('/users/1')
    .retreive()
    .toResponse()

console.log(response.status)
const data = await response.json();
console.log(data)
```

#### Creating `RestClient` with timeout
By default the client have a timout of 10s but it can be changed during the build of `RestClient` or 
during making the request.

Adding timeout during client buildup.
```typescript
import {RestClient} from "@ayu-sh-kr/rest";

const restClient = RestClient.create()
    .baseUrl('http://localhost:8080')
    .defaultHeaders({'Authorization': 'Bearer kh.....'})
    .timeout(5000)
    .build();
```

Adding timeout during client setup.
```typescript
const response = await client.get<User>()
    .url('/users/1')
    .timeout(5000)
    .retreive()
    .toResponse()
```

#### Response Handler
`RestClient` provide ability to set response handler which can be used to process response before resolving to
`toEntity`, `toVoid` or `toReponse`. Response handler is function with one parameter `response` object should be 
used to check the response for required `status` and prepare the error if the result is not favourable.

Current implementation of response handler return void to keep it simple and provide bare minimum feature to user
in order to reduce duplicate code error handling where same logic is implemented across the code.

##### Request processing without response handling
Here is an example of how to perform request without using a response handler:
```typescript
import { RestClient } from "@ayu-sh-kr/dota-rest";

// Create a RestClient instance without a response handler
const client = RestClient.create()
    .baseUrl('https://api.example.com')
    .defaultHeaders({ 'Authorization': 'Bearer token' })
    .build();

// Perform a GET request without the response handler
const response = await client.get<User>()
    .uri('/users/1')
    .retrieve()
    .toEntity();

if (response.status !== 200) {
    throw new Error(`Request failed with status code ${response.status}`);
}

console.log(response.data);
```

##### Request processing with a response handler
Here is an example of how to use a response handler to process the response:
```typescript
import { RestClient } from "@ayu-sh-kr/dota-rest";

// Define the response handler
const responseHandler = (response: Response) => {
    if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
    }
};

// Create a RestClient instance with the response handler
const client = RestClient.create()
    .baseUrl('https://api.example.com')
    .defaultHeaders({ 'Authorization': 'Bearer token' })
    .handler(responseHandler)
    .build();

// Perform a GET request with the response handler
const response = await client.get<User>()
    .uri('/users/1')
    .retrieve()
    .toEntity();

console.log(response.data);
```

Using a response handler simplifies the error handling logic by centralizing the response processing in a single function, reducing duplicate code and making the request handling more consistent.

## Conclusion

This documentation covers the basic usage of the `RestClient` class for making HTTP requests. 
For more advanced usage and customization, refer to the class and method documentation in the source code.