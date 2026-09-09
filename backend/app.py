import os
import json
from pathlib import Path
from datetime import datetime
import traceback
import joblib, numpy as np, pandas as pd, requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from services.unified_delay_engine import combine_delay_impacts
from services.event_processor import (
    process_simulation_event,
    process_telemetry_event,
    process_asset_event,
    process_alert_event
)

from services.active_event_manager import (
    add_event,
    get_active_events,
    remove_event,
    clear_all_events
)

BASE=Path(__file__).resolve().parent
ROOT=BASE.parent
load_dotenv(BASE/".env")
MODEL=BASE/"random_forest_v2_eta_model.pkl"
DATA=BASE/"major_section_history.csv"
KEY=os.getenv("RAILRADAR_API_KEY","")
API=os.getenv("RAILRADAR_API_BASE","https://api.railradar.in/v1")

app=Flask(__name__,static_folder=str(ROOT/"frontend"), static_url_path="")
CORS(app)
active_events = []

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
def normalize_section(section):

    if not section:
        return ""

    normalized = str(section).lower()

    normalized = normalized.replace(
        "junction",
        ""
    )

    normalized = normalized.replace(
        "jn",
        ""
    )

    normalized = normalized.replace(
        "j.n.",
        ""
    )

    # Remove all section separators
    normalized = normalized.replace("-", "")
    normalized = normalized.replace("→", "")
    normalized = normalized.replace("->", "")
    normalized = normalized.replace("to", "")

    # Remove spaces
    normalized = normalized.replace(" ", "")

    return normalized

def forecast(train, station, delay):

    r = route(train)

    if r.empty:
        raise RuntimeError(
            f"No historical route data found for train {train}"
        )


    # =====================================
    # FIND START SECTION
    # =====================================

    q = str(
        station or ""
    ).strip().lower()

    start = 0

    for i, (_, row) in enumerate(
        r.iterrows()
    ):

        if q in {

            str(
                row.get(
                    "from_station",
                    ""
                )
            ).lower(),

            str(
                row.get(
                    "from_code",
                    ""
                )
            ).lower()

        }:

            start = i
            break


    # =====================================
    # GET FUTURE SECTIONS
    # =====================================

    up = r.iloc[start:]


    # =====================================
    # INITIAL VALUES
    # =====================================

    cur = max(
        0,
        num(delay)
    )

    prevchg = 0

    prevarr = cur

    prevrun = num(
        up.iloc[0].get(
            "historical_avg_running_time"
        )
    )

    cum = cur

    out = []


    # =====================================
    # NORMALIZE SECTION NAME
    # =====================================

    # =====================================
