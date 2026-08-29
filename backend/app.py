import os
from pathlib import Path
from datetime import datetime, timezone
import traceback
import sqlite3
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
MAINT_DB=BASE/"maintenance.db"

app=Flask(__name__,static_folder=str(ROOT/"frontend"),static_url_path="")
CORS(app)
FEATURES=["departure_delay_min","section_number","scheduled_running_time_min","historical_avg_delay_change","historical_delay_std","historical_avg_recovery","historical_recovery_rate","historical_avg_running_time","previous_delay_change","previous_arrival_delay","previous_running_time","cumulative_previous_delay"]

print("Loading Random Forest V2 model...")
model=joblib.load(MODEL)
print("Model loaded successfully.")
df=pd.read_csv(DATA)
print(f"Historical records loaded: {len(df)}")
for c in ["scheduled_arrival","scheduled_departure","actual_arrival","actual_departure"]:
    if c in df: df[c]=pd.to_datetime(df[c],errors="coerce")
H=(df.groupby("section_number").agg(historical_avg_delay_change=("delay_change_min","mean"),historical_delay_std=("delay_change_min","std"),historical_avg_recovery=("recovery_min","mean"),historical_recovery_rate=("delay_change_min",lambda x:(x<0).mean()),historical_avg_running_time=("actual_running_time_min","mean")).reset_index())

def init_db():
    with sqlite3.connect(MAINT_DB) as con:
        con.execute("""CREATE TABLE IF NOT EXISTS maintenance (id INTEGER PRIMARY KEY AUTOINCREMENT, from_station TEXT NOT NULL, to_station TEXT NOT NULL, from_km REAL, to_km REAL, repair_type TEXT NOT NULL, normal_speed REAL NOT NULL, restricted_speed REAL NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL)""")
        con.commit()
init_db()

def num(x,d=0.0):
    try:
        v=float(x); return d if not np.isfinite(v) else v
    except: return d

def route(train):
    r=df[df.train_number.astype(str)==str(train)].sort_values("section_number").drop_duplicates("section_number").copy()
    return r.merge(H,on="section_number",how="left") if not r.empty else r

def live_api(train,date=None):
    if not KEY: raise RuntimeError("RAILRADAR_API_KEY environment variable is missing.")
    params={"date":date} if date else {}
    r=requests.get(f"{API.rstrip('/')}/trains/{train}/live",headers={"Authorization":f"Bearer {KEY}"},params=params,timeout=30)
    r.raise_for_status(); x=r.json()
    if isinstance(x,dict) and x.get("success") is False: raise RuntimeError(x.get("message","RailRadar returned success=false"))
    return x.get("data",x)

def normalize(x):
    cl=x.get("currentLocation") or {}; nh=x.get("nextHalt") or {}
    return {"number":str(x.get("trainNumber") or ""),"name":x.get("trainName") or "","status":x.get("status","unknown"),"delay":num(x.get("delayMinutes",x.get("delay",0))),"current_code":cl.get("stationCode") or x.get("currentStationCode"),"current_name":cl.get("stationName") or x.get("currentStationName"),"next_code":nh.get("stationCode") or nh.get("code"),"next_name":nh.get("stationName") or nh.get("name"),"speed_kmh":num(x.get("speedKmh",x.get("speed",0))),"latitude":x.get("latitude") or (cl.get("latitude")),"longitude":x.get("longitude") or (cl.get("longitude"))}

def parse_dt(s):
    try: return datetime.fromisoformat(str(s).replace("Z","+00:00"))
    except: return None

def active_maintenance():
    now=datetime.now(timezone.utc)
    rows=[]
    with sqlite3.connect(MAINT_DB) as con:
        con.row_factory=sqlite3.Row
        for row in con.execute("SELECT * FROM maintenance ORDER BY start_time"):
            st=parse_dt(row["start_time"]); en=parse_dt(row["end_time"])
            if st and en and st <= now <= en: rows.append(dict(row))
    return rows

def maintenance_for_section(row, active):
    fs=str(row.get("from_station","")).strip().lower(); ts=str(row.get("to_station","")).strip().lower()
    hits=[]
    for m in active:
        a=str(m["from_station"]).strip().lower(); b=str(m["to_station"]).strip().lower()
        if (a==fs and b==ts) or (a==ts and b==fs): hits.append(m)
    return hits

def maintenance_impact(row, active):
    hits=maintenance_for_section(row,active); total=0.0; details=[]
    normal=num(row.get("historical_avg_running_time"),num(row.get("scheduled_running_time_min"),0))
    distance=max(0.0,num(row.get("to_km"))-num(row.get("from_km")))
    for m in hits:
        rs=max(1.0,num(m["restricted_speed"]))
        ns=max(rs+0.1,num(m["normal_speed"]))
        if distance<=0:
            affected_km=max(0.0,num(m["to_km"])-num(m["from_km"]))
        else: affected_km=min(distance,max(0.0,num(m["to_km"])-num(m["from_km"])))
        if affected_km>0: extra=affected_km/rs*60-affected_km/ns*60
        else:
            extra=max(0.0,normal*(1-rs/ns))
        total+=extra
        details.append({"id":m["id"],"repair_type":m["repair_type"],"restricted_speed":rs,"normal_speed":ns,"from_station":m["from_station"],"to_station":m["to_station"],"impact_min":round(extra,1)})
    return total,details

