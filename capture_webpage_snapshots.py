import os
import time
import shutil
from playwright.sync_api import sync_playwright

SNAPSHOTS_DIR = r"c:\Users\HomePC\OneDrive\Desktop\rainfall\snapshots"
os.makedirs(SNAPSHOTS_DIR, exist_ok=True)
print(f"Target Snapshots Directory: {SNAPSHOTS_DIR}")

def capture_all():
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(channel="msedge", headless=True)
        except Exception:
            browser = p.chromium.launch(headless=True)
            
        context = browser.new_context(
            viewport={'width': 1600, 'height': 1000},
            device_scale_factor=2
        )
        page = context.new_page()
        
        print("Navigating to http://localhost:5173/ ...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        time.sleep(2)
        
        # 0. Full Dashboard Panoramic View
        full_page_path = os.path.join(SNAPSHOTS_DIR, "00_Full_Web_Dashboard.png")
        page.screenshot(path=full_page_path, full_page=True)
        print(f"[OK] Saved: {full_page_path}")
        
        # Click Predict Button in LabPredictor to trigger active prediction output state
        try:
            predict_btn = page.locator("button:has-text('Predict Rainfall with XGBoost AI'), button:has-text('Predict Rainfall')").first
            if predict_btn.count() > 0:
                predict_btn.scroll_into_view_if_needed()
                predict_btn.click()
                time.sleep(1.5)
                print("[OK] Triggered XGBoost AI Prediction on UI")
        except Exception as e:
            print("Notice:", e)
            
        cards = page.locator(".glass-card, .dashboard-grid > div").all()
        print(f"Detected {len(cards)} UI cards on page.")

        # 1. Capture LabPredictor (Fig 7.6 Rainfall Prediction Result UI)
        lab_el = page.locator("div.glass-card:has-text('Lab & Custom Weather Prediction Engine')").first
        if lab_el.count() > 0:
            lab_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            lab_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.6_Rainfall_Prediction_Webpage_UI.png")
            lab_el.screenshot(path=lab_path)
            print(f"[OK] Saved: {lab_path}")
            
        # 2. Capture Doppler Radar (Fig 7.2 Doppler Telemetry)
        radar_el = page.locator("div.glass-card:has-text('Doppler Radar')").first
        if radar_el.count() > 0:
            radar_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            radar_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.2_Doppler_Radar_Telemetry_UI.png")
            radar_el.screenshot(path=radar_path)
            print(f"[OK] Saved: {radar_path}")
            
        # 3. Capture Precipitation Forecast Charts (Fig 7.3 Trend)
        forecast_el = page.locator("div.glass-card:has-text('Precipitation Analytics')").first
        if forecast_el.count() > 0:
            forecast_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            fc_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.3_Precipitation_Forecast_Charts_UI.png")
            forecast_el.screenshot(path=fc_path)
            print(f"[OK] Saved: {fc_path}")
            
            # Switch to 7-Day History Tab and take another screenshot
            try:
                seven_day_tab = forecast_el.locator("button:has-text('7-Day History')").first
                if seven_day_tab.count() > 0:
                    seven_day_tab.click()
                    time.sleep(0.8)
                    fc_7day_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.3_7Day_History_Rainfall_Trend_UI.png")
                    forecast_el.screenshot(path=fc_7day_path)
                    print(f"[OK] Saved: {fc_7day_path}")
            except Exception as e:
                print(e)
                
        # 4. Capture Meteorological Metrics Grid
        metrics_el = page.locator(".metrics-grid").first
        if metrics_el.count() > 0:
            metrics_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            metrics_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.1_Meteorological_Metrics_Grid_UI.png")
            metrics_el.screenshot(path=metrics_path)
            print(f"[OK] Saved: {metrics_path}")
            
        # 5. Capture Agricultural Irrigation Saver
        agri_el = page.locator("div.glass-card:has-text('Agricultural Crop Irrigation')").first
        if agri_el.count() > 0:
            agri_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            agri_path = os.path.join(SNAPSHOTS_DIR, "Web_Agricultural_Crop_Irrigation_UI.png")
            agri_el.screenshot(path=agri_path)
            print(f"[OK] Saved: {agri_path}")
            
        # 6. Capture Road Safety Meter
        road_el = page.locator("div.glass-card:has-text('Road Safety')").first
        if road_el.count() > 0:
            road_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            road_path = os.path.join(SNAPSHOTS_DIR, "Web_Road_Safety_Hydroplaning_UI.png")
            road_el.screenshot(path=road_path)
            print(f"[OK] Saved: {road_path}")
            
        # 7. Capture Rainwater Harvesting Calculator
        tank_el = page.locator("div.glass-card:has-text('Rainwater Harvesting')").first
        if tank_el.count() > 0:
            tank_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            tank_path = os.path.join(SNAPSHOTS_DIR, "Web_Rainwater_Harvesting_Tank_UI.png")
            tank_el.screenshot(path=tank_path)
            print(f"[OK] Saved: {tank_path}")
            
        # 8. Capture Flood Alert Panel
        flood_el = page.locator("div.glass-card:has-text('Flood Risk')").first
        if flood_el.count() > 0:
            flood_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            flood_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.5_Flood_Alert_Panel_UI.png")
            flood_el.screenshot(path=flood_path)
            print(f"[OK] Saved: {flood_path}")
            
        # 9. Capture Scenario Simulator (Fig 7.4 Physics Simulation)
        sim_el = page.locator("div.glass-card:has-text('Scenario Simulator')").first
        if sim_el.count() > 0:
            sim_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            sim_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.4_Scenario_Simulator_UI.png")
            sim_el.screenshot(path=sim_path)
            print(f"[OK] Saved: {sim_path}")
            
        # 10. Capture Data Exporter (Fig 7.1 Dataset Schema / Log Exporter)
        exp_el = page.locator("div.glass-card:has-text('Dataset & Hydro-Log Exporter')").first
        if exp_el.count() > 0:
            exp_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            exp_path = os.path.join(SNAPSHOTS_DIR, "Fig_7.1_Dataset_Exporter_UI.png")
            exp_el.screenshot(path=exp_path)
            print(f"[OK] Saved: {exp_path}")

        # 11. Copy all 6 High-Res Report Figures into the snapshots folder
        report_src = r"c:\Users\HomePC\OneDrive\Desktop\rainfall\report_snapshots"
        if os.path.exists(report_src):
            for file in sorted(os.listdir(report_src)):
                if file.endswith(".png"):
                    shutil.copy2(os.path.join(report_src, file), os.path.join(SNAPSHOTS_DIR, file))
                    print(f"[OK] Copied Report Figure: {file}")

        browser.close()
        print("\nAll snapshots successfully generated and saved into 'snapshots/' folder!")

if __name__ == "__main__":
    capture_all()