# NORMALIZE SECTION NAME
# =====================================


    # =====================================
    # GET ALL ACTIVE EVENTS
    # =====================================

    active_events = get_active_events()
    print("DEBUG: START FORECAST FUNCTION")
    print("DEBUG: UP ROWS =", len(up))
    print("DEBUG: ACTIVE EVENTS =", active_events)

    # =====================================
    # FORECAST EACH SECTION
    # =====================================

    for _, row in up.iterrows():
        print(
    "DEBUG: PROCESSING",
    row.get("from_station"),
    "->",
    row.get("to_station")
)
        # ML MODEL INPUT CONTINUES HERE

        # =================================
        # ML MODEL INPUT
        # =================================

        vals = {

            "departure_delay_min":
                cur,

            "section_number":
                num(
                    row.get(
                        "section_number"
                    )
                ),

            "scheduled_running_time_min":
                num(
                    row.get(
                        "scheduled_running_time_min"
                    )
                ),

            "historical_avg_delay_change":
                num(
                    row.get(
                        "historical_avg_delay_change"
                    )
                ),

            "historical_delay_std":
                num(
                    row.get(
                        "historical_delay_std"
                    )
                ),

            "historical_avg_recovery":
                num(
                    row.get(
                        "historical_avg_recovery"
                    )
                ),

            "historical_recovery_rate":
                num(
                    row.get(
                        "historical_recovery_rate"
                    )
                ),
            "historical_avg_running_time":
                num(
                    row.get(
                        "historical_avg_running_time"
                    )
                ),

            "previous_delay_change":
                prevchg,

            "previous_arrival_delay":
                prevarr,

            "previous_running_time":
                prevrun,

            "cumulative_previous_delay":
                cum
        }


        # =================================
        # RANDOM FOREST V2
        # PREDICT DELAY CHANGE
        # =================================

        change = num(
            model.predict(
                pd.DataFrame(
                    [vals],
                    columns=FEATURES
                ).fillna(0)
            )[0]
        )


        # =================================
        # CURRENT SECTION
        # =================================

        from_name = str(
            row.get(
                "from_station",
                ""
            )
        ).strip()


        to_name = str(
            row.get(
                "to_station",
                ""
            )
        ).strip()


        current_section = (
            f"{from_name}→{to_name}"
        )


        normalized_current_section = (
            normalize_section(
                current_section
            )
        )


        # =================================
        # FIND ACTIVE EVENTS
        # FOR CURRENT SECTION
        # =================================

        section_events = [
            event
            for event in active_events
            if normalize_section(
                event.get(
                    "section",
                    ""
                )
            )
            == normalized_current_section
        ]


        # =================================
        # DEBUG
        # =================================

        print(
            "ROUTE SECTION:",
            normalized_current_section
        )


        print(
            "EVENT SECTIONS:",
            [
                normalize_section(
                    event.get(
                        "section",
                        ""
                    )
                )
                for event in active_events
            ]
        )


        print(
            "MATCHED EVENTS:",
            section_events
        )


        # =================================
        # COMBINE DELAY IMPACTS
        # =================================

        combined_result = combine_delay_impacts(
            section_events
        )


        simulation_impact = (
            combined_result.get(
                "total_delay_impact_min",
                0
            )
        )


        # =================================
        # FINAL PREDICTED DELAY
        # Historical + ML Prediction
        # + Simulation Event Impact
        # =================================

        pred = max(
            0,
            cur
            + change
            + simulation_impact
        )


        # =================================
        # SCHEDULED ARRIVAL
        # =================================

        sa = pd.to_datetime(
            row.get(
                "scheduled_arrival"
            ),
            errors="coerce"
        )


        # =================================
        # FINAL ETA
        # =================================

        if not pd.isna(sa):

            eta = (
                sa
                + pd.Timedelta(
                    minutes=pred
                )
            ).strftime("%H:%M")

        else:

            eta = "--"


        # =================================
        # RECOVERY PROBABILITY
        # =================================

        rec = (
            num(
                row.get(
                    "historical_recovery_rate"
                )
            )
            * 100
        )


        # =================================
        # CONFIDENCE
        # =================================

        conf = float(
            np.clip(
                70
                + rec * 0.12
                + (
                    15
                    if abs(change) <= 3
                    else 0
                ),
                60,
                95
            )
        )


        # =================================
        # STATUS
        # =================================

        status = (
            "ON TIME"
            if pred <= 2
            else (
                "SLIGHT DELAY"
                if pred <= 10
                else "DELAYED"
            )
        )


        # =================================
        # OUTPUT
        # =================================

        out.append({

            "section_number":
                int(
                    num(
                        row.get(
                            "section_number"
                        )
                    )
                ),

            "from_station":
                from_name,

            "to_station":
                to_name,

            "from_code":
                row.get(
                    "from_code"
                ),

            "to_code":
                row.get(
                    "to_code"
                ),

            "scheduled_eta":
                (
                    sa.strftime(
                        "%H:%M"
                    )
                    if not pd.isna(sa)
                    else "--"
                ),

            "predicted_eta":
                eta,

            "predicted_delay_min":
                round(
                    pred,
                    1
                ),

            "predicted_delay_change":
                round(
                    change,
                    1
                ),

            "simulation_impact_min":
                round(
                    simulation_impact,
                    1
                ),

            "recovery_probability_percent":
                round(
                    rec,
                    1
                ),

            "confidence_percent":
                round(
                    conf,
                    1
                ),

            "status":
                status

        })


        # =================================
        # UPDATE VALUES FOR NEXT SECTION
        # =================================

        prevchg = change

        prevarr = pred

        prevrun = num(
            row.get(
                "historical_avg_running_time",
                prevrun
            )
        )

        cum = pred

        cur = pred


    # =====================================
    # RETURN FUTURE ETA PREDICTIONS
    # =====================================
    print("DEBUG: FORECAST FINISHED")
    print("DEBUG: OUTPUT COUNT =", len(out))
    return out
@app.get("/")
def index():
    return send_from_directory(
        app.static_folder,
        "index.html"
    )


