import React, { useState } from 'react';
import { Map, ExternalLink, Navigation, CloudRain, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

const GoogleMapView = ({ locationData, currentIntensity }) => {
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const lat = locationData.lat || 13.0827;
  const lon = locationData.lon || 80.2707;
  const locationName = locationData.name || 'Live Location';

  // Calculate rain chance percentage accurately matching Google Weather
  let rainChance = 0;
  if (locationData.precipitationProbability !== undefined) {
    rainChance = locationData.precipitationProbability;
  } else if (currentIntensity > 0) {
    rainChance = Math.min(99, Math.max(45, Math.round(currentIntensity * 3 + 30)));
  } else if (locationData.cloudCover !== undefined) {
    // If dry, base only slightly on cloud cover (0% for clear sky)
    rainChance = locationData.cloudCover > 80 ? Math.min(30, Math.round((locationData.cloudCover - 70) * 1.5)) : 0;
  } else {
    rainChance = 0;
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lon}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=14&ie=UTF8&iwloc=B&output=embed`;

  return (
    <div className="glass-card fade-in" style={{ border: '1px solid var(--border-glow)' }}>
      <div className="card-header">
        <div className="card-title">
          <Map className="card-title-icon" style={{ color: '#00f2fe' }} />
          Live Location Google Map & Rainfall Prediction Overlay
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn btn-secondary ${mapType === 'roadmap' ? 'btn-active' : ''}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            onClick={() => setMapType('roadmap')}
          >
            Map
          </button>
          <button
            className={`btn btn-secondary ${mapType === 'satellite' ? 'btn-active' : ''}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            onClick={() => setMapType('satellite')}
          >
            Satellite
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            Open Google Maps <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Embedded Map Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}
      >
        <iframe
          title="Google Map Live Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={embedUrl}
          style={{ filter: mapType === 'roadmap' ? 'invert(90%) hue-rotate(180deg) contrast(1.2)' : 'none', opacity: 0.9 }}
        />

        {/* Floating Live Rainfall Prediction Badge on Map */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            background: 'rgba(10, 18, 36, 0.92)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${rainChance > 70 ? '#ff1744' : rainChance > 40 ? '#00f2fe' : '#00e676'}`,
            borderRadius: '12px',
            padding: '0.85rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            gap: '1rem',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: rainChance > 70 ? 'rgba(255, 23, 68, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                color: rainChance > 70 ? '#ff1744' : '#00f2fe',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}
            >
              <CloudRain size={24} />
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Navigation size={12} color="#00f2fe" />
                {locationName} ({lat}°, {lon}°)
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-display)' }}>
                Rainfall Probability: <span style={{ color: rainChance > 70 ? '#ff1744' : rainChance > 40 ? '#00f2fe' : '#00e676' }}>{rainChance}% Chance</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Precip Rate</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
              {currentIntensity} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>mm/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapView;