def forecast(train,station,delay):
    r=route(train)
    if r.empty: raise RuntimeError(f"No historical route data found for train {train}")
    q=str(station or "").strip().lower(); start=0
    for i,(_,row) in enumerate(r.iterrows()):
        if q in {str(row.get("from_station","")).lower(),str(row.get("from_code","")).lower()}: start=i; break
    up=r.iloc[start:]; active=active_maintenance(); cur=max(0,num(delay)); prevchg=0; prevarr=cur; prevrun=num(up.iloc[0].get("historical_avg_running_time")); cum=cur; out=[]
    for _,row in up.iterrows():
        vals={"departure_delay_min":cur,"section_number":num(row.get("section_number")),"scheduled_running_time_min":num(row.get("scheduled_running_time_min")),"historical_avg_delay_change":num(row.get("historical_avg_delay_change")),"historical_delay_std":num(row.get("historical_delay_std")),"historical_avg_recovery":num(row.get("historical_avg_recovery")),"historical_recovery_rate":num(row.get("historical_recovery_rate")),"historical_avg_running_time":num(row.get("historical_avg_running_time")),"previous_delay_change":prevchg,"previous_arrival_delay":prevarr,"previous_running_time":prevrun,"cumulative_previous_delay":cum}
        change=num(model.predict(pd.DataFrame([vals],columns=FEATURES).fillna(0))[0]); ml_pred=max(0,cur+change)
        extra,md=maintenance_impact(row,active); pred=ml_pred+extra
        sa=pd.to_datetime(row.get("scheduled_arrival"),errors="coerce"); eta=(sa+pd.Timedelta(minutes=pred)).strftime("%H:%M") if not pd.isna(sa) else "--"
        rec=num(row.get("historical_recovery_rate"))*100; conf=float(np.clip(70+rec*.12+(15 if abs(change)<=3 else 0),60,95)); status="ON TIME" if pred<=2 else ("SLIGHT DELAY" if pred<=10 else "DELAYED")
        out.append({"section_number":int(num(row.get("section_number"))),"from_station":row.get("from_station"),"to_station":row.get("to_station"),"from_code":row.get("from_code"),"to_code":row.get("to_code"),"scheduled_eta":sa.strftime("%H:%M") if not pd.isna(sa) else "--","predicted_eta":eta,"predicted_delay_min":round(pred,1),"predicted_delay_change":round(pred-cur,1),"ml_delay_change":round(change,1),"maintenance_impact_min":round(extra,1),"maintenance":md,"recovery_probability_percent":round(rec,1),"confidence_percent":round(conf,1),"status":status})
        prevchg,prevarr,prevrun,cum,cur=pred-cur,pred,num(row.get("historical_avg_running_time"),prevrun),pred,pred
    return out

@app.get("/")
def index(): return send_from_directory(app.static_folder,"index.html")
@app.get("/api/health")
def health(): return jsonify(ok=True,model_loaded=True,historical_records=len(df),active_maintenance=len(active_maintenance()))
@app.get("/api/live/<train>")
def get_live(train):
    try: return jsonify(success=True,live=normalize(live_api(train,request.args.get("date"))))
    except Exception as e: return jsonify(success=False,error=str(e)),502
@app.get("/api/maintenance")
def get_maintenance(): return jsonify(success=True,maintenance=active_maintenance())
@app.post("/api/maintenance")
def add_maintenance():
    d=request.get_json(silent=True) or {}; required=["from_station","to_station","repair_type","normal_speed","restricted_speed","start_time","end_time"]
    missing=[k for k in required if d.get(k) in (None,"")]
    if missing: return jsonify(success=False,error="Missing: "+", ".join(missing)),400
    if num(d["restricted_speed"])<=0 or num(d["normal_speed"])<=0 or num(d["restricted_speed"])>=num(d["normal_speed"]): return jsonify(success=False,error="Restricted speed must be positive and lower than normal speed."),400
    st=parse_dt(d["start_time"]); en=parse_dt(d["end_time"])
    if not st or not en or en<=st: return jsonify(success=False,error="Invalid maintenance start/end time."),400
    with sqlite3.connect(MAINT_DB) as con:
        cur=con.execute("INSERT INTO maintenance(from_station,to_station,from_km,to_km,repair_type,normal_speed,restricted_speed,start_time,end_time,notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",(d["from_station"],d["to_station"],d.get("from_km"),d.get("to_km"),d["repair_type"],num(d["normal_speed"]),num(d["restricted_speed"]),d["start_time"],d["end_time"],d.get("notes",""),datetime.now(timezone.utc).isoformat()))
        ident=cur.lastrowid; con.commit()
    return jsonify(success=True,id=ident),201
@app.delete("/api/maintenance/<int:ident>")
def delete_maintenance(ident):
    with sqlite3.connect(MAINT_DB) as con:
        cur=con.execute("DELETE FROM maintenance WHERE id=?",(ident,)); con.commit()
    if cur.rowcount==0: return jsonify(success=False,error="Maintenance record not found"),404
    return jsonify(success=True)
@app.get("/api/forecast/<train>")
def get_forecast(train):
    try:
        date=request.args.get("date"); station=request.args.get("station"); l=normalize(live_api(train,date)); status=str(l["status"]).lower(); delay=l["delay"]
        if status in {"not-started","not_started","scheduled"}:
            r=route(train)
            if not r.empty: delay=max(0,num(df[df.section_number==r.iloc[0].section_number]["departure_delay_min"].mean()))
        station=station or l["current_code"] or l["current_name"]; p=forecast(train,station,delay)
        return jsonify(success=True,train={**l,"delay":round(delay,1)},predictions=p,active_maintenance=active_maintenance(),generated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),source="RailRadar + historical patterns + Random Forest V2 + track maintenance")
    except Exception as e: traceback.print_exc(); return jsonify(success=False,error=str(e)),500
if __name__=="__main__": app.run(host="0.0.0.0",port=int(os.getenv("PORT","5000")),debug=False)