@app.get("/api/health")
def health():
    return jsonify(
        ok=True,
        model_loaded=True,
        historical_records=len(df)
    )


@app.get("/api/live/<train>")
def get_live(train):
    try:
        return jsonify(
            success=True,
            live=normalize(
                live_api(
                    train,
                    request.args.get("date")
                )
            )
        )

    except Exception as e:
        return jsonify(
            success=False,
            error=str(e)
        ), 502

@app.get("/api/forecast/<train>")
def get_forecast(train):
    print("FORECAST FUNCTION: NEW MANUAL VERSION")
    try:
        station = request.args.get("station")
        manual_delay = request.args.get("delay")
        date = request.args.get("date")

        # =====================================
        # TEST / MANUAL MODE
        # =====================================
        if station and manual_delay is not None:

            delay = float(manual_delay)

            p = forecast(
                train,
                station,
                delay
            )
            print("FORECAST RESULT:", p)
            print("FORECAST TYPE:", type(p))
            return jsonify(
                success=True,

                train={
                    "train_number": train,
                    "current_station": station,
                    "delay": round(delay, 1)
                },

                predictions=p,

                generated_at=datetime.now().isoformat(
                    timespec="seconds"
                ),

                source=(
                    "Manual Test + Historical Patterns + "
                    "Random Forest V2 + Simulation"
                )
            )

        # =====================================
        # NORMAL MODE — RailRadar
        # =====================================

        l = normalize(
            live_api(train, date)
        )

        status = str(
            l["status"]
        ).lower()

        delay = l["delay"]

        if status in {
            "not-started",
            "not_started",
            "scheduled"
        }:

            r = route(train)

            if not r.empty:

                first = r.iloc[0]

                vals = df[
                    df.section_number
                    == first.section_number
                ][
                    "departure_delay_min"
                ].mean()

                delay = max(
                    0,
                    num(vals)
                )

        station = (
            l["current_code"]
            or l["current_name"]
        )

        p = forecast(
            train,
            station,
            delay
        )

        return jsonify(
            success=True,

            train={
                **l,
                "delay": round(delay, 1)
            },

            predictions=p,

            generated_at=datetime.now().isoformat(
                timespec="seconds"
            ),

            source=(
                "RailRadar + Historical Patterns + "
                "Random Forest V2"
            )
        )

    except Exception as e:

        traceback.print_exc()

        return jsonify(
            success=False,
            error=str(e)
        ), 500
# ---------------- TRACK MAINTENANCE ----------------

MAINTENANCE_FILE = os.path.join(
    os.path.dirname(__file__),
    "maintenance.json"
)

