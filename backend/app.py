# ==========================================
# RAILFORECAST - MAIN FLASK APPLICATION
# ==========================================

import os
import json
from pathlib import Path
from datetime import datetime
import traceback

import joblib
import numpy as np
import pandas as pd
import requests

from flask import (
    Flask,
    jsonify,
    request,
    send_from_directory
)

from flask_cors import CORS
from dotenv import load_dotenv


# ==========================================
# EVENT MANAGEMENT
# ==========================================

from services.active_event_manager import (
    add_event,
    get_active_events,
    get_events_for_section,
    remove_event,
    clear_all_events
)


# ==========================================
# UNIFIED DELAY ENGINE
# ==========================================

from services.unified_delay_engine import (
    combine_delay_impacts
)


# ==========================================
# EVENT PROCESSOR
# ==========================================

from services.event_processor import (
    process_simulation_event,
    process_telemetry_event,
    process_asset_event,
    process_alert_event
)


# ==========================================
# PATH CONFIGURATION
# ==========================================

BASE = Path(
    __file__
).resolve().parent

ROOT = BASE.parent


# ==========================================
# ENVIRONMENT VARIABLES
# ==========================================

load_dotenv(
    BASE / ".env"
)


# ==========================================
# FILE PATHS
# ==========================================

MODEL = (
    BASE /
    "random_forest_v2_eta_model.pkl"
)

DATA = (
    BASE /
    "major_section_history.csv"
)


# ==========================================
# RAILRADAR CONFIGURATION
# ==========================================

KEY = os.getenv(
    "RAILRADAR_API_KEY",
    ""
)

API = os.getenv(
    "RAILRADAR_API_BASE",
    "https://api.railradar.in/v1"
)


# ==========================================
# FLASK APPLICATION
# ==========================================

app = Flask(
    __name__,
    static_folder=str(
        ROOT / "frontend"
    ),
    static_url_path=""
)

CORS(
    app
)


# ==========================================
# RANDOM FOREST FEATURES
# ==========================================

FEATURES = [

    "departure_delay_min",

    "section_number",

    "scheduled_running_time_min",

    "historical_avg_delay_change",

    "historical_delay_std",

    "historical_avg_recovery",

    "historical_recovery_rate",

    "historical_avg_running_time",

    "previous_delay_change",

    "previous_arrival_delay",

    "previous_running_time",

    "cumulative_previous_delay"

]


# ==========================================
# LOAD RANDOM FOREST MODEL
# ==========================================

print(
    "Loading Random Forest V2 model..."
)

model = joblib.load(
    MODEL
)

print(
    "Model loaded successfully."
)


# ==========================================
# LOAD HISTORICAL DATA
# ==========================================

df = pd.read_csv(
    DATA
)

print(
    f"Historical records loaded: {len(df)}"
)


# ==========================================
# CONVERT DATE COLUMNS
# ==========================================

for c in [

    "scheduled_arrival",

    "scheduled_departure",

    "actual_arrival",

    "actual_departure"

]:

    if c in df:

        df[c] = pd.to_datetime(
            df[c],
            errors="coerce"
        )


# ==========================================
# HISTORICAL SECTION STATISTICS
# ==========================================

H = (

    df
    .groupby(
        "section_number"
    )
    .agg(

        historical_avg_delay_change=(
            "delay_change_min",
            "mean"
        ),

        historical_delay_std=(
            "delay_change_min",
            "std"
        ),

        historical_avg_recovery=(
            "recovery_min",
            "mean"
        ),

        historical_recovery_rate=(

            "delay_change_min",

            lambda x: (
                x < 0
            ).mean()

        ),

        historical_avg_running_time=(

            "actual_running_time_min",

            "mean"

        )

    )
    .reset_index()

)


# ==========================================
# SAFE NUMBER CONVERSION
# ==========================================

def num(
    x,
    d=0.0
):

    try:

        v = float(
            x
        )

        if not np.isfinite(
            v
        ):

            return d

        return v

    except Exception:

        return d


# ==========================================
# GET TRAIN ROUTE
# ==========================================

def route(
    train
):

    r = (

        df[
            df.train_number
            .astype(str)
            ==
            str(train)
        ]

        .sort_values(
            "section_number"
        )

        .drop_duplicates(
            "section_number"
        )

        .copy()

    )


    if r.empty:

        return r


    return r.merge(

        H,

        on="section_number",

        how="left"

    )


# ==========================================
# RAILRADAR LIVE API
# ==========================================

