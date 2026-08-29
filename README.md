# RailForecast

1. Copy `random_forest_v2_eta_model.pkl` and `major_section_history.csv` into `backend/`.
2. Copy `backend/.env.example` to `backend/.env` and add your RailRadar API key.
3. From the RailForecast folder run:

```bash
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python backend/app.py
```

Open http://127.0.0.1:5000

The passenger UI never asks for current delay. It gets live station/delay from RailRadar and feeds the delay sequentially through your Random Forest V2 model.


## Deployment

### Render (Flask API)
1. Push this repository to GitHub.
2. In Render, create a Web Service from the repo.
3. Render can use `render.yaml`, or configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r ../requirements.txt`
   - Start Command: `gunicorn app:app`
4. Add environment variable `RAILRADAR_API_KEY`.
5. Keep `RAILRADAR_API_BASE=https://api.railradar.in/v1`.

### Vercel (frontend)
1. Import the GitHub repo into Vercel.
2. Deploy with the included `vercel.json`.
3. After Render deploys, edit `frontend/config.js` and set:
   `window.RAILFORECAST_API = "https://YOUR-RENDER-SERVICE.onrender.com";`
4. Redeploy Vercel.

### Important model/data files
Put these files in `backend/` before deploying:
- `random_forest_v2_eta_model.pkl`
- `major_section_history.csv`

Do NOT commit `.env` or your real RailRadar API key. Use Render Environment Variables.
