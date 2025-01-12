import {Entity, ResponseEntity, RestClient} from "@dota/index.ts";

describe('RestClient', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should create a RestClient with the correct baseUrl, headers, and timeout', () => {
        const client = RestClient.create()
            .baseUrl('https://api.example.com')
            .defaultHeaders({ 'Authorization': 'Bearer token' })
            .timeout(5000)
            .build();

        expect(client).toMatchObject({
            "HEADERS": { 'Authorization': 'Bearer token' },
            "BASE_URI": 'https://api.example.com',
            "TIMEOUT": 5000
        })
    });

    it('should create a RestRequestMaker with header POST, baseUrl and timeout', () => {
        const client = RestClient.create()
            .baseUrl('https://api.example.com')
            .timeout(5000)
            .build();

        const requestMaker = client.post();

        expect(requestMaker).toHaveProperty("method", 'POST')
        expect(requestMaker).toHaveProperty("baseUri", 'https://api.example.com')
        expect(requestMaker).toHaveProperty("_headers", {"Content-type": "application/json"})
    });

    it('should make a GET request and return the response entity', async () => {
        const mockResponse = new Response(JSON.stringify({ key: 'value' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

        const client = RestClient.create()
            .baseUrl('https://api.example.com')
            .defaultHeaders({ 'Authorization': 'Bearer token' })
            .timeout(5000)
            .build();

        const response: Entity<{ key: string }> = await client.get<{ key: string }>()
            .uri('/test')
            .retrieve()
            .toEntity();

        expect(response.status).toBe(200);
        expect(response.data).toEqual({ key: 'value' });
    });
});