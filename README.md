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

const restClient = RestClient.creat()
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


## Conclusion

This documentation covers the basic usage of the `RestClient` class for making HTTP requests. 
For more advanced usage and customization, refer to the class and method documentation in the source code.