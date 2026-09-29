import { useState } from 'react';
import './App.css';

function App() {
  //  States
  const [weatherState, setWeatherState] = useState(null);
  const [cityInput, setCityInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  async function fetchWeatherObject(city) {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city.trim())}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Could not fetch weather. Please try again.');
    }

    setWeatherState(data);
  }

  //  Jab input box mein kuch type ho
  function handleInputChange(e) {
    setCityInput(e.target.value);
  }

  //  Jab button dabaya jaye ya form submit ho
  async function handleClick(e) {
    e.preventDefault();

    if (cityInput.trim() === "") {
      setErrorMessage("Please enter a city");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    setWeatherState(null);

    try {
      await fetchWeatherObject(cityInput);
    } catch (err) {
      setErrorMessage(err.message || 'Weather service is unavailable. Please try again.');
    }

    setIsLoading(false);
  }

  //  ---- Yahan decide karte hain ke UI mein kya dikhana hai ----

  let loadingBox = null;
  if (isLoading === true) {
    loadingBox = (
      <p className="loading-text" role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        Finding the latest conditions...
      </p>
    );
  }
  let errorBox = null;
  if (errorMessage !== "") {
    errorBox = <p className="error-text" id="search-error" role="alert">{errorMessage}</p>;
  }

  let weatherBox = null;
  if (weatherState != null) {
    weatherBox = (
      <section className="weather-card" aria-label={`Current weather in ${weatherState.city}`}>
        <div className="weather-card-header">
          <div>
            <p className="eyebrow">WEATHER RIGHT NOW</p>
            <h2>{weatherState.city}<span>, {weatherState.country}</span></h2>
          </div>
          <span className="condition-tag">{weatherState.group}</span>
        </div>

        <div className="weather-current">
          <img src={weatherState.iconUrl} alt={weatherState.description} />
          <div className="temperature-block">
            <p className="temperature">{weatherState.temp}<span>°C</span></p>
            <p className="condition-description">{weatherState.description}</p>
          </div>
        </div>

        <div className="weather-metrics">
          <article className="metric">
            <span className="metric-icon feels-icon" aria-hidden="true" />
            <div><p>Feels like</p><strong>{weatherState.feelsLike}°C</strong></div>
          </article>
          <article className="metric">
            <span className="metric-icon humidity-icon" aria-hidden="true" />
            <div><p>Humidity</p><strong>{weatherState.humidity}%</strong></div>
          </article>
          <article className="metric">
            <span className="metric-icon wind-icon" aria-hidden="true" />
            <div><p>Wind</p><strong>{weatherState.windSpeed} m/s</strong></div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <main className="App">
      <div className="weather-shell">
        <header className="topbar">
          <a className="brand" href="/" aria-label="Skycast home">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span>skycast<span className="brand-period">.</span></span>
          </a>
          <span className="topbar-note"><span className="live-dot" /> LIVE WEATHER / WORLDWIDE</span>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">YOUR DAY, IN CLEARER VIEW</p>
            <h1 id="page-title">Weather that<br /><em>moves with you.</em></h1>
            <p className="intro-text">A little more context for wherever the day takes you.</p>
          </div>

          <div className="search-area">
            <label className="search-label" htmlFor="city-search">LOOK UP A CITY</label>
            <form className="search-form" onSubmit={handleClick}>
              <input
                id="city-search"
                type="text"
                placeholder="Try Lahore or London"
                value={cityInput}
                onChange={handleInputChange}
                autoComplete="off"
                aria-describedby={errorMessage ? 'search-error' : undefined}
              />
              <button type="submit" disabled={isLoading}>
                <span>{isLoading ? 'Searching' : 'Search weather'}</span>
                <span className="search-arrow" aria-hidden="true">↗</span>
              </button>
            </form>
            {loadingBox}
            {errorBox}
          </div>
        </section>

        {weatherBox || (
          <section className="weather-empty" aria-label="Weather search welcome">
            <div className="empty-copy">
              <p className="eyebrow">A FRESH PERSPECTIVE</p>
              <h2>Your forecast<br />starts <em>here.</em></h2>
              <p>Choose a city to see the weather taking shape.</p>
            </div>
            <div className="empty-art" aria-hidden="true">
              <span className="sun-disc" />
              <img src="https://openweathermap.org/img/wn/04d@2x.png" alt="" />
              <span className="art-caption">OUTSIDE, RIGHT NOW</span>
            </div>
            <span className="empty-index" aria-hidden="true">01</span>
          </section>
        )}

        <footer className="footer">
          <span><span className="footer-mark" /> WEATHER DATA BY OPENWEATHER</span>
          <span>MADE FOR THE MOMENT</span>
        </footer>
      </div>
    </main>
  );
}

export default App;