def live_api(
    train,
    date=None
):

    if not KEY:

        raise RuntimeError(

            "RAILRADAR_API_KEY "
            "environment variable is missing."

        )


    params = (

        {
            "date": date
        }

        if date

        else {}

    )


    response = requests.get(

        f"{API.rstrip('/')}/trains/{train}/live",

        headers={

            "Authorization":
                f"Bearer {KEY}"

        },

        params=params,

        timeout=30

    )


    response.raise_for_status()


    x = response.json()


    if (

        isinstance(
            x,
            dict
        )

        and

        x.get(
            "success"
        ) is False

    ):

        raise RuntimeError(

            x.get(

                "message",

                "RailRadar returned "
                "success=false"

            )

        )


    return x.get(
        "data",
        x
    )


# ==========================================
# NORMALIZE LIVE API RESPONSE
# ==========================================

def normalize(
    x
):

    current_location = (

        x.get(
            "currentLocation"
        )

        or {}

    )


    next_halt = (

        x.get(
            "nextHalt"
        )

        or {}

    )


    return {

        "number":

            str(
                x.get(
                    "trainNumber"
                )

                or ""
            ),


        "name":

            x.get(
                "trainName"
            )

            or "",


        "status":

            x.get(
                "status",
                "unknown"
            ),


        "delay":

            num(

                x.get(

                    "delayMinutes",

                    x.get(
                        "delay",
                        0
                    )

                )

            ),


        "current_code":

            current_location.get(
                "stationCode"
            )

            or

            x.get(
                "currentStationCode"
            ),


        "current_name":

            current_location.get(
                "stationName"
            )

            or

            x.get(
                "currentStationName"
            ),


        "next_code":

            next_halt.get(
                "stationCode"
            )

            or

            next_halt.get(
                "code"
            ),


        "next_name":

            next_halt.get(
                "stationName"
            )

            or

            next_halt.get(
                "name"
            )

    }


# ==========================================
# NORMALIZE SECTION NAME
# DEBUG / CONSISTENCY
# ==========================================

def normalize_section(
    section
):

    if not section:

        return ""


    normalized = str(
        section
    ).lower()


    normalized = normalized.replace(

        "junction",

        ""

    )


    normalized = normalized.replace(

        "j.n.",

        ""

    )


    normalized = normalized.replace(

        "jn",

        ""

    )


    normalized = normalized.replace(

        "→",

        ""

    )


    normalized = normalized.replace(

        "->",

        ""

    )


    normalized = normalized.replace(

        "-",

        ""

    )


    normalized = normalized.replace(

        "to",

        ""

    )


    normalized = normalized.replace(

        " ",

        ""

    )


    return normalized


# ==========================================
# FORECAST FUNCTION
# ==========================================

