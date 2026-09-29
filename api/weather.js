module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
  if (!city || city.length > 100) {
    return res.status(400).json({ error: 'Enter a city name (up to 100 characters).' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Weather service is not configured.' });
  }

  try {
    const geocodingUrl = new URL('https://api.openweathermap.org/geo/1.0/direct');
    geocodingUrl.search = new URLSearchParams({ q: city, limit: '1', appid: apiKey });

    const geocodingResponse = await fetch(geocodingUrl);
    if (!geocodingResponse.ok) {
      return res.status(502).json({ error: 'Weather service is temporarily unavailable.' });
    }

    const [location] = await geocodingResponse.json();
    if (!location) {
      return res.status(404).json({ error: 'City not found. Check the spelling and try again.' });
    }

    const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    weatherUrl.search = new URLSearchParams({
      lat: String(location.lat),
      lon: String(location.lon),
      appid: apiKey,
      units: 'metric',
    });

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      return res.status(502).json({ error: 'Weather service is temporarily unavailable.' });
    }

    const weather = await weatherResponse.json();
    const condition = weather.weather[0];

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res.status(200).json({
      city: weather.name,
      country: weather.sys.country,
      group: condition.main,
      description: condition.description,
      iconUrl: `https://openweathermap.org/img/wn/${condition.icon}@2x.png`,
      temp: Math.round(weather.main.temp),
      feelsLike: Math.round(weather.main.feels_like),
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
    });
  } catch {
    return res.status(502).json({ error: 'Weather service is temporarily unavailable.' });
  }
};