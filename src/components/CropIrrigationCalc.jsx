import React, { useState } from 'react';
import { Sprout, CheckCircle2, AlertCircle, Droplets, ArrowRight } from 'lucide-react';

const CropIrrigationCalc = ({ currentIntensity }) => {
  const [landArea, setLandArea] = useState(1.5); // acres
  const [cropType, setCropType] = useState('cotton'); // paddy, sugarcane, cotton, vegetables, tea

  const crops = {
    cotton: { name: 'Cotton', waterNeed: 10, unit: 'mm/day', description: 'Moderate moisture needed; avoid waterlogging.' },
    paddy: { name: 'Paddy / Rice', waterNeed: 25, unit: 'mm/day', description: 'Requires submerged soil or heavy moisture.' },
    sugarcane: { name: 'Sugarcane', waterNeed: 20, unit: 'mm/day', description: 'High water requirement.' },
    vegetables: { name: 'Vegetables & Horticulture', waterNeed: 12, unit: 'mm/day', description: 'Sensitive to dry soil and severe flooding.' },
    tea: { name: 'Tea / Coffee Plantations', waterNeed: 15, unit: 'mm/day', description: 'Well-drained slope rain preferred.' }
  };

  const selectedCrop = crops[cropType];
  
  // Calculate realistic 24-hour accumulated rainfall (mm) from hourly rate
  const predictedRain24h = Math.round(Math.min(150, currentIntensity * 2.2));
  
  // Water saved calculation: 1 acre-mm of rainfall = 10,117 Liters (1 mm over 4046.86 m² = 4.047 m³ = 4046.86 L)
  const waterSavedLiters = Math.round(predictedRain24h * landArea * 4046.86);

  const skipIrrigation = predictedRain24h >= selectedCrop.waterNeed * 0.5;

  return (
    <div className="glass-card fade-in" style={{ border: '1px solid rgba(0, 230, 118, 0.3)' }}>
      <div className="card-header">
        <div className="card-title">
          <Sprout className="card-title-icon" style={{ color: '#00e676' }} />
          Smart Agricultural & Crop Irrigation Saver
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="slider-group">
            <div className="slider-label">
              <span>Crop Category</span>
            </div>
            <select
              className="select-input"
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
            >
              {Object.keys(crops).map((k) => (
                <option key={k} value={k}>
                  {crops[k].name}
                </option>
              ))}
            </select>
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>Land Area (Acres)</span>
              <span className="slider-value">{landArea} Acre(s)</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={landArea}
              onChange={(e) => setLandArea(Number(e.target.value))}
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: '8px' }}>
            🌾 <strong>{selectedCrop.name}</strong>: {selectedCrop.description}
          </div>
        </div>

        {/* Irrigation Advisory Output */}
        <div
          style={{
            background: skipIrrigation ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 214, 0, 0.12)',
            border: `1px solid ${skipIrrigation ? '#00e676' : '#ffd600'}`,
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: skipIrrigation ? '#00e676' : '#ffd600', marginBottom: '0.4rem' }}>
              {skipIrrigation ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {skipIrrigation ? 'SKIP FIELD IRRIGATION TODAY!' : 'LIGHT SUPPLEMENTAL IRRIGATION REQUIRED'}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '0.8rem' }}>
              {skipIrrigation
                ? `Predicted 24h rainfall of ${predictedRain24h} mm satisfies crop moisture requirements. Turn off irrigation pumps to save electricity & water!`
                : `Predicted 24h rainfall (${predictedRain24h} mm) is less than the crop's daily requirement (${selectedCrop.waterNeed} mm). Short irrigation cycle recommended.`}
            </div>
          </div>

          <div style={{ background: 'rgba(10, 18, 36, 0.7)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estimated Water Saved from Rain</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#00e676', fontFamily: 'var(--font-mono)' }}>
              {waterSavedLiters.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Liters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropIrrigationCalc;
