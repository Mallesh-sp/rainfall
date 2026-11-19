import React from 'react';
import { Car, AlertTriangle, ShieldAlert, Eye, Gauge, Compass } from 'lucide-react';

const RoadSafetyMeter = ({ currentIntensity }) => {
  // Braking distance multiplier: wet roads add braking distance
  const brakingMultiplier = (1 + (currentIntensity / 40) * 1.4).toFixed(1);
  
  // Visibility in meters
  const visibilityMeters = Math.max(150, Math.round(5000 - currentIntensity * 90));
  
  // Max safe driving speed (km/h)
  const maxSafeSpeed = Math.max(35, Math.round(90 - currentIntensity * 1.1));

  // Hydroplaning threat level
  let hydroplaningRisk = 'Low Risk';
  let badgeColor = '#00e676';
  let wiperSpeed = 'Intermittent / Low';

  if (currentIntensity >= 35) {
    hydroplaningRisk = 'SEVERE HYDROPLANING HAZARD!';
    badgeColor = '#ff1744';
    wiperSpeed = 'Maximum High Speed';
  } else if (currentIntensity >= 15) {
    hydroplaningRisk = 'MODERATE HYDROPLANING RISK';
    badgeColor = '#ffd600';
    wiperSpeed = 'Continuous Medium Speed';
  }

  return (
    <div className="glass-card fade-in" style={{ border: `1px solid ${badgeColor}` }}>
      <div className="card-header">
        <div className="card-title">
          <Car className="card-title-icon" style={{ color: badgeColor }} />
          Road Safety & Hydroplaning Danger Advisory
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hydroplaning Threat</div>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: badgeColor, marginTop: '0.2rem' }}>
            {hydroplaningRisk}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Wiper: {wiperSpeed}</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Safe Speed</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#00f2fe', fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>
            {maxSafeSpeed} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>km/h</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Reduced wet road speed limit</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Braking Distance</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffd600', fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>
            {brakingMultiplier}x <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Longer</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Increase gap from front vehicle</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Road Visibility</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>
            {visibilityMeters >= 1000 ? `${(visibilityMeters / 1000).toFixed(1)} km` : `${visibilityMeters} m`}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Use fog headlights if &lt;500m</div>
        </div>
      </div>
    </div>
  );
};

export default RoadSafetyMeter;
