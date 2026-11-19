import React from 'react';
import { CloudRain, Droplets, Gauge, Wind, Thermometer, Layers, AlertCircle } from 'lucide-react';

const MetricsGrid = ({ locationData, currentIntensity }) => {
  const intensityVal = currentIntensity || locationData.currentIntensity;
  const accum24h = (intensityVal * 14.2).toFixed(1);

  return (
    <div className="metrics-grid fade-in">
      {/* Current Rainfall Rate */}
      <div className="metric-card">
        <div className="metric-top">
          <span>Precipitation Rate</span>
          <div className="metric-icon-box" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
            <CloudRain size={18} />
          </div>
        </div>
        <div className="metric-value">
          {intensityVal} <span className="metric-unit">mm/h</span>
        </div>
        <div className={`metric-status ${intensityVal > 35 ? 'danger' : intensityVal > 15 ? 'warning' : ''}`}>
          {intensityVal > 35 ? '● Heavy Torrential' : intensityVal > 15 ? '● Moderate Downpour' : intensityVal > 0 ? '● Light Drizzle' : '● Clear Sky — No Rain'}
        </div>
      </div>

      {/* 24-Hour Accumulated Rainfall */}
      <div className="metric-card">
        <div className="metric-top">
          <span>24h Accumulation</span>
          <div className="metric-icon-box" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00e676' }}>
            <Droplets size={18} />
          </div>
        </div>
        <div className="metric-value">
          {accum24h} <span className="metric-unit">mm</span>
        </div>
        <div className="metric-status">
          {intensityVal > 0 ? '↑ Recent Local Accumulation' : '● Dry Ground Surface'}
        </div>
      </div>

      {/* Barometric Pressure */}
      <div className="metric-card">
        <div className="metric-top">
          <span>Atmospheric Pressure</span>
          <div className="metric-icon-box" style={{ background: 'rgba(255, 214, 0, 0.15)', color: '#ffd600' }}>
            <Gauge size={18} />
          </div>
        </div>
        <div className="metric-value">
          {locationData.pressure} <span className="metric-unit">hPa</span>
        </div>
        <div className={`metric-status ${locationData.pressure < 1005 ? 'warning' : ''}`}>
          {locationData.pressure < 1005 ? '↓ Falling - Low Pressure Trough' : locationData.pressure > 1015 ? '↑ High Pressure Stable Ridge' : '● Stable Sea-Level Pressure'}
        </div>
      </div>

      {/* Humidity & Dew Point */}
      <div className="metric-card">
        <div className="metric-top">
          <span>Relative Humidity</span>
          <div className="metric-icon-box" style={{ background: 'rgba(58, 123, 213, 0.15)', color: '#3a7bd5' }}>
            <Thermometer size={18} />
          </div>
        </div>
        <div className="metric-value">
          {locationData.humidity}<span className="metric-unit">%</span>
        </div>
        <div className="metric-status">
          Dew Point: {(locationData.temp - (100 - locationData.humidity) / 5).toFixed(1)}°C
        </div>
      </div>

      {/* Soil Moisture Saturation */}
      <div className="metric-card">
        <div className="metric-top">
          <span>Soil Saturation</span>
          <div className="metric-icon-box" style={{ background: 'rgba(224, 64, 251, 0.15)', color: '#e040fb' }}>
            <Layers size={18} />
          </div>
        </div>
        <div className="metric-value">
          {locationData.soilSaturation}<span className="metric-unit">%</span>
        </div>
        <div className={`metric-status ${locationData.soilSaturation > 80 ? 'danger' : ''}`}>
          {locationData.soilSaturation > 80 ? '⚠️ High Surface Runoff' : 'Normal Absorption'}
        </div>
      </div>

      {/* Wind Velocity & Direction */}
      <div className="metric-card">
        <div className="metric-top">
          <span>Wind Velocity</span>
          <div className="metric-icon-box" style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff' }}>
            <Wind size={18} />
          </div>
        </div>
        <div className="metric-value">
          {locationData.windSpeed} <span className="metric-unit">km/h</span>
        </div>
        <div className="metric-status">
          Vector: {locationData.windDir} Gusts to {Math.round(locationData.windSpeed * 1.4)} km/h
        </div>
      </div>
    </div>
  );
};

export default MetricsGrid;
