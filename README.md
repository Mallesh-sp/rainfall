# 🌧️ PluviaVision AI - Next-Gen Precipitation & Doppler Meteorological Intelligence

> An advanced AI-powered meteorological analysis and rainfall prediction platform combining XGBoost Machine Learning, Live Global Weather APIs (Google/WMO standards), Interactive Doppler Radar, and Real-time Hydro-meteorological Analytics.

---

## 🌟 Key Features

- **🎯 Google Weather-Grade Live Prediction:**
  - Real-time live weather fetching across any global city, state, or coordinates via high-precision meteorological APIs.
  - XGBoost Machine Learning classifier calibrated with physical meteorological constraints (dew-point spread, barometric pressure, cloud cover, and relative humidity).
  - 24-Hour hourly rainfall probability curve and 7-Day extended outlook.

- **📡 Interactive Doppler Radar Scope:**
  - Dynamic radar sweep visualization displaying active precipitation storm cells, convective reflectivity, and storm movement vectors.

- **🔊 Weather-Reactive Sound Synthesizer:**
  - Web Audio API synthesizer that dynamically triggers contextual acoustic feedback (rain burst, thunder crack, gentle drizzle, or sunny shimmer) based on real-time search results.

- **🗺️ Live Map & GIS Integration:**
  - Embedded Leaflet/Map view highlighting target coordinates, precipitation zones, and elevation markers.

- **🌾 Smart Agricultural Irrigation Optimizer:**
  - Real-time soil moisture saturation analysis and automated crop irrigation advisory to prevent overwatering.

- **🚰 Rainwater Harvesting & Rooftop Yield Calculator:**
  - Computes catchment volume, tank capacity, and potable water potential based on roof surface area and precipitation rate.

- **⚠️ Flash Flood Risk & Hydroplaning Hazard Advisory:**
  - Dynamic road safety rating (0-100), hydroplaning velocity thresholds, and municipal drainage overflow warnings.

- **🧪 Interactive Meteorology Lab Predictor:**
  - Fine-tune atmospheric parameters (Temperature, Humidity, Pressure, Cloud Cover, Wind Speed) and simulate micro-climate forecasts.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Canvas API, Web Audio API
- **Backend & ML:** Python 3, FastAPI, Uvicorn, XGBoost, Scikit-learn, Pandas, NumPy
- **Meteorology Data:** Open-Meteo API (WMO Weather Codes, MSL Barometric Pressure, High-Resolution Geocoding)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/Mallesh-sp/rainfall-prediction-ai.git
cd rainfall-prediction-ai
```

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
pip install fastapi uvicorn xgboost scikit-learn pandas numpy requests
```

### 3. Build & Run

#### Option A: Unified Server (Frontend + Backend on single port)
Build the frontend:
```bash
npm run build
```

Start the FastAPI server:
```bash
python server/xgboost_server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

#### Option B: Development Mode (Hot Reloading)
In terminal 1 (Backend):
```bash
python server/xgboost_server.py
```

In terminal 2 (Frontend):
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📊 Dataset & Model Performance

- **Dataset:** 8,000+ calibrated meteorological observations (`weather_rainfall_dataset.csv`).
- **Accuracy:** 95.38%
- **ROC-AUC Score:** 0.993
- **Features Analyzed:** Temperature, Relative Humidity, Sea-Level Pressure (MSL), Cloud Cover, Wind Speed, Dew Point Depression.

---

## 👤 Author

- **Mallesh sp** - [GitHub Profile](https://github.com/Mallesh-sp)

---

## 📄 License

This project is licensed under the MIT License.
