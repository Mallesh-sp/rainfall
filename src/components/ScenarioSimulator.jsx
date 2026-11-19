import React, { useState } from 'react';
import { Sliders, Sparkles, RefreshCw } from 'lucide-react';

const ScenarioSimulator = ({ onApplyScenario }) => {
  const [temp, setTemp] = useState(25);
  const [humidity, setHumidity] = useState(90);
  const [pressure, setPressure] = useState(1004);
  const [cloudThickness, setCloudThickness] = useState(3500); // meters

  // Thermodynamic estimate of precipitable water & condensation rate
  // Clausius-Clapeyron relation approximation
  const saturationVaporPressure = 6.11 * Math.pow(10, (7.5 * temp) / (237.3 + temp));
  const actualVaporPressure = (humidity / 100) * saturationVaporPressure;
  const dewPoint = (237.3 * Math.log(actualVaporPressure / 6.11)) / (7.5 * Math.log(10) - Math.log(actualVaporPressure / 6.11));

  // Estimated precip rate (mm/h)
  const pressureDeficit = Math.max(0, 1013.25 - pressure);
  const estRate = Math.max(0, ((actualVaporPressure / 10) * (cloudThickness / 1000) * (humidity / 100) * (1 + pressureDeficit / 50))).toFixed(1);

  const handleSimulate = () => {
    onApplyScenario({
      intensity: Number(estRate),
      temp,
      humidity,
      pressure,
      dewPoint: Number(dewPoint.toFixed(1))
    });
  };

  const handleReset = () => {
    setTemp(25);
    setHumidity(90);
    setPressure(1004);
    setCloudThickness(3500);
  };

  return (
    <div className="glass-card fade-in">
      <div className="card-header">
        <div className="card-title">
          <Sliders className="card-title-icon" />
          Atmosphere Micro-Climate Simulator
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={handleReset}>
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Temperature Slider */}
        <div className="slider-group">
          <div className="slider-label">
            <span>Air Temperature</span>
            <span className="slider-value">{temp}°C</span>
          </div>
          <input
            type="range"
            min="0"
            max="45"
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
          />
        </div>

        {/* Relative Humidity Slider */}
        <div className="slider-group">
          <div className="slider-label">
            <span>Relative Humidity</span>
            <span className="slider-value">{humidity}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={humidity}
            onChange={(e) => setHumidity(Number(e.target.value))}
          />
        </div>

        {/* Barometric Pressure Slider */}
        <div className="slider-group">
          <div className="slider-label">
            <span>Surface Pressure</span>
            <span className="slider-value">{pressure} hPa</span>
          </div>
          <input
            type="range"
            min="960"
            max="1035"
            value={pressure}
            onChange={(e) => setPressure(Number(e.target.value))}
          />
        </div>

        {/* Cloud Layer Depth Slider */}
        <div className="slider-group">
          <div className="slider-label">
            <span>Convective Cloud Depth</span>
            <span className="slider-value">{cloudThickness} m</span>
          </div>
          <input
            type="range"
            min="500"
            max="8000"
            step="250"
            value={cloudThickness}
            onChange={(e) => setCloudThickness(Number(e.target.value))}
          />
        </div>

        {/* Calculated Result Preview */}
        <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calculated Thermodynamic Precip Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00f2fe', fontFamily: 'var(--font-display)', margin: '0.2rem 0' }}>
            {estRate} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>mm/h</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dew Point: {dewPoint.toFixed(1)}°C</div>
        </div>

        <button className="btn btn-primary" onClick={handleSimulate} style={{ width: '100%' }}>
          <Sparkles size={16} /> Run Physics Simulation Model
        </button>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
