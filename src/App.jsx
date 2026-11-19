import React, { useState, useEffect } from 'react';
import { LOCATION_PRESETS, STORM_PRESETS } from './utils/weatherPresets';
import { audioSynth } from './utils/soundSynthesizer';

import RainCanvas from './components/RainCanvas';
import DopplerRadar from './components/DopplerRadar';
import MetricsGrid from './components/MetricsGrid';
import ForecastCharts from './components/ForecastCharts';
import FloodAlertPanel from './components/FloodAlertPanel';
import ScenarioSimulator from './components/ScenarioSimulator';
import DataExporter from './components/DataExporter';
import LabPredictor from './components/LabPredictor';
import GoogleMapView from './components/GoogleMapView';
import CropIrrigationCalc from './components/CropIrrigationCalc';
import RainHarvestingCalc from './components/RainHarvestingCalc';
import RoadSafetyMeter from './components/RoadSafetyMeter';
import DatasetManagerModal from './components/DatasetManagerModal';

import {
  CloudRain,
  MapPin,
  Volume2,
  VolumeX,
  Search,
  Zap,
  Navigation,
  Loader2,
  Database
} from 'lucide-react';

export default function App() {
  const [selectedLocationId, setSelectedLocationId] = useState(LOCATION_PRESETS[0].id);
  const [customSearch, setCustomSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(LOCATION_PRESETS[0]);
  const [currentIntensity, setCurrentIntensity] = useState(LOCATION_PRESETS[0].currentIntensity);
  const [activePresetId, setActivePresetId] = useState(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [datasetRecordCount, setDatasetRecordCount] = useState(8000);
  const [forecastData, setForecastData] = useState(null);

  // Fetch active dataset record count from server
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dataset/info')
      .then((res) => res.json())
      .then((data) => {
        if (data.total_records) setDatasetRecordCount(data.total_records);
      })
      .catch(() => {});
  }, []);

  const handleDatasetUpdated = (data) => {
    if (data && data.total_records) {
      setDatasetRecordCount(data.total_records);
    }
  };

  // Unified Accurate Weather Fetcher (WMO & Google Weather Grade)
  const fetchAccurateWeather = async ({ query = null, lat = null, lon = null }) => {
    // 1. Try our unified backend meteorological proxy first
    try {
      const url = query
        ? `http://127.0.0.1:8000/api/weather/live?query=${encodeURIComponent(query)}`
        : `http://127.0.0.1:8000/api/weather/live?lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Backend weather proxy unavailable, trying direct API:', e);
    }

    // 2. Direct Open-Meteo Geocoding & Weather Fallback
    try {
      let targetLat = lat;
      let targetLon = lon;
      let targetName = query || `Location (${lat}°, ${lon}°)`;

      if (query) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const r = geoData.results[0];
            targetLat = r.latitude;
            targetLon = r.longitude;
            targetName = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}${r.country ? ', ' + r.country : ''}`;
          }
        }
      }

      if (targetLat == null || targetLon == null) return null;

      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`
      );
      if (!wRes.ok) return null;
      const wData = await wRes.json();

      const cur = wData.current || {};
      const hourly = wData.hourly || {};
      const daily = wData.daily || {};

      const curHour = new Date().getHours();
      const hourlyTimes = hourly.time || [];
      const hourlyProbs = hourly.precipitation_probability || [];
      const hourlyPrecip = hourly.precipitation || [];
      const hourlyTemp = hourly.temperature_2m || [];

      const next24 = [];
      for (let i = 0; i < 24; i++) {
        const idx = curHour + i;
        if (idx < hourlyTimes.length) {
          const timeStr = hourlyTimes[idx];
          const hr = timeStr.includes('T') ? timeStr.split('T')[1].substring(0, 5) : `${i}:00`;
          next24.push({
            time: hr,
            rain_probability: hourlyProbs[idx] ?? 0,
            precipitation_mm: hourlyPrecip[idx] ?? 0.0,
            temperature_c: hourlyTemp[idx] ?? cur.temperature_2m
          });
        }
      }

      const dailyTimes = daily.time || [];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const daysForecast = [];
      for (let i = 0; i < Math.min(7, dailyTimes.length); i++) {
        const dStr = dailyTimes[i];
        let dayName = `Day ${i + 1}`;
        try {
          const dObj = new Date(dStr);
          dayName = dayNames[(dObj.getDay() + 6) % 7];
        } catch (err) {}
        daysForecast.push({
          date: dStr,
          day: dayName,
          weather: 'Forecast',
          temp_max: daily.temperature_2m_max?.[i] ?? cur.temperature_2m,
          temp_min: daily.temperature_2m_min?.[i] ?? cur.temperature_2m - 5,
          precipitation_mm: daily.precipitation_sum?.[i] ?? 0.0,
          rain_probability_max: daily.precipitation_probability_max?.[i] ?? 0
        });
      }

      const currentHourProb = (hourlyProbs.length > curHour && hourlyProbs[curHour] !== null)
        ? hourlyProbs[curHour]
        : (cur.precipitation > 0 ? 80 : 0);

      const liveProb = (cur.precipitation === 0 && (cur.weather_code === 0 || cur.weather_code === 1))
        ? 0
        : currentHourProb;

      return {
        status: 'success',
        location: { name: targetName, lat: targetLat, lon: targetLon },
        current: {
          temperature_c: cur.temperature_2m ?? 28,
          humidity_pct: cur.relative_humidity_2m ?? 50,
          pressure_hpa: cur.pressure_msl ?? cur.surface_pressure ?? 1013,
          cloud_cover_pct: cur.cloud_cover ?? 0,
          wind_speed_kmh: cur.wind_speed_10m ?? 10,
          wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round((cur.wind_direction_10m || 0) / 45) % 8],
          precipitation_mmh: cur.precipitation ?? 0.0,
          weather_code: cur.weather_code ?? 0,
          weather_desc: cur.weather_code === 0 ? 'Clear sky' : 'Scattered Clouds'
        },
        prediction: {
          calibrated_rain_probability: liveProb,
          intensity_mm: cur.precipitation ?? 0.0,
          will_rain: liveProb >= 35,
          verdict: {
            badge: liveProb >= 40 ? 'RAINFALL LIKELY' : 'NO RAIN EXPECTED',
            badgeColor: liveProb >= 40 ? '#00f2fe' : '#00e676',
            badgeBg: liveProb >= 40 ? 'rgba(0, 242, 254, 0.18)' : 'rgba(0, 230, 118, 0.15)',
            title: liveProb >= 40 ? 'Rain Expected' : 'Clear & Dry Conditions',
            desc: liveProb >= 40 ? 'Precipitation expected in the area.' : 'Atmospheric conditions indicate clear weather.',
            floodRisk: 'Zero Risk',
            timeEstimate: 'N/A',
            willRain: liveProb >= 35
          }
        },
        hourly_forecast: next24,
        daily_forecast: daysForecast
      };
    } catch (err) {
      console.error('Error fetching fallback weather:', err);
      return null;
    }
  };

  const applyWeatherDataToState = (data, sourceId = 'custom') => {
    if (!data || !data.location) return;

    const loc = data.location;
    const cur = data.current;
    const pred = data.prediction || {};

    const precipRate = Number(cur.precipitation_mmh ?? 0);
    const rainProb = Number(pred.calibrated_rain_probability ?? 0);
    const temp = Number(cur.temperature_c ?? 28);
    const humidity = Number(cur.humidity_pct ?? 50);
    const pressure = Number(cur.pressure_hpa ?? 1013);
    const cloud = Number(cur.cloud_cover_pct ?? 0);
    const windSpeed = Number(cur.wind_speed_kmh ?? 10);
    const windDir = cur.wind_direction || 'NE';

    const locationObj = {
      id: sourceId,
      name: `📍 ${loc.name}`,
      tagline: `Precise Meteorological Station (${Number(loc.lat).toFixed(3)}°, ${Number(loc.lon).toFixed(3)}°)`,
      lat: Number(loc.lat),
      lon: Number(loc.lon),
      avgAnnualMm: precipRate > 0 ? 1400 : 450,
      currentIntensity: precipRate,
      precipitationProbability: rainProb,
      weatherCode: cur.weather_code ?? 0,
      weatherDesc: cur.weather_desc ?? 'Clear sky',
      temp,
      humidity,
      pressure: Math.round(pressure),
      cloudCover: cloud,
      windSpeed: Math.round(windSpeed),
      windDir,
      soilSaturation: precipRate > 0 ? Math.min(95, Math.round(precipRate * 2.5 + humidity * 0.4)) : Math.min(40, Math.round(humidity * 0.35)),
      riverLevel: (precipRate * 0.15 + 1.8).toFixed(1),
      maxRiverLevel: 8.5,
      activeAlert: precipRate > 15 || rainProb >= 80 ? {
        level: 'warning',
        title: `Precipitation Warning — ${loc.name}`,
        description: `Precipitation rate of ${precipRate} mm/h with ${rainProb}% rain probability.`
      } : null
    };

    setSelectedLocation(locationObj);
    setCurrentIntensity(precipRate);
    setSelectedLocationId(sourceId);
    setActivePresetId(null);
    setForecastData({
      hourly: data.hourly_forecast || [],
      daily: data.daily_forecast || []
    });

    // 🔊 One-shot weather result sound effect (plays regardless of ambient audio toggle)
    try {
      audioSynth.playWeatherResultEffect(data);
    } catch (err) {
      console.warn('Sound effect error:', err);
    }
  };

  // Auto-detect user's live laptop location weather on initial load
  useEffect(() => {
    handleUseCurrentLocation();
  }, []);

  // Sync selected location preset
  useEffect(() => {
    if (selectedLocationId === 'custom' || selectedLocationId === 'gps') return;
    const found = LOCATION_PRESETS.find((l) => l.id === selectedLocationId);
    if (found) {
      setSelectedLocation(found);
      setCurrentIntensity(found.currentIntensity);
      setActivePresetId(null);
      // Fetch live weather for preset
      fetchAccurateWeather({ lat: found.lat, lon: found.lon }).then((data) => {
        if (data) applyWeatherDataToState(data, found.id);
      });
    }
  }, [selectedLocationId]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const weather = await fetchAccurateWeather({ lat, lon });
          if (weather) {
            applyWeatherDataToState(weather, 'gps');
          }
        } catch (err) {
          console.error('Error fetching GPS weather:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn(`Geolocation notice: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Sync Audio when intensity or audio state changes
  useEffect(() => {
    if (isAudioActive) {
      audioSynth.startRain(currentIntensity);
    } else {
      audioSynth.stopRain();
    }
  }, [isAudioActive, currentIntensity]);

  const toggleAudio = () => {
    setIsAudioActive(!isAudioActive);
  };

  const handleThunderSound = () => {
    if (isAudioActive) {
      audioSynth.triggerThunder();
    }
  };

  const handleStormPresetSelect = (preset) => {
    setActivePresetId(preset.id);
    setCurrentIntensity(preset.intensity);
  };

  const handleCustomSearchSubmit = async (e) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    const query = customSearch.trim();
    setIsLocating(true);
    try {
      const weather = await fetchAccurateWeather({ query });
      if (weather && weather.location) {
        applyWeatherDataToState(weather, `custom_${Date.now()}`);
        setCustomSearch('');
      } else {
        alert(`Location "${query}" not found. Please check spelling or enter city name.`);
      }
    } catch (err) {
      console.error('Search Geocoding error:', err);
      alert(`Could not fetch weather for "${query}".`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleApplyScenario = (scenarioData) => {
    setCurrentIntensity(scenarioData.intensity);
    setSelectedLocation((prev) => ({
      ...prev,
      temp: scenarioData.temp,
      humidity: scenarioData.humidity,
      pressure: scenarioData.pressure
    }));
  };

  const handleApplyLabData = (labData) => {
    setCurrentIntensity(labData.intensity);
    setSelectedLocation((prev) => ({
      ...prev,
      name: labData.syncSource ? `📍 ${labData.syncSource} (Google Weather)` : `${prev.name.replace(/ \(Lab Data Active\)/, '')} (Lab Data Active)`,
      temp: labData.temp,
      humidity: labData.humidity,
      pressure: labData.pressure,
      windSpeed: labData.windSpeed,
      cloudCover: labData.cloudCover,
      precipitationProbability: labData.prediction.prob,
      activeAlert: labData.prediction.verdict.willRain ? {
        level: labData.prediction.prob > 80 ? 'severe' : 'warning',
        title: labData.prediction.verdict.title,
        description: labData.prediction.verdict.desc
      } : null
    }));
  };

  const effectiveRainProb = selectedLocation.precipitationProbability !== undefined
    ? selectedLocation.precipitationProbability
    : (currentIntensity > 0 ? 80 : 0);

  return (
    <div className="app-container">
      {/* Dynamic Ambient Multi-Weather Atmosphere Particle Background Canvas */}
      <RainCanvas
        intensity={currentIntensity}
        windSpeed={selectedLocation.windSpeed || 15}
        cloudCover={selectedLocation.cloudCover !== undefined ? selectedLocation.cloudCover : (selectedLocation.humidity > 80 ? 85 : selectedLocation.humidity > 60 ? 55 : 15)}
        humidity={selectedLocation.humidity || 60}
        temp={selectedLocation.temp || 28}
        rainProb={effectiveRainProb}
        onThunderTrigger={handleThunderSound}
      />

      {/* Main Header */}
      <header className="app-header fade-in">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <CloudRain size={28} />
          </div>
          <div>
            <div className="brand-title">PluviaVision AI</div>
            <div className="brand-subtitle">
              Next-Gen Precipitation & Doppler Meteorological Intelligence
              <span className="live-badge">
                <span className="live-pulse" /> Live Telemetry
              </span>
            </div>
          </div>
        </div>

        {/* Header Controls: Location Selector, Search, Ambient Audio */}
        <div className="controls-bar">
          <form onSubmit={handleCustomSearchSubmit} className="selector-group">
            <Search size={16} className="selector-icon" />
            <input
              type="text"
              placeholder="Search global city..."
              className="text-input"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              style={{ width: '150px' }}
            />
          </form>

          <button
            className={`btn ${selectedLocationId === 'gps' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            title="Detect My GPS Location & Fetch Live Weather Data"
          >
            {isLocating ? <Loader2 size={16} className="spin" /> : <Navigation size={16} />}
            {isLocating ? 'Locating...' : 'Use Current Location'}
          </button>

          <div className="selector-group">
            <MapPin size={16} className="selector-icon" />
            <select
              className="select-input"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
            >
              {LOCATION_PRESETS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
              {selectedLocationId === 'custom' && (
                <option value="custom">{selectedLocation.name} (Custom)</option>
              )}
              {selectedLocationId === 'gps' && (
                <option value="gps">📍 {selectedLocation.name}</option>
              )}
            </select>
          </div>

          <button
            className={`btn ${isAudioActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={toggleAudio}
            title={isAudioActive ? 'Mute Ambient Rain Sound' : 'Play Ambient Synthesized Rain Sound'}
          >
            {isAudioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {isAudioActive ? 'Sound ON' : 'Audio Muted'}
          </button>

          <button
            className="btn dataset-btn"
            onClick={() => setIsDatasetModalOpen(true)}
            title="Update & Manage Meteorological Rainfall Dataset"
          >
            <Database size={16} />
            <span>Update Dataset</span>
            <span className="dataset-pill">{datasetRecordCount > 0 ? `${datasetRecordCount}` : '8K'}</span>
          </button>
        </div>
      </header>

      {/* Storm Intensity Quick Select Presets Bar */}
      <div className="storm-presets-bar fade-in">
        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600', marginRight: '0.4rem' }}>
          Simulated Intensity:
        </span>
        {STORM_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`preset-chip ${activePresetId === preset.id ? 'active' : ''}`}
            onClick={() => handleStormPresetSelect(preset)}
          >
            <Zap size={12} color={activePresetId === preset.id ? 'var(--accent-cyan)' : '#94a3b8'} />
            {preset.name} ({preset.intensity} mm/h)
          </button>
        ))}
      </div>

      {/* Dedicated Lab Weather Data Rainfall Predictor */}
      <LabPredictor selectedLocation={selectedLocation} onApplyLabData={handleApplyLabData} />

      {/* Primary Dashboard Grid */}
      <main className="dashboard-grid">
        {/* Left / Main Column */}
        <div className="main-column">
          {/* Interactive Doppler Radar Scope */}
          <DopplerRadar
            intensity={currentIntensity}
            locationName={selectedLocation.name}
            windSpeed={selectedLocation.windSpeed}
          />

          {/* Live Location Google Map & Prediction Overlay */}
          <GoogleMapView locationData={selectedLocation} currentIntensity={currentIntensity} />

          {/* Smart Agricultural Crop Irrigation Saver */}
          <CropIrrigationCalc currentIntensity={currentIntensity} />

          {/* Road Safety & Hydroplaning Hazard Advisory */}
          <RoadSafetyMeter currentIntensity={currentIntensity} />

          {/* Meteorological Metrics Grid */}
          <MetricsGrid locationData={selectedLocation} currentIntensity={currentIntensity} />

          {/* Forecast & Analytics Charts */}
          <ForecastCharts intensity={currentIntensity} forecastData={forecastData} />
        </div>

        {/* Right / Sidebar Column */}
        <div className="sidebar-column">
          {/* Rainwater Harvesting & Rooftop Collection Tank Calculator */}
          <RainHarvestingCalc currentIntensity={currentIntensity} />

          {/* Flood Advisory & Alert Component */}
          <FloodAlertPanel locationData={selectedLocation} intensity={currentIntensity} />

          {/* Micro-Climate Physics Scenario Simulator */}
          <ScenarioSimulator onApplyScenario={handleApplyScenario} />

          {/* Hydro-Log Exporter */}
          <DataExporter
            locationName={selectedLocation.name}
            currentIntensity={currentIntensity}
            locationData={selectedLocation}
          />
        </div>
      </main>

      {/* Dataset Manager & Live Training Modal */}
      <DatasetManagerModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onDatasetUpdated={handleDatasetUpdated}
      />
    </div>
  );
}
