import {RestRequestMaker} from '@dota/index';

describe('RestRequestMaker', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should perform a fetch request with the correct parameters', async () => {
        const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

        const requestMaker = new RestRequestMaker({
            method: 'GET',
            baseUri: 'https://api.example.com',
            timeout: 5000
        });

        requestMaker.uri('/test').retrieve();
        const response = await requestMaker.toEntity();

        expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/test', expect.objectContaining({
            method: 'GET',
            signal: expect.any(AbortSignal)
        }));
        expect(response.data).toEqual({ data: 'test' });
    });

    it('should handle fetch request timeout', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(
            () => new Promise(
                (_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)
            )
        );

        const requestMaker = new RestRequestMaker({
            method: 'GET',
            baseUri: 'https://api.example.com',
            timeout: 5000
        });

        requestMaker.uri('/test').retrieve();

        await expect(requestMaker.toEntity()).rejects.toThrow('timeout');
    }, 10000); // Increased timeout to 10 seconds

    it('should perform a POST request with the correct parameters', async () => {
        const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

        const requestMaker = new RestRequestMaker({
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            baseUri: 'https://api.example.com',
            timeout: 5000
        });

        requestMaker.uri('/test').body({ key: 'value' }).retrieve();
        const response = await requestMaker.toEntity();

        expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/test', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ key: 'value' }),
            headers: { 'Content-Type': 'application/json' },
            signal: expect.any(AbortSignal)
        }));
        expect(response.data).toEqual({ data: 'test' });
    });

    it('should handle 404 error response based on user-defined behavior', async () => {
        const mockResponse = new Response(JSON.stringify({ error: 'Not Found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);


        const requestMaker = new RestRequestMaker({
            method: 'GET',
            baseUri: 'https://api.example.com',
            timeout: 5000,
        });

        requestMaker.uri('/not-found').retrieve();
        const response = await requestMaker.toEntity();

        expect(response.status).toEqual(404);
        expect(response.data).toEqual({ error: 'Not Found' })
    });

    it('should append query parameters correctly', async () => {
        const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

        const requestMaker = new RestRequestMaker({
            method: 'GET',
            baseUri: 'https://api.example.com',
            timeout: 5000
        });

        requestMaker.uri('/test').param({key: 'key', value: 'value'}).retrieve();
        const response = await requestMaker.toEntity();

        expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/test?key=value', expect.objectContaining({
            method: 'GET',
            signal: expect.any(AbortSignal)
        }));
        expect(response.data).toEqual({ data: 'test' });
    });
});