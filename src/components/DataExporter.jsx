import React from 'react';
import confetti from 'canvas-confetti';
import { Download, FileSpreadsheet, FileJson, Printer } from 'lucide-react';

const DataExporter = ({ locationName, currentIntensity, locationData }) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.85 }
    });
  };

  const exportCSV = () => {
    // Warn user if rainfall intensity is high
    if (currentIntensity > 20) {
      const proceed = window.confirm('⚠️ High rainfall intensity detected. Exporting may generate large data. Continue?');
      if (!proceed) return;
    }
    triggerConfetti();
    const rows = [
      ['Location', 'Precipitation Rate (mm/h)', '24h Accumulation (mm)', 'Pressure (hPa)', 'Humidity (%)', 'Timestamp'],
      [locationName, currentIntensity, (currentIntensity * 14.2).toFixed(1), locationData.pressure, locationData.humidity, new Date().toISOString()]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PluviaVision_${locationName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    // Warn user if rainfall intensity is high
    if (currentIntensity > 20) {
      const proceed = window.confirm('⚠️ High rainfall intensity detected. Exporting large JSON may take time. Continue?');
      if (!proceed) return;
    }
    triggerConfetti();
    const dataObj = {
      system: 'PluviaVision AI',
      generatedAt: new Date().toISOString(),
      location: locationName,
      meteorologicalTelemetry: {
        precipitationRateMmH: currentIntensity,
        accumulated24hMm: Number((currentIntensity * 14.2).toFixed(1)),
        pressureHpa: locationData.pressure,
        humidityPct: locationData.humidity,
        windSpeedKmh: locationData.windSpeed,
        soilSaturationPct: locationData.soilSaturation
      }
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `PluviaVision_${locationName.replace(/[^a-zA-Z0-9]/g, '_')}_Data.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card fade-in">
      <div className="card-header">
        <div className="card-title">
          <Download className="card-title-icon" />
          Export Hydro-Meteorological Logs
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <FileSpreadsheet size={16} color="#00e676" /> Export CSV Log
        </button>
        <button className="btn btn-secondary" onClick={exportJSON}>
          <FileJson size={16} color="#00f2fe" /> Export JSON Telemetry
        </button>
      </div>
    </div>
  );
};

export default DataExporter;
