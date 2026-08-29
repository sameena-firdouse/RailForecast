import os
from pathlib import Path
from datetime import datetime
import traceback
import joblib, numpy as np, pandas as pd, requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

BASE=Path(__file__).resolve().parent
ROOT=BASE.parent
load_dotenv(BASE/".env")
MODEL=BASE/"random_forest_v2_eta_model.pkl"
DATA=BASE/"major_section_history.csv"
KEY=os.getenv("RAILRADAR_API_KEY","")
API=os.getenv("RAILRADAR_API_BASE","https://api.railradar.in/v1")

app=Flask(__name__,static_folder=str(ROOT/"frontend"), static_url_path="")
CORS(app)

FEATURES=["departure_delay_min","section_number","scheduled_running_time_min",
"historical_avg_delay_change","historical_delay_std","historical_avg_recovery",
"historical_recovery_rate","historical_avg_running_time","previous_delay_change",
"previous_arrival_delay","previous_running_time","cumulative_previous_delay"]

print("Loading Random Forest V2 model...")
model=joblib.load(MODEL)
print("Model loaded successfully.")
df=pd.read_csv(DATA)
print(f"Historical records loaded: {len(df)}")
for c in ["scheduled_arrival","scheduled_departure","actual_arrival","actual_departure"]:
    if c in df: df[c]=pd.to_datetime(df[c],errors="coerce")

H=(df.groupby("section_number").agg(
 historical_avg_delay_change=("delay_change_min","mean"),
 historical_delay_std=("delay_change_min","std"),
 historical_avg_recovery=("recovery_min","mean"),
 historical_recovery_rate=("delay_change_min",lambda x:(x<0).mean()),
 historical_avg_running_time=("actual_running_time_min","mean")).reset_index())

def num(x,d=0.0):
    try:
        v=float(x); return d if not np.isfinite(v) else v
    except: return d

def route(train):
    r=df[df.train_number.astype(str)==str(train)].sort_values("section_number").drop_duplicates("section_number").copy()
    return r.merge(H,on="section_number",how="left") if not r.empty else r

def live_api(train,date=None):
    if not KEY:
    raise RuntimeError(
        "RAILRADAR_API_KEY environment variable is missing."
    )
    params={"date":date} if date else {}
    r=requests.get(f"{API.rstrip('/')}/trains/{train}/live",
                   headers={"Authorization":f"Bearer {KEY}"},params=params,timeout=30)
    r.raise_for_status()
    x=r.json()
    if isinstance(x,dict) and x.get("success") is False: raise RuntimeError(x.get("message","RailRadar returned success=false"))
    return x.get("data",x)

def normalize(x):
    cl=x.get("currentLocation") or {}; nh=x.get("nextHalt") or {}
    return {"number":str(x.get("trainNumber") or ""),
            "name":x.get("trainName") or "",
            "status":x.get("status","unknown"),
            "delay":num(x.get("delayMinutes",x.get("delay",0))),
            "current_code":cl.get("stationCode") or x.get("currentStationCode"),
            "current_name":cl.get("stationName") or x.get("currentStationName"),
            "next_code":nh.get("stationCode") or nh.get("code"),
            "next_name":nh.get("stationName") or nh.get("name")}

def forecast(train,station,delay):
    r=route(train)
    if r.empty: raise RuntimeError(f"No historical route data found for train {train}")
    q=str(station or "").strip().lower()
    start=0
    for i,(_,row) in enumerate(r.iterrows()):
        if q in {str(row.get("from_station","")).lower(),str(row.get("from_code","")).lower()}:
            start=i; break
    up=r.iloc[start:]
    cur=max(0,num(delay)); prevchg=0; prevarr=cur
    prevrun=num(up.iloc[0].get("historical_avg_running_time")); cum=cur
    out=[]
    for _,row in up.iterrows():
        vals={"departure_delay_min":cur,"section_number":num(row.get("section_number")),
        "scheduled_running_time_min":num(row.get("scheduled_running_time_min")),
        "historical_avg_delay_change":num(row.get("historical_avg_delay_change")),
        "historical_delay_std":num(row.get("historical_delay_std")),
        "historical_avg_recovery":num(row.get("historical_avg_recovery")),
        "historical_recovery_rate":num(row.get("historical_recovery_rate")),
        "historical_avg_running_time":num(row.get("historical_avg_running_time")),
        "previous_delay_change":prevchg,"previous_arrival_delay":prevarr,
        "previous_running_time":prevrun,"cumulative_previous_delay":cum}
        change=num(model.predict(pd.DataFrame([vals],columns=FEATURES).fillna(0))[0])
        pred=max(0,cur+change)
        sa=pd.to_datetime(row.get("scheduled_arrival"),errors="coerce")
        eta=(sa+pd.Timedelta(minutes=pred)).strftime("%H:%M") if not pd.isna(sa) else "--"
        rec=num(row.get("historical_recovery_rate"))*100
        conf=float(np.clip(70+rec*.12+(15 if abs(change)<=3 else 0),60,95))
        status="ON TIME" if pred<=2 else ("SLIGHT DELAY" if pred<=10 else "DELAYED")
        out.append({"section_number":int(num(row.get("section_number"))),
        "from_station":row.get("from_station"),"to_station":row.get("to_station"),
        "from_code":row.get("from_code"),"to_code":row.get("to_code"),
        "scheduled_eta":sa.strftime("%H:%M") if not pd.isna(sa) else "--",
        "predicted_eta":eta,"predicted_delay_min":round(pred,1),
        "predicted_delay_change":round(change,1),
        "recovery_probability_percent":round(rec,1),
        "confidence_percent":round(conf,1),"status":status})
        prevchg,prevarr,prevrun,cum,cur=change,pred,num(row.get("historical_avg_running_time"),prevrun),pred,pred
    return out

@app.get("/")
def index(): return send_from_directory(app.static_folder,"index.html")

@app.get("/api/health")
def health(): return jsonify(ok=True,model_loaded=True,historical_records=len(df))

@app.get("/api/live/<train>")
def get_live(train):
    try: return jsonify(success=True,live=normalize(live_api(train,request.args.get("date"))))
    except Exception as e: return jsonify(success=False,error=str(e)),502

@app.get("/api/forecast/<train>")
def get_forecast(train):
    try:
        date=request.args.get("date"); station=request.args.get("station")
        l=normalize(live_api(train,date))
        status=str(l["status"]).lower()
        delay=l["delay"]
        if status in {"not-started","not_started","scheduled"}:
            r=route(train)
            if not r.empty:
                first=r.iloc[0]
                vals=df[df.section_number==first.section_number]["departure_delay_min"].mean()
                delay=max(0,num(vals))
        station=station or l["current_code"] or l["current_name"]
        p=forecast(train,station,delay)
        return jsonify(success=True,train={**l,"delay":round(delay,1)},
                       predictions=p,generated_at=datetime.now().isoformat(timespec="seconds"),
                       source="RailRadar + historical patterns + Random Forest V2")
    except Exception as e:
        traceback.print_exc(); return jsonify(success=False,error=str(e)),500

if __name__=="__main__":
    print("RailForecast: http://127.0.0.1:5000")
    app.run(host="0.0.0.0",port=int(os.getenv("PORT","5000")),debug=False)
