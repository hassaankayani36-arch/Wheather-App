const handler = require('../api/weather');

function createResponse() {
    return {
        headers: {},
        statusCode: null,
        body: null,
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

describe('weather API handler', () => {
    const originalFetch = global.fetch;
    const originalApiKey = process.env.OPENWEATHER_API_KEY;

    beforeEach(() => {
        global.fetch = jest.fn();
        process.env.OPENWEATHER_API_KEY = 'test-key';
    });

    afterAll(() => {
        global.fetch = originalFetch;
        if (originalApiKey === undefined) {
            delete process.env.OPENWEATHER_API_KEY;
        } else {
            process.env.OPENWEATHER_API_KEY = originalApiKey;
        }
    });

    test('returns normalized weather without exposing the upstream response', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: 31.55, lon: 74.34 }],
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    name: 'Lahore',
                    sys: { country: 'PK' },
                    weather: [{ main: 'Clouds', description: 'broken clouds', icon: '04d' }],
                    main: { temp: 31.6, feels_like: 35.2, humidity: 48 },
                    wind: { speed: 2.5 },
                }),
            });
        const response = createResponse();

        await handler({ method: 'GET', query: { city: 'Lahore' } }, response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            city: 'Lahore',
            country: 'PK',
            group: 'Clouds',
            description: 'broken clouds',
            iconUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
            temp: 32,
            feelsLike: 35,
            humidity: 48,
            windSpeed: 2.5,
        });
        expect(response.headers['Cache-Control']).toContain('s-maxage=600');
        expect(global.fetch.mock.calls[0][0].searchParams.get('appid')).toBe('test-key');
    });

    test('rejects an empty city without calling OpenWeather', async () => {
        const response = createResponse();

        await handler({ method: 'GET', query: { city: '  ' } }, response);

        expect(response.statusCode).toBe(400);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('returns not found when geocoding has no match', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        const response = createResponse();

        await handler({ method: 'GET', query: { city: 'Unknown place' } }, response);

        expect(response.statusCode).toBe(404);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});