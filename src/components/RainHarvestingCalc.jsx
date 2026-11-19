import React, { useState } from 'react';
import { Home, Droplet, Sparkles, ShieldCheck } from 'lucide-react';

const RainHarvestingCalc = ({ currentIntensity }) => {
  const [roofArea, setRoofArea] = useState(1200); // sq ft
  const [roofType, setRoofType] = useState('concrete'); // concrete (85% runoff), tin (95%), tile (75%)

  const runoffCoeffs = {
    tin: { name: 'Metal / Tin Sheet Roof (95% efficiency)', coeff: 0.95 },
    concrete: { name: 'Flat RCC Concrete Terrace (85% efficiency)', coeff: 0.85 },
    tile: { name: 'Tiled Roof (75% efficiency)', coeff: 0.75 }
  };

  const selectedRoof = runoffCoeffs[roofType];
  const predicted24hMm = Math.round(currentIntensity * 12);

  // Formula: Volume (Liters) = Area (sq ft) * Rainfall (mm) * Runoff Coefficient * 0.0929 * 1000 / 1000 => 0.0929 * Area * Rainfall * Coeff
  // 1 sq ft * 1 mm rain = 0.0929 liters
  const harvestedLiters = Math.round(roofArea * predicted24hMm * 0.0929 * selectedRoof.coeff);
  const householdDays = (harvestedLiters / 350).toFixed(1); // Avg household consumes ~350L/day

  return (
    <div className="glass-card fade-in" style={{ border: '1px solid rgba(0, 242, 254, 0.3)' }}>
      <div className="card-header">
        <div className="card-title">
          <Home className="card-title-icon" style={{ color: '#00f2fe' }} />
          Rainwater Harvesting & Storage Tank Calculator
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Roof Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="slider-group">
            <div className="slider-label">
              <span>Rooftop Surface Area</span>
              <span className="slider-value">{roofArea} sq ft</span>
            </div>
            <input
              type="range"
              min="300"
              max="5000"
              step="100"
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>Roof Material & Catchment Type</span>
            </div>
            <select
              className="select-input"
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
            >
              {Object.keys(runoffCoeffs).map((k) => (
                <option key={k} value={k}>
                  {runoffCoeffs[k].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Harvested Storage Output */}
        <div
          style={{
            background: 'rgba(0, 242, 254, 0.08)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Harvested Water from Upcoming Storm</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00f2fe', fontFamily: 'var(--font-display)', margin: '0.2rem 0' }}>
              {harvestedLiters.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Liters</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              ≈ {Math.round(harvestedLiters * 0.264172).toLocaleString()} US Gallons
            </div>
          </div>

          <div style={{ background: 'rgba(10, 18, 36, 0.7)', padding: '0.65rem 0.85rem', borderRadius: '8px', marginTop: '0.6rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#00e676', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> Household Water Autonomy
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
              Supplies <strong>{householdDays} days</strong> of domestic household water consumption!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RainHarvestingCalc;