def load_maintenance():
    if not os.path.exists(MAINTENANCE_FILE):
        return []
    try:
        with open(MAINTENANCE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_maintenance(data):
    with open(MAINTENANCE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


@app.get("/api/maintenance")
def get_maintenance():
    return jsonify(
        success=True,
        maintenance=load_maintenance()
    )


@app.post("/api/maintenance")
def add_maintenance():
    try:
        body = request.get_json(force=True) or {}

        required = [
            "from_station",
            "to_station",
            "from_km",
            "to_km",
            "repair_type",
            "normal_speed",
            "restricted_speed",
            "start_time",
            "end_time"
        ]

        missing = [
            x for x in required
            if str(body.get(x, "")).strip() == ""
        ]

        if missing:
            return jsonify(
                success=False,
                error="Missing fields: " + ", ".join(missing)
            ), 400

        records = load_maintenance()

        next_id = max(
            [int(x.get("id", 0)) for x in records] or [0]
        ) + 1

        record = {
            "id": next_id,
            "from_station": str(body["from_station"]).strip(),
            "to_station": str(body["to_station"]).strip(),
            "from_km": float(body["from_km"]),
            "to_km": float(body["to_km"]),
            "repair_type": str(body["repair_type"]).strip(),
            "normal_speed": float(body["normal_speed"]),
            "restricted_speed": float(body["restricted_speed"]),
            "start_time": str(body["start_time"]),
            "end_time": str(body["end_time"]),
            "notes": str(body.get("notes", "")).strip()
        }

        records.append(record)
        save_maintenance(records)

        return jsonify(
            success=True,
            maintenance=record
        ), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify(
            success=False,
            error=str(e)
        ), 500


@app.delete("/api/maintenance/<int:maintenance_id>")
def delete_maintenance(maintenance_id):
    records = load_maintenance()

    updated = [
        x for x in records
        if int(x.get("id", 0)) != maintenance_id
    ]

    if len(updated) == len(records):
        return jsonify(
            success=False,
            error="Maintenance restriction not found"
        ), 404

    save_maintenance(updated)

    return jsonify(
        success=True,
        message="Maintenance restriction removed"
    )
# ==========================================
# SIMULATION EVENT
# ==========================================

def add_simulation_event():

    try:

        body = request.get_json(
            force=True
        ) or {}


        # ==================================
        # PROCESS EVENT
        #
        # Automatically selects:
        #
        # signal_halt
        # congestion
        # preceding_train
        # level_crossing
        # operational_bottleneck
        # temporary_speed_restriction
        # unscheduled_maintenance
        # ==================================

        event = process_simulation_event(
            body
        )


        # ==================================
        # STORE ACTIVE EVENT
        # ==================================

        stored_event = add_event(
            event
        )


        return jsonify(

            success=True,

            event=stored_event

        ), 201


    except Exception as e:

        traceback.print_exc()

        return jsonify(

            success=False,

            error=str(e)
        )
  # ==========================================
# SIMULATION EVENT
# ==========================================

@app.post("/api/simulation/event")
def add_simulation_event():

    try:

        body = request.get_json(
            force=True
        ) or {}

        event = process_simulation_event(
            body
        )

        stored_event = add_event(
            event
        )

        return jsonify(
            success=True,
            event=stored_event
        ), 201

    except Exception as e:

        traceback.print_exc()

        return jsonify(
            success=False,
            error=str(e)
        ), 400


# ==========================================
# GET ACTIVE EVENTS
# ==========================================

@app.get("/api/events")
def get_events():

    events = get_active_events()

    return jsonify(
        success=True,
        events=events,
        count=len(events)
    )


# ==========================================
# CLEAR ALL EVENTS
# ==========================================

@app.delete("/api/events")
def clear_events():

    clear_all_events()

    return jsonify(
        success=True,
        message="All active events cleared"
    )


# ==========================================
# RAILWAY AUTHORIZED API - TELEMETRY
# ==========================================

@app.post("/api/railway/telemetry/event")
def add_telemetry_event():

    try:

        body = request.get_json(
            force=True
        ) or {}

        feature = body.get("feature")

        if not feature:
            raise ValueError(
                "feature is required"
            )

        event = process_telemetry_event(
            feature,
            body
        )

        stored_event = add_event(
            event
        )

        return jsonify(
            success=True,
            event=stored_event
        ), 201

    except Exception as e:

        traceback.print_exc()

        return jsonify(
            success=False,
            error=str(e)
        ), 400


# ==========================================
# RAILWAY AUTHORIZED API - ASSET
# ==========================================

@app.post("/api/railway/asset/event")
def add_asset_event():

    try:

        body = request.get_json(
            force=True
        ) or {}

        feature = body.get("feature")

        if not feature:
            raise ValueError(
                "feature is required"
            )

        event = process_asset_event(
            feature,
            body
        )

        stored_event = add_event(
            event
        )

        return jsonify(
            success=True,
            event=stored_event
        ), 201

    except Exception as e:

        traceback.print_exc()

        return jsonify(
            success=False,
            error=str(e)
        ), 400


# ==========================================
# RAILWAY AUTHORIZED API - ALERT
# ==========================================

@app.post("/api/railway/alert/event")
def add_alert_event():

    try:

        body = request.get_json(
            force=True
        ) or {}

        feature = body.get("feature")

        if not feature:
            raise ValueError(
                "feature is required"
            )

        event = process_alert_event(
            feature,
            body
        )

        stored_event = add_event(
            event
        )

        return jsonify(
            success=True,
            event=stored_event
        ), 201

    except Exception as e:

        traceback.print_exc()

        return jsonify(
            success=False,
            error=str(e)
        ), 400


# ==========================================
# RUN APPLICATION
# ==========================================
print(app.url_map)

if __name__ == "__main__":

    print(
        "RailForecast: http://127.0.0.1:5000"
    )

    app.run(
        host="0.0.0.0",
        port=int(
            os.getenv(
                "PORT",
                "5000"
            )
        ),
        debug=False
    )
