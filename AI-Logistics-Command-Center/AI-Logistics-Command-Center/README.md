# AI Logistics Command Center

A dark-mode front-end prototype for a US trucking and freight dispatch operations dashboard.

## What's included

- Overview with sample KPI cards, revenue chart and load status breakdown
- Load board with search and status filters
- Create-load modal (adds a browser-session demo record only)
- Dispatch queue
- Fleet map with illustrative sample positions
- Driver directory
- Analytics page and CSV export
- Simulated AI dispatch assistant
- Planned AI Employees overview

## Run locally

1. Download and extract this folder.
2. Open `index.html` in a modern browser.
3. Internet access is needed for the external map tiles, Leaflet, Chart.js and Google Fonts.

For a local web server (optional), open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository, for example `AI-Logistics-Command-Center`.
2. Upload `index.html`, `style.css`, `script.js`, `README.md` and `.nojekyll` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then click **Save**.
6. Wait for deployment and open the URL shown in the Pages section.

The entry file `index.html` must be in the root of the selected publishing folder.

## Important limitations

This is a front-end demo, not a production TMS (Transportation Management System).

- All loads, financial metrics, drivers and map markers are sample data.
- The map markers are illustrative and are not live GPS positions.
- The assistant uses fixed demo responses; no AI model is connected.
- Creating a load changes the page's in-memory demo list only. It is not saved to a database.
- GitHub Pages serves static files. Real user accounts, persistent shared data, integrations, API credentials and AI agents require a separate backend/service.
- Do not publish real customer, driver, shipment, payment or other sensitive business data in a public repository.

## Next development phase

1. Connect a backend and database.
2. Add authentication and role-based access.
3. Connect a real TMS/load board and carrier data source.
4. Connect GPS/ELD telematics for live fleet tracking.
5. Connect an AI model and then integrate the eight AI Employees framework.
