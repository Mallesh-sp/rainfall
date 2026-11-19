import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Eye, Layers, Zap, Compass, MapPin } from 'lucide-react';

const dBZToColor = (dbz) => {
  if (dbz < 10) return 'rgba(0, 0, 0, 0)';
  if (dbz < 20) return 'rgba(0, 230, 255, 0.4)';  // Light Cyan
  if (dbz < 30) return 'rgba(0, 230, 118, 0.6)';  // Green
  if (dbz < 40) return 'rgba(255, 214, 0, 0.75)'; // Yellow
  if (dbz < 50) return 'rgba(255, 145, 0, 0.85)'; // Orange
  if (dbz < 60) return 'rgba(255, 23, 68, 0.9)';   // Heavy Red
  return 'rgba(224, 64, 251, 0.95)';               // Severe Purple / Core
};

const dBZToRainRate = (dbz) => {
  if (dbz < 15) return 0;
  // Marshall-Palmer Z-R relation: Z = 200 * R^1.6
  const z = Math.pow(10, dbz / 10);
  const r = Math.pow(z / 200, 1 / 1.6);
  return r.toFixed(1);
};

const DopplerRadar = ({ intensity = 20, locationName = 'Cherrapunji, India', windSpeed = 20 }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [rangeKm, setRangeKm] = useState(100);
  const [activeLayers, setActiveLayers] = useState({
    vectors: true,
    catchments: true,
    lightning: true
  });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Storm cell state
  const stormCellsRef = useRef([]);

  useEffect(() => {
    // Generate storm cell clusters only if active precipitation/reflectivity exists
    if (intensity <= 0.2) {
      stormCellsRef.current = [];
      return;
    }
    const cellCount = Math.max(1, Math.min(8, Math.floor(intensity / 7)));
    const newCells = [];
    for (let i = 0; i < cellCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.7; // normalized distance from center (0 to 1)
      newCells.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        radius: Math.random() * 0.15 + 0.08,
        maxDBZ: Math.min(75, Math.random() * 20 + intensity * 0.8 + 15),
        vx: (Math.random() - 0.5) * 0.0005,
        vy: (Math.random() - 0.5) * 0.0005 + 0.0002,
        bolts: []
      });
    }
    stormCellsRef.current = newCells;
  }, [intensity, locationName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let sweepAngle = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height || 450);
      canvas.width = rect.width;
      canvas.height = rect.height;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Dark radar background
      ctx.fillStyle = '#060b17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radial Radar Scope Background
      const radarBg = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
      radarBg.addColorStop(0, '#09152b');
      radarBg.addColorStop(0.7, '#060c19');
      radarBg.addColorStop(1, '#03060c');
      ctx.fillStyle = radarBg;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Range Rings (25%, 50%, 75%, 100%)
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const r = (radius / 4) * i;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();

        // Label distance
        ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${(rangeKm / 4) * i} km`, centerX + 6, centerY - r + 12);
      }

      // Crosshairs & Cardinal Directions
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      ctx.fillStyle = '#00f2fe';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', centerX, centerY - radius + 14);
      ctx.fillText('S', centerX, centerY + radius - 6);
      ctx.fillText('E', centerX + radius - 10, centerY + 4);
      ctx.fillText('W', centerX - radius + 10, centerY + 4);

      // Render Simulated Storm Precipitation Cells
      const cells = stormCellsRef.current;
      cells.forEach((cell) => {
        if (isPlaying) {
          cell.x += cell.vx * speed;
          cell.y += cell.vy * speed;

          // Keep within radar bounds
          const distFromCenter = Math.sqrt(cell.x * cell.x + cell.y * cell.y);
          if (distFromCenter > 0.85) {
            cell.vx *= -1;
            cell.vy *= -1;
          }
        }

        const cx = centerX + cell.x * radius;
        const cy = centerY + cell.y * radius;
        const cr = cell.radius * radius;

        // Render concentric reflectivity bands for realism
        const dbzSteps = [15, 30, 45, 60, cell.maxDBZ];
        dbzSteps.forEach((dbzVal, idx) => {
          if (dbzVal > cell.maxDBZ) return;
          const bandRadius = cr * (1 - idx * 0.18);
          if (bandRadius <= 0) return;

          ctx.fillStyle = dBZToColor(dbzVal);
          ctx.beginPath();
          ctx.arc(cx, cy, bandRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Render motion vectors if layer active
        if (activeLayers.vectors) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + cell.vx * 40000, cy + cell.vy * 40000);
          ctx.stroke();
        }

        // Render Lightning Strike Indicators
        if (activeLayers.lightning && cell.maxDBZ > 50 && Math.random() < 0.04) {
          cell.bolts.push({
            bx: cx + (Math.random() - 0.5) * cr,
            by: cy + (Math.random() - 0.5) * cr,
            life: 1.0
          });
        }

        cell.bolts.forEach((b, bIdx) => {
          ctx.strokeStyle = `rgba(255, 255, 255, ${b.life})`;
          ctx.fillStyle = `rgba(255, 255, 0, ${b.life})`;
          ctx.beginPath();
          ctx.arc(b.bx, b.by, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          b.life -= 0.1;
          if (b.life <= 0) cell.bolts.splice(bIdx, 1);
        });
      });

      // Rotating Doppler Beam Sweep
      if (isPlaying) {
        sweepAngle = (sweepAngle + 0.02 * speed) % (Math.PI * 2);
      }

      // Render radar beam cone fill
      const sweepGradient = ctx.createConicGradient(sweepAngle, centerX, centerY);
      sweepGradient.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
      sweepGradient.addColorStop(0.08, 'rgba(0, 242, 254, 0.08)');
      sweepGradient.addColorStop(0.25, 'rgba(0, 242, 254, 0)');
      sweepGradient.addColorStop(1, 'rgba(0, 242, 254, 0)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Lead sweep line
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * radius, centerY + Math.sin(sweepAngle) * radius);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Center Station Marker
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, speed, rangeKm, activeLayers]);

  // Handle Hover / Click inspection on radar scope
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const dx = mx - centerX;
    const dy = my - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= radius) {
      const normX = dx / radius;
      const normY = dy / radius;
      
      // Calculate nearest cell reflectivity
      let maxCellDBZ = 0;
      stormCellsRef.current.forEach((cell) => {
        const cdx = normX - cell.x;
        const cdy = normY - cell.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < cell.radius) {
          const factor = 1 - cdist / cell.radius;
          const calculatedDBZ = Math.round(cell.maxDBZ * factor);
          if (calculatedDBZ > maxCellDBZ) maxCellDBZ = calculatedDBZ;
        }
      });

      const distanceKm = Math.round((dist / radius) * rangeKm);
      const angleDeg = Math.round(((Math.atan2(dy, dx) * 180 / Math.PI) + 450) % 360);

      setHoveredPoint({
        x: mx,
        y: my,
        distanceKm,
        angleDeg,
        dbz: maxCellDBZ,
        rainRate: dBZToRainRate(maxCellDBZ)
      });
    } else {
      setHoveredPoint(null);
    }
  };

  return (
    <div className="glass-card fade-in">
      <div className="card-header">
        <div className="card-title">
          <Compass className="card-title-icon" />
          Doppler Radar Scope — {locationName}
        </div>
        <div className="card-action">
          <MapPin size={14} /> Lat/Lon Grid Locked
        </div>
      </div>

      <div className="radar-container" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredPoint(null)}>
        <canvas ref={canvasRef} className="radar-canvas" />

        {/* Top-Left Quick Overlays */}
        <div className="radar-overlay-controls">
          <button
            className={`btn btn-secondary btn-icon-only ${activeLayers.vectors ? 'btn-active' : ''}`}
            title="Toggle Storm Motion Vectors"
            onClick={() => setActiveLayers((p) => ({ ...p, vectors: !p.vectors }))}
          >
            <Layers size={16} />
          </button>
          <button
            className={`btn btn-secondary btn-icon-only ${activeLayers.lightning ? 'btn-active' : ''}`}
            title="Toggle Lightning Detectors"
            onClick={() => setActiveLayers((p) => ({ ...p, lightning: !p.lightning }))}
          >
            <Zap size={16} />
          </button>
        </div>

        {/* Top-Right Range Controls */}
        <div className="radar-overlay-top-right">
          <div className="selector-group" style={{ padding: '0.2rem 0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Range:</span>
            <select
              className="select-input"
              style={{ fontSize: '0.75rem' }}
              value={rangeKm}
              onChange={(e) => setRangeKm(Number(e.target.value))}
            >
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={200}>200 km</option>
            </select>
          </div>
        </div>

        {/* Hover Inspector Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: hoveredPoint.x + 12,
              top: hoveredPoint.y - 40,
              background: 'rgba(10, 18, 36, 0.92)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '8px',
              padding: '6px 10px',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div>Bearing: <strong>{hoveredPoint.angleDeg}° @ {hoveredPoint.distanceKm} km</strong></div>
            <div>Reflectivity: <strong style={{ color: dBZToColor(hoveredPoint.dbz) }}>{hoveredPoint.dbz} dBZ</strong></div>
            <div>Est. Precip: <strong>{hoveredPoint.rainRate} mm/h</strong></div>
          </div>
        )}

        {/* Bottom Radar Controls Bar */}
        <div className="radar-overlay-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-primary btn-icon-only"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Sweep' : 'Start Sweep'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}
            >
              Speed: {speed}x
            </button>
          </div>

          {/* dBZ Color Scale Legend */}
          <div className="dbz-legend">
            <span>5 dBZ</span>
            <div className="dbz-bar">
              <div className="dbz-seg" style={{ background: '#00e5ff' }} />
              <div className="dbz-seg" style={{ background: '#00e676' }} />
              <div className="dbz-seg" style={{ background: '#ffd600' }} />
              <div className="dbz-seg" style={{ background: '#ff9100' }} />
              <div className="dbz-seg" style={{ background: '#ff1744' }} />
              <div className="dbz-seg" style={{ background: '#e040fb' }} />
            </div>
            <span>75+ dBZ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DopplerRadar;
