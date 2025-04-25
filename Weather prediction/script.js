// API Configuration
const API_KEY = '596975fb4f9cc66537bb6033d59dfa2c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const cityName = document.getElementById('city-name');
const currentTemp = document.getElementById('current-temp');
const weatherDesc = document.getElementById('weather-desc');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');

// Theme Management
let darkMode = localStorage.getItem('darkMode') !== 'false';
if (!darkMode) document.body.classList.add('light-mode');

themeToggle.addEventListener('click', toggleTheme);

function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('light-mode');
  localStorage.setItem('darkMode', darkMode);
}

// Fetch Weather Data
async function fetchWeather(city) {
  try {
    const currentResponse = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`API Error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();
    
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`API Error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();
    updateUI(currentData, forecastData);
    
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    alert(`Error: ${error.message}. Please check the city name and try again.`);
  }
}

// Update UI with Weather Data
function updateUI(currentData, forecastData) {
  // Current weather
  cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
  currentTemp.textContent = `${Math.round(currentData.main.temp)}°C`;
  weatherDesc.textContent = currentData.weather[0].description;
  
  // Weather icon
  const iconCode = currentData.weather[0].icon;
  weatherIcon.className = `wi wi-owm-${iconCode}`;
  
  // Weather details
  humidity.textContent = `${currentData.main.humidity}%`;
  wind.textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`;
  pressure.textContent = `${currentData.main.pressure} hPa`;

  // 5-Day Forecast
  forecastContainer.innerHTML = '';
  const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0);
  
  dailyForecast.slice(0, 5).forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
    
    const forecastDay = document.createElement('div');
    forecastDay.className = 'forecast-day';
    forecastDay.innerHTML = `
      <div>${dayName}</div>
      <i class="wi wi-owm-${day.weather[0].icon}"></i>
      <div>${Math.round(day.main.temp)}°C</div>
    `;
    forecastContainer.appendChild(forecastDay);
  });

  // Update background based on weather
  updateBackground(currentData.weather[0].main);
}

// Change background based on weather
function updateBackground(weatherCondition) {
  const body = document.body;
  const conditions = {
    'Clear': 'linear-gradient(135deg, #1a1a2e 0%, #3a3a5e 100%)',
    'Clouds': 'linear-gradient(135deg, #1a1a2e 0%, #4a4a6e 100%)',
    'Rain': 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%)',
    'Snow': 'linear-gradient(135deg, #1a1a2e 0%, #5a5a8e 100%)',
    'Thunderstorm': 'linear-gradient(135deg, #1a1a1e 0%, #3a3a3e 100%)',
    'default': 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%)'
  };

  const gradient = conditions[weatherCondition] || conditions['default'];
  body.style.backgroundImage = gradient;
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  const location = locationInput.value.trim();
  if (location) fetchWeather(location);
});

locationInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const location = locationInput.value.trim();
    if (location) fetchWeather(location);
  }
});

// Initialize with default city
fetchWeather('London');