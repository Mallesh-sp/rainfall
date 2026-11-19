import React from 'react';
import { ShieldAlert, AlertTriangle, Waves, CheckCircle, Info, LifeBuoy } from 'lucide-react';

const FloodAlertPanel = ({ locationData, intensity = 20 }) => {
  const alert = locationData.activeAlert;
  const riverLevel = (locationData.riverLevel * (1 + intensity / 100)).toFixed(1);
  const maxLevel = locationData.maxRiverLevel;
  const riverPct = Math.min(100, Math.round((riverLevel / maxLevel) * 100));

  return (
    <div className="glass-card fade-in">
      <div className="card-header">
        <div className="card-title">
          <ShieldAlert className="card-title-icon" style={{ color: '#ff1744' }} />
          Flash Flood Advisory & River Catchment Grid
        </div>
      </div>

      {/* Active Advisory Alert Box */}
      {alert ? (
        <div className={`alert-box ${alert.level}`}>
          <div className="alert-icon">
            <AlertTriangle />
          </div>
          <div className="alert-content">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-desc">{alert.description}</div>
          </div>
        </div>
      ) : (
        <div className="alert-box info">
          <div className="alert-icon">
            <Info />
          </div>
          <div className="alert-content">
            <div className="alert-title">Normal Drainage Operations</div>
            <div className="alert-desc">No active severe weather alerts in this regional catchment sector.</div>
          </div>
        </div>
      )}

      {/* River Level / Watershed Gauge */}
      <div className="river-gauge" style={{ marginBottom: '1.25rem' }}>
        <div className="gauge-header">
          <span>Primary River Catchment Level</span>
          <span style={{ color: riverPct > 80 ? '#ff1744' : riverPct > 60 ? '#ffd600' : '#00e676' }}>
            {riverLevel} m / {maxLevel} m ({riverPct}%)
          </span>
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${riverPct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
          <span>Safe (0-5m)</span>
          <span>Warning (6-8m)</span>
          <span>Critical Overflow (&gt;8.5m)</span>
        </div>
      </div>

      {/* Preparedness Protocol Checklist */}
      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Waves size={16} color="var(--accent-cyan)" />
          Hydrological Emergency Protocols
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={14} color="#00e676" /> Watershed telemetry sensors emitting signals every 60 seconds
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={14} color="#00e676" /> Automatic floodgates locked to anti-surge mode
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={14} color={riverPct > 75 ? '#ff1744' : '#00e676'} /> Emergency evacuation route maps active
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FloodAlertPanel;