def forecast(
    train,
    station,
    delay
):


    # =====================================
    # GET TRAIN ROUTE
    # =====================================

    r = route(
        train
    )


    if r.empty:

        raise RuntimeError(

            f"No historical route data "
            f"found for train {train}"

        )


    # =====================================
    # FIND START SECTION
    # =====================================

    q = str(
        station
        or ""
    ).strip().lower()


    start = 0


    for i, (
        _,
        row
    ) in enumerate(

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

    up = r.iloc[
        start:
    ]


    if up.empty:

        return []


    # =====================================
    # INITIAL VALUES
    # =====================================

    cur = max(

        0,

        num(
            delay
        )

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
    # GET ACTIVE EVENTS
    # =====================================

    active_events = (
        get_active_events()
    )


    print(
        "DEBUG: START FORECAST FUNCTION"
    )

    print(
        "DEBUG: UP ROWS =",
        len(up)
    )

    print(
        "DEBUG: ACTIVE EVENTS =",
        active_events
    )


    # =====================================
    # FORECAST EACH SECTION
    # =====================================

    for _, row in up.iterrows():


        print(

            "DEBUG: PROCESSING",

            row.get(
                "from_station"
            ),

            "->",

            row.get(
                "to_station"
            )

        )


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
        # RANDOM FOREST V2 PREDICTION
        # =================================

        change = num(

            model.predict(

                pd.DataFrame(

                    [vals],

                    columns=FEATURES

                ).fillna(
                    0
                )

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
        # GET EVENTS FOR CURRENT SECTION
        # =================================

        section_events = (

            get_events_for_section(

                current_section

            )

        )


        # =================================
        # DEBUG INFORMATION
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

        combined_result = (

            combine_delay_impacts(

                section_events

            )

        )


        simulation_impact = (

            combined_result.get(

                "total_delay_impact_min",

                0

            )

        )


        # =================================
        # FINAL PREDICTED DELAY
        #
        # Previous Delay
        # + Random Forest Prediction
        # + New Event Impact
        # =================================

        pred = max(

            0,

            cur

            +

            change

            +

            simulation_impact

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

        if not pd.isna(
            sa
        ):


            eta = (

                sa

                +

                pd.Timedelta(

                    minutes=pred

                )

            ).strftime(
                "%H:%M"
            )


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

            *

            100

        )


        # =================================
        # CONFIDENCE
        # =================================

        conf = float(

            np.clip(

                70

                +

                rec * 0.12

                +

                (

                    15

                    if abs(
                        change
                    ) <= 3

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

                    if not pd.isna(
                        sa
                    )

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

        prevchg = (
            change
        )


        prevarr = (
            pred
        )


        prevrun = num(

            row.get(

                "historical_avg_running_time",

                prevrun

            )

        )


        cum = (
            pred
        )


        cur = (
            pred
        )


    # =====================================
    # FORECAST COMPLETE
    # =====================================

    print(
        "DEBUG: FORECAST FINISHED"
    )


    print(
        "DEBUG: OUTPUT COUNT =",
        len(out)
    )


    return out


# ==========================================
# HOME PAGE
# ==========================================

@app.get("/")
def index():

    return send_from_directory(

        app.static_folder,

        "index.html"

    )


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/api/health")
def health():

    return jsonify(

        ok=True,

        model_loaded=True,

        historical_records=len(
            df
        )

    )


# ==========================================
# GET LIVE TRAIN DATA
# ==========================================

@app.get("/api/live/<train>")
def get_live(
    train
):

    try:


        return jsonify(

            success=True,

            live=normalize(

                live_api(

                    train,

                    request.args.get(
                        "date"
                    )

                )

            )

        )


    except Exception as e:


        return jsonify(

            success=False,

            error=str(
                e
            )

        ), 502


# ==========================================
# FORECAST API
# ==========================================

@app.get("/api/forecast/<train>")
def get_forecast(
    train
):

    print(
        "FORECAST FUNCTION: NEW MANUAL VERSION"
    )


    try:


        station = request.args.get(
            "station"
        )


        manual_delay = request.args.get(
            "delay"
        )


        date = request.args.get(
            "date"
        )


        # =====================================
        # MANUAL TEST MODE
        # =====================================

        if (

            station

            and

            manual_delay is not None

        ):


            delay = float(
                manual_delay
            )


            predictions = forecast(

                train,

                station,

                delay

            )


            return jsonify(

                success=True,


                train={

                    "train_number":

                        train,


                    "current_station":

                        station,


                    "delay":

                        round(

                            delay,

                            1

                        )

                },


            predictions=

                    predictions,


                generated_at=

                    datetime.now().isoformat(

                        timespec="seconds"

                    ),


                source=(

                    "Manual Test + "
                    "Historical Patterns + "
                    "Random Forest V2 + "
                    "Active Event Simulation"

                )

            )


        # =====================================
        # NORMAL MODE - RAILRADAR
        # =====================================

        live_data = normalize(

            live_api(

                train,

                date

            )

        )


        status = str(

            live_data[
                "status"
            ]

        ).lower()


        delay = live_data[
            "delay"
        ]


        # =====================================
        # NOT STARTED TRAIN
        # USE HISTORICAL INITIAL DELAY
        # =====================================

        if status in {

            "not-started",

            "not_started",

            "scheduled"

        }:


            r = route(
                train
            )


            if not r.empty:


                first = r.iloc[
                    0
                ]


                vals = (

                    df[

                        df.section_number

                        ==

                        first.section_number

                    ][

                        "departure_delay_min"

                    ].mean()

                )


                delay = max(

                    0,

                    num(
                        vals
                    )

                )


        station = (

            live_data[
                "current_code"
            ]

            or

            live_data[
                "current_name"
            ]

        )


        predictions = forecast(

            train,

            station,

            delay

        )


        return jsonify(

            success=True,


            train={

                **live_data,


                "delay":

                    round(

                        delay,

                        1

                    )

            },


            predictions=

                predictions,


            generated_at=

                datetime.now().isoformat(

                    timespec="seconds"

                ),


            source=(

                "RailRadar + "
                "Historical Patterns + "
                "Random Forest V2 + "
                "Active Events"

            )

        )


    except Exception as e:


        traceback.print_exc()


        return jsonify(

            success=False,

            error=str(
                e
            )

        ), 500


# ==========================================
# TRACK MAINTENANCE STORAGE
# ==========================================

MAINTENANCE_FILE = os.path.join(

    os.path.dirname(
        __file__
    ),

    "maintenance.json"

)


# ==========================================
# LOAD MAINTENANCE
# ==========================================

def load_maintenance():

    if not os.path.exists(

        MAINTENANCE_FILE

    ):

        return []


    try:


        with open(

            MAINTENANCE_FILE,

            "r",

            encoding="utf-8"

        ) as f:


            return json.load(
                f
            )


    except Exception:


        return []


# ==========================================
# SAVE MAINTENANCE
# ==========================================

def save_maintenance(
    data
):


    with open(

        MAINTENANCE_FILE,

        "w",

        encoding="utf-8"

    ) as f:


        json.dump(

            data,

            f,

            indent=2

        )


# ==========================================
# GET MAINTENANCE
# ==========================================

@app.get("/api/maintenance")
def get_maintenance():

    return jsonify(

        success=True,

        maintenance=load_maintenance()

    )


# ==========================================
# ADD MAINTENANCE
# ==========================================

@app.post("/api/maintenance")
def add_maintenance():

    try:


        body = request.get_json(

            force=True

        ) or {}


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

            x

            for x in required

            if str(

                body.get(

                    x,

                    ""

                )

            ).strip() == ""

        ]


        if missing:


            return jsonify(

                success=False,

                error=(

                    "Missing fields: "

                    +

                    ", ".join(
                        missing
                    )

                )

            ), 400


        records = load_maintenance()


        next_id = (

            max(

                [

                    int(

                        x.get(

                            "id",

                            0

                        )

                    )

                    for x in records

                ]

                or [0]

            )

            +

            1

        )


        record = {


            "id":

                next_id,


            "from_station":

                str(

                    body[
                        "from_station"
                    ]

                ).strip(),


            "to_station":

                str(

                    body[
                        "to_station"
                    ]

                ).strip(),


            "from_km":

                float(

                    body[
                        "from_km"
                    ]

                ),


            "to_km":

                float(

                    body[
                        "to_km"
                    ]

                ),


            "repair_type":

                str(

                    body[
                        "repair_type"
                    ]

                ).strip(),


            "normal_speed":

                float(

                    body[
                        "normal_speed"
                    ]

                ),


            "restricted_speed":

                float(

                    body[
                        "restricted_speed"
                    ]

                ),


            "start_time":

                str(

                    body[
                        "start_time"
                    ]

                ),


            "end_time":

                str(

                    body[
                        "end_time"
                    ]

                ),


            "notes":

                str(

                    body.get(

                        "notes",

                        ""

                    )

                ).strip()

        }


        records.append(
            record
        )


        save_maintenance(
            records
        )


        return jsonify(

            success=True,

            maintenance=record

        ), 201


    except Exception as e:


        traceback.print_exc()


        return jsonify(

            success=False,

            error=str(
                e
            )

        ), 500


# ==========================================
# DELETE MAINTENANCE
# ==========================================

@app.delete(
    "/api/maintenance/<int:maintenance_id>"
)

def delete_maintenance(
    maintenance_id
):


    records = load_maintenance()


    updated = [

        x

        for x in records

        if int(

            x.get(

                "id",

                0

            )

        )

        !=

        maintenance_id

    ]


    if len(
        updated
    ) == len(
        records
    ):


        return jsonify(

            success=False,

            error=(

                "Maintenance restriction "
                "not found"

            )

        ), 404


    save_maintenance(
        updated
    )


    return jsonify(

        success=True,

        message=(

            "Maintenance restriction "
            "removed"

        )

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

            error=str(
                e
            )

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

        count=len(
            events
        )

    )


# ==========================================
# REMOVE SINGLE EVENT
# ==========================================

@app.delete(
    "/api/events/<event_id>"
)

def delete_event(
    event_id
):


    removed = remove_event(

        event_id

    )


    if not removed:


        return jsonify(

            success=False,

            error="Event not found"

        ), 404


    return jsonify(

        success=True,

        message="Event removed"

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
# RAILWAY AUTHORIZED API
# TELEMETRY EVENT
# ==========================================

@app.post(
    "/api/railway/telemetry/event"
)

def add_telemetry_event():

    try:


        body = request.get_json(

            force=True

        ) or {}


        feature = body.get(
            "feature"
        )


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

            error=str(
                e
            )

        ), 400


# ==========================================
# RAILWAY AUTHORIZED API
# ASSET EVENT
# ==========================================

@app.post(
    "/api/railway/asset/event"
)

def add_asset_event():

    try:


        body = request.get_json(

            force=True

        ) or {}


        feature = body.get(
            "feature"
        )


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

            error=str(
                e
            )

        ), 400


# ==========================================
# RAILWAY AUTHORIZED API
# ALERT EVENT
# ==========================================

@app.post(
    "/api/railway/alert/event"
)

def add_alert_event():

    try:


        body = request.get_json(

            force=True

        ) or {}


        feature = body.get(
            "feature"
        )


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

            error=str(
                e
            )

        ), 400


# ==========================================
# DISPLAY REGISTERED ROUTES
# ==========================================

print(
    app.url_map
)


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":


    print(

        "RailForecast: "
        "http://127.0.0.1:5000"

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
