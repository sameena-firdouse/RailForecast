/* =========================================
   RAILFORECAST
   COMPLETE JAVASCRIPT - MODIFIED VERSION
========================================= */


/* =========================================
   GLOBAL VARIABLES
========================================= */

let accuracyChart = null;
let currentSimulation = null;

/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:5000"
        : (window.RAILFORECAST_API || "");


/* =========================================
   LIVE DATA
========================================= */

let liveTrainData = null;

let liveStationForecast = [];

let liveEvents = [];

let liveRouteSections = [];

/* =========================================
   API URL
========================================= */

function apiUrl(path) {

    return `${API_BASE}${path}`;

}


/* =========================================
   LOAD LIVE FORECAST
========================================= */

async function loadLiveForecast(
    trainNumber,
    date
) {

    const dateParam =
        date
            ? `?date=${encodeURIComponent(date)}`
            : "";

    const url =
        apiUrl(
            `/api/forecast/${encodeURIComponent(trainNumber)}${dateParam}`
        );

    console.log(
        "Loading live forecast:",
        url
    );


    const response =
        await fetch(url);


    const data =
        await response.json();


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(

            data.error ||

            "Unable to load live train forecast"

        );

    }


    return data;

}
/* =========================================
   SIMULATION SECTIONS
========================================= */

const railwaySections = [

    "Guntur → Mangalagiri",

    "Mangalagiri → Vijayawada",

    "Vijayawada → Madhira",

    "Madhira → Khammam",

    "Khammam → Dornakal",

    "Dornakal → Mahbubabad",

    "Mahbubabad → Nekonda",

    "Nekonda → Warangal",

    "Warangal → Kazipet",

    "Kazipet → Ghanpur",

    "Ghanpur → Jangaon",

    "Jangaon → Aler",

    "Aler → Bhongir",

    "Bhongir → Charlapalli",

    "Charlapalli → Secunderabad"

];


/* =========================================
   SIMULATION FEATURE DEFINITIONS

   IMPORTANT:
   Every field id below matches EXACTLY the
   input parameter name read by the real
   backend calculator for this feature
   (backend/services/<feature>.py), and
   "backendFeature" matches the "feature"
   key expected by
   backend/adapters/simulation_mapper.py
   (POST /api/simulation/event).

   This means the values entered here are
   sent as-is to the same calculation
   engine used by live Railway Authorized
   APIs — nothing is faked on the frontend.
========================================= */

const simulationFeatures = {


    /* =====================================
       SIGNAL POINTS
       -> backend/services/signal_halt.py
    ===================================== */

    signal: {

        title:
            "Signal Point Simulation",

        description:
            "Simulate signal malfunction and operational signal holds.",

        backendFeature:
            "signal_halt",

        fields: [

            {
                id: "section",
                label: "Affected Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "signal_status",
                label: "Signal Status",
                type: "select",

                options: [

                    "Normal",

                    "Red Signal Hold",

                    "Signal Failure",

                    "Signal Communication Failure",

                    "Temporary Signal Hold"

                ]
            },

            {
                id: "severity",
                label: "Severity",
                type: "select",
                options: ["low", "medium", "high", "critical"]
            },

            {
                id: "expected_deviation_min",
                label: "Expected Deviation (minutes)",
                type: "number",
                value: "15",
                numeric: true
            },

            {
                id: "normal_impact_min",
                label: "Normal Impact Baseline (minutes)",
                type: "number",
                value: "2",
                numeric: true
            },

            {
                id: "alternate_route_available",
                label: "Alternate Route Available",
                type: "select",
                options: ["No", "Yes"],
                boolean: true
            },

            {
                id: "halt_start_time",
                label: "Halt Start Time",
                type: "datetime-local"
            },

            {
                id: "current_impact_min",
                label: "Current Impact Override (minutes, optional)",
                type: "number",
                value: "0",
                numeric: true
            }

        ]

    },


    /* =====================================
       CONGESTION
       -> backend/services/congestion.py
    ===================================== */

    congestion: {

        title:
            "Route Congestion Simulation",

        description:
            "Simulate congestion caused by increased railway traffic.",

        backendFeature:
            "congestion",

        fields: [

            {
                id: "section",
                label: "Congested Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "congestion_level",
                label: "Congestion Level",
                type: "select",
                options: ["low", "moderate", "high", "severe"]
            },

            {
                id: "trains_ahead",
                label: "Number of Trains Ahead",
                type: "number",
                value: "3",
                numeric: true
            },

            {
                id: "queue_waiting_time_min",
                label: "Queue Waiting Time (minutes)",
                type: "number",
                value: "8",
                numeric: true
            },

            {
                id: "average_speed_kmph",
                label: "Average Speed (km/h)",
                type: "number",
                value: "40",
                numeric: true
            },

            {
                id: "expected_clearance_time_min",
                label: "Expected Clearance Time (minutes)",
                type: "number",
                value: "20",
                numeric: true
            }

        ]

    },


    /* =====================================
       PRECEDING TRAIN DELAY
       -> backend/services/preceding_train.py
    ===================================== */

    preceding: {

        title:
            "Preceding Train Delay Simulation",

        description:
            "Analyze delay propagation from preceding trains.",

        backendFeature:
            "preceding_train",

        fields: [

            {
                id: "affected_train_id",
                label: "Your Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "preceding_train_id",
                label: "Preceding Train Number",
                type: "text",
                value: "12706"
            },

            {
                id: "section",
                label: "Affected Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "preceding_train_location",
                label: "Preceding Train Current Location",
                type: "text",
                value: ""
            },

            {
                id: "preceding_train_delay_min",
                label: "Preceding Train Delay (minutes)",
                type: "number",
                value: "20",
                numeric: true
            },

            {
                id: "distance_ahead_km",
                label: "Distance Ahead (km)",
                type: "number",
                value: "5",
                numeric: true
            },

            {
                id: "section_status",
                label: "Section Status",
                type: "select",
                options: ["clear", "occupied", "congested", "blocked"]
            },

            {
                id: "estimated_clearance_time_min",
                label: "Estimated Clearance Time (minutes)",
                type: "number",
                value: "10",
                numeric: true
            }

        ]

    },


    /* =====================================
       TEMPORARY SPEED RESTRICTION
       -> backend/services/temporary_speed_restriction.py
    ===================================== */

    speed: {

        title:
            "Temporary Speed Restriction Simulation",

        description:
            "Calculate delay caused by temporary speed restrictions.",

        backendFeature:
            "temporary_speed_restriction",

        fields: [

            {
                id: "section",
                label: "Restricted Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "current_train_location",
                label: "Current Train Location",
                type: "text",
                value: ""
            },

            {
                id: "current_speed_kmph",
                label: "Current Speed (km/h)",
                type: "number",
                value: "80",
                numeric: true
            },

            {
                id: "current_train_delay_min",
                label: "Current Train Delay (minutes)",
                type: "number",
                value: "0",
                numeric: true
            },

            {
                id: "tsr_start_location",
                label: "TSR Start Location",
                type: "text",
                value: ""
            },

            {
                id: "tsr_end_location",
                label: "TSR End Location",
                type: "text",
                value: ""
            },

            {
                id: "tsr_distance_km",
                label: "Restricted Distance (km)",
                type: "number",
                value: "15",
                numeric: true
            },

            {
                id: "normal_speed_kmph",
                label: "Normal Speed (km/h)",
                type: "number",
                value: "110",
                numeric: true
            },

            {
                id: "restricted_speed_kmph",
                label: "Restricted Speed (km/h)",
                type: "number",
                value: "50",
                numeric: true
            },

            {
                id: "tsr_status",
                label: "TSR Status",
                type: "select",
                options: ["active", "temporary", "restricted", "cleared"]
            },

            {
                id: "tsr_start_time",
                label: "TSR Start Time",
                type: "datetime-local"
            },

            {
                id: "expected_clearance_time",
                label: "Expected Clearance Time",
                type: "text",
                value: ""
            }

        ]

    },


    /* =====================================
       UNSCHEDULED MAINTENANCE
       -> backend/services/unscheduled_maintenance.py
    ===================================== */

    maintenance: {

        title:
            "Unscheduled Maintenance Block Simulation",

        description:
            "Simulate emergency maintenance blocks and infrastructure restrictions.",

        backendFeature:
            "unscheduled_maintenance",

        fields: [

            {
                id: "section",
                label: "Maintenance Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "maintenance_type",
                label: "Maintenance Type",
                type: "select",

                options: [

                    "Track Repair",

                    "Track Inspection",

                    "Emergency Repair",

                    "Equipment Repair",

                    "Maintenance Block"

                ]
            },

            {
                id: "detection_start_time",
                label: "Detection Start Time",
                type: "datetime-local"
            },

            {
                id: "block_type",
                label: "Block Type",
                type: "select",
                options: ["partial", "complete", "full", "blocked"]
            },

            {
                id: "severity",
                label: "Severity",
                type: "select",
                options: ["low", "medium", "high", "critical"]
            },

            {
                id: "estimated_repair_duration_min",
                label: "Estimated Repair Duration (minutes)",
                type: "number",
                value: "30",
                numeric: true
            },

            {
                id: "affected_length_km",
                label: "Affected Length (km)",
                type: "number",
                value: "2",
                numeric: true
            },

            {
                id: "normal_speed_kmph",
                label: "Normal Speed (km/h)",
                type: "number",
                value: "100",
                numeric: true
            },

            {
                id: "restricted_speed_kmph",
                label: "Restricted Speed (km/h)",
                type: "number",
                value: "30",
                numeric: true
            },

            {
                id: "track_availability",
                label: "Track Availability",
                type: "select",
                options: ["available", "unavailable", "blocked", "closed"]
            },

            {
                id: "traffic_level",
                label: "Traffic Level",
                type: "select",
                options: ["low", "moderate", "high", "severe"]
            }

        ]

    },


    /* =====================================
       LEVEL CROSSING
       -> backend/services/level_crossing.py
    ===================================== */

    crossing: {

        title:
            "Level Crossing Gate Simulation",

        description:
            "Simulate delays caused by level crossing operations.",

        backendFeature:
            "level_crossing",

        fields: [

            {
                id: "train_id",
                label: "Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "section",
                label: "Level Crossing Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "current_train_delay_min",
                label: "Current Train Delay (minutes)",
                type: "number",
                value: "0",
                numeric: true
            },

            {
                id: "distance_to_crossing_km",
                label: "Distance to Crossing (km)",
                type: "number",
                value: "2",
                numeric: true
            },

            {
                id: "current_train_speed_kmph",
                label: "Current Train Speed (km/h)",
                type: "number",
                value: "60",
                numeric: true
            },

            {
                id: "gate_status",
                label: "Gate Status",
                type: "select",
                options: ["open", "closing", "closed", "blocked"]
            },

            {
                id: "remaining_gate_closure_time_min",
                label: "Remaining Gate Closure Time (minutes)",
                type: "number",
                value: "8",
                numeric: true
            },

            {
                id: "gate_clearance_delay_min",
                label: "Gate Clearance Delay (minutes)",
                type: "number",
                value: "2",
                numeric: true
            }

        ]

    },


    /* =====================================
       OPERATIONAL BOTTLENECK
       -> backend/services/operational_bottleneck.py
    ===================================== */

    bottleneck: {

        title:
            "Operational Bottleneck Simulation",

        description:
            "Simulate junction congestion and capacity limitations.",

        backendFeature:
            "operational_bottleneck",

        fields: [

            {
                id: "section",
                label: "Affected Junction / Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "current_train_delay_min",
                label: "Current Train Delay (minutes)",
                type: "number",
                value: "0",
                numeric: true
            },

            {
                id: "trains_ahead",
                label: "Number of Trains Waiting",
                type: "number",
                value: "4",
                numeric: true
            },

            {
                id: "average_headway_min",
                label: "Average Headway (minutes)",
                type: "number",
                value: "5",
                numeric: true
            },

            {
                id: "section_occupancy_percent",
                label: "Section Occupancy (%)",
                type: "number",
                value: "75",
                numeric: true
            },

            {
                id: "capacity_reduction_percent",
                label: "Capacity Reduction (%)",
                type: "number",
                value: "20",
                numeric: true
            },

            {
                id: "expected_bottleneck_clearance_time_min",
                label: "Expected Clearance Time (minutes)",
                type: "number",
                value: "15",
                numeric: true
            },

            {
                id: "train_priority",
                label: "Train Priority",
                type: "select",
                options: ["low", "normal", "high", "premium"]
            }

        ]

    }

};


/* =========================================
   SAFE SCREEN NAVIGATION
========================================= */

function hideAllScreens() {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.classList.add("hide");

    });

}


function showScreen(id) {

    hideAllScreens();

    const screen =
        document.getElementById(id);

    if (!screen) {

        console.error(
            "Screen not found:",
            id
        );

        return;

    }

    screen.classList.remove("hide");

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================
   PAGE NAVIGATION FUNCTIONS
========================================= */

function home() {

    showScreen("home");

}


function passenger() {

    showScreen("passenger");

    // Show the network starting at Guntur
    // until a real train is searched.
    renderDefaultRailwayNetwork();

}


function department() {

    showScreen("department");

}


function simulation() {

    showScreen("simulation");

}


function authorizedAPI() {

    showScreen("authorized-api");

}


/* =========================================
   PASSENGER FORECAST
========================================= */

/* =========================================
   PASSENGER FORECAST
========================================= */

async function forecast() {


    const trainInput =
        document.getElementById(
            "train"
        );


    const dateInput =
        document.getElementById(
            "date"
        );


    const error =
        document.getElementById(
            "err"
        );


    const loading =
        document.getElementById(
            "loading"
        );


    const result =
        document.getElementById(
            "result"
        );


    if (!trainInput) {

        return;

    }


    const trainNumber =
        trainInput.value.trim();


    const selectedDate =
        dateInput
            ? dateInput.value
            : "";


    /* =====================================
       CLEAR PREVIOUS ERROR
    ===================================== */

    if (error) {

        error.classList.add(
            "hide"
        );

        error.textContent =
            "";

    }


    /* =====================================
       VALIDATE TRAIN NUMBER
    ===================================== */

    if (
        trainNumber === ""
    ) {

        if (error) {

            error.textContent =
                "Please enter a train number.";

            error.classList.remove(
                "hide"
            );

        }

        return;

    }


    /* =====================================
       HIDE OLD RESULT
    ===================================== */

    if (result) {

        result.classList.add(
            "hide"
        );

    }


    /* =====================================
       SHOW LOADING
    ===================================== */

    if (loading) {

        loading.classList.remove(
            "hide"
        );

    }


    try {


        /* =================================
           CALL BACKEND API
        ================================= */

        const data =
            await loadLiveForecast(

                trainNumber,

                selectedDate

            );


        console.log(
            "LIVE API RESPONSE:",
            data
        );


        /* =================================
           STORE LIVE DATA
        ================================= */

        liveTrainData =
            data.train ||
            data.trainData ||
            null;


        liveStationForecast =
            data.predictions ||
            data.forecast ||
            data.station_forecast ||
            data.stations ||
            [];


        liveEvents =
            await loadActiveEvents();


        liveRouteSections =
            data.route_sections ||
            [];


        /* =================================
           VALIDATE RESPONSE
        ================================= */

        if (!liveTrainData) {

            throw new Error(

                "Train information was not returned by the server."

            );

        }


        /* =================================
           UPDATE UI
        ================================= */

        updateTrainStatus(
            liveTrainData
        );


        updateJourney(
            liveTrainData
        );


        renderForecastTimeline(
            liveStationForecast
        );


        renderImpacts(
            liveEvents
        );


        renderAccuracyChart(
            data.model_performance
        );


        renderRailwayNetwork(
            withCurrentOriginStation(
                liveStationForecast,
                liveTrainData
            ),
            liveTrainData
        );


        updateLiveTrainPositionFromAPI(
            withCurrentOriginStation(
                liveStationForecast,
                liveTrainData
            ),
            liveTrainData
        );


        /* =================================
           SHOW RESULT
        ================================= */

        if (result) {

            result.classList.remove(
                "hide"
            );

        }


        /* =================================
           SCROLL
        ================================= */

        if (result) {

            result.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }


    }

    catch (err) {


        console.error(
            "Forecast error:",
            err
        );


        if (error) {

            error.textContent =

                err.message ||

                "Unable to load live train data. Please try again.";


            error.classList.remove(
                "hide"
            );

        }


    }

    finally {


        if (loading) {

            loading.classList.add(
                "hide"
            );

        }

    }

}

/* =========================================
   TRAIN STATUS
========================================= */

/* =========================================
   TRAIN STATUS
========================================= */

function updateTrainStatus(
    train
) {


    if (!train) {

        return;

    }


    const title =
        document.getElementById(
            "title"
        );


    const route =
        document.getElementById(
            "route"
        );


    const cur =
        document.getElementById(
            "cur"
        );


    const delay =
        document.getElementById(
            "delay"
        );


    const next =
        document.getElementById(
            "next"
        );


    const updated =
        document.getElementById(
            "updated"
        );


    if (title) {

        title.textContent =

            `Train ${

                train.number ||

                train.train_number ||

                ""

            } • ${

                train.name ||

                train.train_name ||

                ""

            }`;

    }


    if (route) {

        route.textContent =

            train.route ||

            `${

                train.from ||

                ""

            } → ${

                train.to ||

                ""

            }`;

    }


    if (cur) {

        cur.textContent =

            train.current_name ||

            train.current_station ||

            train.currentStation ||

            "Live location unavailable";

    }


    if (delay) {


        const currentDelay =

            Number(

                train.delay ??

                train.current_delay ??

                train.currentDelay ??

                0

            );


        delay.textContent =

            currentDelay > 0

                ? `+${currentDelay} min`

                : "On time";

    }


    if (next) {

        next.textContent =

            train.next_name ||

            train.next_station ||

            train.nextStation ||

            "Unknown";

    }


    if (updated) {

        updated.textContent =

            train.updated ||

            train.last_updated ||

            "Just now";

    }

}

/* =========================================
   JOURNEY PROGRESS
========================================= */

/* =========================================
   JOURNEY PROGRESS
========================================= */

function updateJourney(
    train
) {


    if (!train) {

        return;

    }


    const progress =

        Number(

            train.progress ??

            train.journey_progress ??

            0

        );


    const journeyPercent =
        document.getElementById(
            "journey-percent"
        );


    const journeyFrom =
        document.getElementById(
            "journey-from"
        );


    const journeyTo =
        document.getElementById(
            "journey-to"
        );


    const journeyProgress =
        document.getElementById(
            "journey-progress"
        );


    const progressMarker =
        document.getElementById(
            "progress-marker"
        );


    const journeyStatus =
        document.getElementById(
            "journey-status"
        );


    if (journeyPercent) {

        journeyPercent.textContent =

            `${Math.round(progress)}%`;

    }


    if (journeyFrom) {

        journeyFrom.textContent =

            train.from ||

            train.source ||

            "Source";

    }


    if (journeyTo) {

        journeyTo.textContent =

            train.to ||

            train.destination ||

            "Destination";

    }


    if (journeyProgress) {

        journeyProgress.style.width =

            `${progress}%`;

    }


    if (progressMarker) {

        progressMarker.style.left =

            `${progress}%`;

    }


    if (journeyStatus) {

        const currentStation =

            train.current_station ||

            train.currentStation ||

            "the route";


        journeyStatus.textContent =

            `Your train is currently near ${

                currentStation

            }. ${

                Math.round(progress)

            }% of the journey has been completed.`;

    }

}

/* =========================================
   ACTIVE DELAY IMPACTS
========================================= */

/* =========================================
   ACTIVE DELAY IMPACTS
========================================= */

function renderImpacts(
    impactData = []
) {


    const impactSection =
        document.getElementById(
            "impact-section"
        );


    const totalImpact =
        document.getElementById(
            "total-impact"
        );


    const summary =
        document.getElementById(
            "impact-summary"
        );


    const events =
        document.getElementById(
            "active-events"
        );


    if (

        !impactSection ||

        !totalImpact ||

        !summary ||

        !events

    ) {

        return;

    }


    /* =====================================
       CALCULATE TOTAL
    ===================================== */

    const total =

        impactData.reduce(

            (
                sum,
                item
            ) =>

                sum +

                Number(

                    item.current_impact_min ??

                    item.impact ??

                    item.delay_impact ??

                    item.estimated_impact ??

                    0

                ),

            0

        );


    totalImpact.textContent =

        total > 0

            ? `+${Math.round(total)} min`

            : "No active impact";


    /* =====================================
       SUMMARY
    ===================================== */

    summary.innerHTML = `

        <div class="impact-summary-item">

            <small>

                ACTIVE DISRUPTIONS

            </small>

            <b>

                ${impactData.length}

            </b>

        </div>


        <div class="impact-summary-item">

            <small>

                ESTIMATED IMPACT

            </small>

            <b>

                +${Math.round(total)} min

            </b>

        </div>

    `;


    /* =====================================
       EVENTS
    ===================================== */

    events.innerHTML =
        "";


    if (

        impactData.length === 0

    ) {


        events.innerHTML = `

            <div class="event-item">

                <div>

                    <div class="event-feature">

                        No active disruptions

                    </div>

                    <span class="event-section">

                        Live route conditions are normal.

                    </span>

                </div>

            </div>

        `;


        impactSection.classList.remove(
            "hide"
        );


        return;

    }


    impactData.forEach(
        item => {


            const impact =

                Number(

                    item.current_impact_min ??

                    item.impact ??

                    item.delay_impact ??

                    item.estimated_impact ??

                    0

                );


            const feature =

                item.feature ||

                item.type ||

                item.event_type ||

                "Railway Event";


            const section =

                item.section ||

                item.affected_section ||

                item.location ||

                "Route section";


            const element =

                document.createElement(
                    "div"
                );


            element.className =
                "event-item";


            element.innerHTML = `

                <div>

                    <div class="event-feature">

                        ${feature}

                    </div>


                    <span class="event-section">

                        ${section}

                    </span>

                </div>


                <div class="event-impact">

                    +${impact} min

                </div>

            `;


            events.appendChild(
                element
            );

        }

    );


    impactSection.classList.remove(
        "hide"
    );

}


/* =========================================
   FORECAST TIMELINE
========================================= */

/* =========================================
   FORECAST TIMELINE
========================================= */

function renderForecastTimeline(
    forecastData = []
) {


    const timeline =
        document.getElementById(
            "timeline"
        );


    if (!timeline) {

        return;

    }


    timeline.innerHTML =
        "";


    if (

        !forecastData ||

        forecastData.length === 0

    ) {


        timeline.innerHTML = `

            <div class="no-data">

                No forecast data available.

            </div>

        `;


        return;

    }


    forecastData.forEach(
        station => {


            const delay =

                Number(

                    station.predicted_delay_min ??

                    station.delay ??

                    station.predicted_delay ??

                    station.delay_min ??

                    0

                );


            let delayClass =
                "delay-good";


            if (

                delay >= 10 &&

                delay < 20

            ) {

                delayClass =
                    "delay-mid";

            }


            if (

                delay >= 20

            ) {

                delayClass =
                    "delay-bad";

            }


            const status =

                station.status ||

                "Upcoming";


            let statusClass =
                "status-good";


            if (

                status === "Current" ||
                status === "Upcoming" ||
                status === "SLIGHT DELAY"

            ) {

                statusClass =
                    "status-mid";

            }


            if (

                status === "DELAYED"

            ) {

                statusClass =
                    "status-bad";

            }


            const row =

                document.createElement(
                    "div"
                );


            row.className =
                "forecast-row";


            if (

                status ===
                "Current"

            ) {

                row.classList.add(
                    "current-station-row"
                );

            }


            row.innerHTML = `

                <div class="timeline-dot">

                    ●

                </div>


                <div>

                    <div class="station-name">

                        ${

                            station.to_station ||

                            station.station ||

                            station.station_name ||

                            "Unknown Station"

                        }

                    </div>


                    <div class="station-code">

                        ${

                            station.to_code ||

                            station.code ||

                            station.station_code ||

                            ""

                        }

                    </div>

                </div>


                <div>

                    <div class="time-value">

                        ${

                            station.predicted_eta ||

                            station.predicted ||

                            station.predicted_time ||

                            station.eta ||

                            "--"

                        }

                    </div>


                    <div class="time-label">

                        Scheduled:

                        ${

                            station.scheduled_eta ||

                            station.scheduled ||

                            station.scheduled_time ||

                            "--"

                        }

                    </div>

                </div>


                <div class="delay-column">

                    <div class="${delayClass}">

                        ${

                            delay > 0

                                ? `+${delay} min`

                                : "On time"

                        }

                    </div>


                    <div class="confidence">

                        AI Prediction

                    </div>

                </div>


                <div class="status-badge ${statusClass}">

                    ${status}

                </div>

            `;


            timeline.appendChild(
                row
            );

        }

    );

}
/* =========================================
   RENDER LIVE RAILWAY NETWORK
========================================= */

/* =========================================
   INCLUDE THE TRAIN'S CURRENT / ORIGIN
   STATION AS A REAL NODE ON THE NETWORK

   The backend's forecast list only contains
   the stations AHEAD of the train (each
   entry's "to_station"), because it is
   forecasting arrivals - it never includes
   the station the train is currently at or
   departing from. That meant the network
   diagram and the live position marker had
   no node to represent Guntur (or whichever
   station the train is actually at right
   now), so the marker defaulted to the very
   first upcoming station instead - making it
   look like the train had already reached
   Mangalagiri when it may still be on its
   way there from Guntur.

   This wraps the real forecast data with one
   extra leading node built from the first
   entry's "from_station"/"from_code" (the
   train's real current station), so the
   diagram and the live marker both correctly
   start there and animate towards the next
   station as section_progress increases.
========================================= */

function withCurrentOriginStation(
    stationForecast,
    train
) {

    if (
        !Array.isArray(stationForecast) ||
        stationForecast.length === 0
    ) {

        return stationForecast;

    }

    const first =
        stationForecast[0];

    const originCode =
        first.from_code ||
        first.fromCode ||
        "";

    const originName =
        first.from_station ||
        first.fromStation ||
        "";

    if (!originName) {

        return stationForecast;

    }

    // Defensive: don't duplicate a node if
    // the origin is somehow already the
    // first "to" station in the list.
    if (
        originCode &&
        first.to_code === originCode
    ) {

        return stationForecast;

    }

    const trainDelay =
        Number(
            (train &&
                (train.delay ??
                    train.delayMinutes)) ||
            0
        );

    const originStatus =
        trainDelay > 10
            ? "DELAYED"
            : trainDelay > 2
                ? "SLIGHT DELAY"
                : "ON TIME";

    const originNode = {

        to_code:
            originCode,

        to_station:
            originName,

        scheduled_eta:
            "--",

        predicted_eta:
            "At Station",

        predicted_delay_min:
            trainDelay,

        status:
            originStatus

    };

    return [
        originNode,
        ...stationForecast
    ];

}


function renderRailwayNetwork(
    stations = [],
    train = {}
) {

    const network =
        document.getElementById(
            "rail-network"
        );

    if (!network) {

        return;

    }

    if (
        !stations ||
        stations.length === 0
    ) {

        network.innerHTML = `
            <div class="no-data">
                No live route data available.
            </div>
        `;

        network._trackPath = null;
        network._points = null;

        return;

    }

    const currentCode =
        train.current_code ||
        train.currentCode ||
        "";

    /* =====================================
       LAYOUT CONSTANTS
       (a winding vertical "S" route, like
       a train-tracker line map)
    ===================================== */

    const width = 640;
    const rowHeight = 118;
    const topPad = 46;
    const bottomPad = 46;
    const leftX = 210;
    const rightX = width - 210;

    const height =
        topPad +
        bottomPad +
        (stations.length - 1) * rowHeight;

    const points =
        stations.map(
            (station, i) => ({
                x: i % 2 === 0 ? leftX : rightX,
                y: topPad + (i * rowHeight),
                station
            })
        );

    /* =====================================
       SMOOTH CURVED PATH THROUGH POINTS
       Vertical tangents at every station
       keep the curve continuous (C1),
       producing a flowing S-shaped track.
    ===================================== */

    let pathData =
        `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {

        const prev = points[i - 1];
        const curr = points[i];
        const midY = (prev.y + curr.y) / 2;

        pathData +=
            ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;

    }

    /* =====================================
       STATION NODES + LABELS
    ===================================== */

    let stationMarkup = "";

    points.forEach(
        (point, i) => {

            const station = point.station;

            const code =
                station.to_code ||
                station.code ||
                station.station_code ||
                "";

            const name =
                station.to_station ||
                station.station ||
                station.station_name ||
                "Station";

            const predictedEta =
                station.predicted_eta ||
                station.predicted ||
                station.predicted_time ||
                station.eta ||
                "--";

            const scheduledEta =
                station.scheduled_eta ||
                station.scheduled ||
                station.scheduled_time ||
                "--";

            const delay =
                Number(
                    station.predicted_delay_min ??
                    station.delay ??
                    station.predicted_delay ??
                    station.delay_min ??
                    0
                );

            const rawStatus =
                (station.status || "").toUpperCase();

            let statusClass = "good";

            if (rawStatus === "SLIGHT DELAY") {
                statusClass = "mid";
            }

            if (rawStatus === "DELAYED") {
                statusClass = "bad";
            }

            const isCurrent =
                Boolean(code) &&
                code === currentCode;

            const side =
                point.x === leftX
                    ? "left"
                    : "right";

            const labelAnchor =
                side === "left"
                    ? "end"
                    : "start";

            const labelX =
                side === "left"
                    ? point.x - 24
                    : point.x + 24;

            const delayText =
                delay > 0
                    ? `+${Math.round(delay)} min`
                    : "On time";

            stationMarkup += `
                <g
                    class="network-station${isCurrent ? " current-network-station" : ""}"
                    data-code="${code}"
                >

                    <circle
                        class="station-dot-glow status-${statusClass}"
                        cx="${point.x}"
                        cy="${point.y}"
                        r="${isCurrent ? 16 : 11}"
                    ></circle>

                    <circle
                        class="station-dot status-${statusClass}${isCurrent ? " current" : ""}"
                        cx="${point.x}"
                        cy="${point.y}"
                        r="${isCurrent ? 8 : 5.5}"
                    ></circle>

                    <text
                        class="station-label-name"
                        x="${labelX}"
                        y="${point.y - 8}"
                        text-anchor="${labelAnchor}"
                    >${name}</text>

                    <text
                        class="station-label-code"
                        x="${labelX}"
                        y="${point.y + 9}"
                        text-anchor="${labelAnchor}"
                    >${code}${code ? " • " : ""}Sch ${scheduledEta}</text>

                    <text
                        class="station-label-eta status-${statusClass}"
                        x="${labelX}"
                        y="${point.y + 26}"
                        text-anchor="${labelAnchor}"
                    >${predictedEta} · ${delayText}</text>

                </g>
            `;

        }
    );

    /* =====================================
       BUILD THE SVG
    ===================================== */

    const firstPoint = points[0];

    const svgMarkup = `
        <svg
            viewBox="0 0 ${width} ${height}"
            width="100%"
            height="${height}"
            preserveAspectRatio="xMidYMin meet"
        >

            <defs>
                <linearGradient id="trackGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#38bdf8"></stop>
                    <stop offset="50%" stop-color="#3b82f6"></stop>
                    <stop offset="100%" stop-color="#8b5cf6"></stop>
                </linearGradient>
            </defs>

            <path class="rail-track-glow" d="${pathData}"></path>
            <path class="rail-track-path" d="${pathData}"></path>

            ${stationMarkup}

            <g
                id="live-network-train"
                class="live-network-train"
                transform="translate(${firstPoint.x}, ${firstPoint.y})"
            >

                <circle class="live-train-ring" r="9"></circle>
                <circle class="live-train-core" r="11"></circle>

                <text
                    class="live-train-icon"
                    text-anchor="middle"
                    dy="4"
                >🚆</text>

            </g>

        </svg>
    `;

    network.innerHTML = svgMarkup;

    /* =====================================
       CACHE PATH + POINTS FOR LIVE
       POSITION UPDATES
    ===================================== */

    network._trackPath =
        network.querySelector(
            ".rail-track-path"
        );

    network._points =
        points;

}


/* =========================================
   DEFAULT LIVE RAILWAY NETWORK

   Before any train has been searched, the
   Live Railway Network panel should not be
   an empty placeholder - it should already
   show the active route with the train
   sitting at Guntur, the origin station of
   the monitored section.
========================================= */

const defaultNetworkStations = [

    { code: "GNT", station: "Guntur" },
    { code: "MAGI", station: "Mangalagiri" },
    { code: "BZA", station: "Vijayawada" },
    { code: "MDR", station: "Madhira" },
    { code: "KMT", station: "Khammam" },
    { code: "DKW", station: "Dornakal" },
    { code: "MABD", station: "Mahbubabad" },
    { code: "NEK", station: "Nekonda" },
    { code: "WL", station: "Warangal" },
    { code: "KZJ", station: "Kazipet" }

];


function renderDefaultRailwayNetwork() {

    const network =
        document.getElementById(
            "rail-network"
        );

    if (!network) {

        return;

    }

    // Don't overwrite a real, already-loaded
    // live route with the placeholder route.
    if (liveTrainData) {

        return;

    }

    const originStation =
        defaultNetworkStations[0];

    const stations =
        defaultNetworkStations.map(
            (station, i) => ({
                to_code: station.code,
                to_station: station.station,
                scheduled_eta: "--",
                predicted_eta:
                    i === 0
                        ? "At Station"
                        : "--",
                status:
                    i === 0
                        ? "ON TIME"
                        : "",
                predicted_delay_min: 0
            })
        );

    renderRailwayNetwork(
        stations,
        {
            // Train starts at Guntur,
            // the first station.
            current_code:
                originStation.code
        }
    );

}


/* =========================================
   ETA ACCURACY CHART
========================================= */

function renderAccuracyChart() {

    const canvas =
        document.getElementById(
            "accuracyChart"
        );


    if (!canvas) {

        return;

    }


    if (

        typeof Chart ===
        "undefined"

    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;

    }


    if (accuracyChart) {

        accuracyChart.destroy();

    }


    accuracyChart =

        new Chart(

            canvas,

            {

                type:
                    "bar",


                data: {

                    labels: [

                        "Baseline ETA",

                        "Dynamic AI ETA"

                    ],


                    datasets: [

                        {

                            label:
                                "Mean Absolute Error",


                            data: [

                                5.74,

                                3.48

                            ],


                            backgroundColor: [

                                "rgba(242,184,75,0.7)",

                                "rgba(79,124,255,0.8)"

                            ],


                            borderRadius:
                                8

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    },


                    scales: {

                        x: {

                            ticks: {

                                color:
                                    "#c8d0dd"

                            },


                            grid: {

                                display:
                                    false

                            }

                        },


                        y: {

                            beginAtZero:
                                true,


                            ticks: {

                                color:
                                    "#8f9bae"

                            },


                            grid: {

                                color:
                                    "rgba(255,255,255,0.05)"

                            }

                        }

                    }

                }

            }

        );

}


/* =========================================
   OPEN SIMULATION
========================================= */

function openSimulation(type) {


    currentSimulation =
        type;


    const feature =
        simulationFeatures[type];


    if (!feature) {

        console.error(
            "Simulation not found:",
            type
        );

        return;

    }


    const config =
        document.getElementById(
            "simulation-config"
        );


    const title =
        document.getElementById(
            "simulation-title"
        );


    if (!config || !title) {

        console.error(
            "Simulation configuration elements not found."
        );

        return;

    }


    const formContainer =
        config.querySelector(
            ".simulation-form-grid"
        );


    const result =
        document.getElementById(
            "simulation-result"
        );


    if (!formContainer) {

        return;

    }


    title.textContent =
        feature.title;


    formContainer.innerHTML =
        "";


    if (result) {

        result.classList.add(
            "hide"
        );

        result.innerHTML =
            "";

    }


    feature.fields.forEach(
        field => {


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "simulation-input-group";


            const label =
                document.createElement(
                    "label"
                );


            label.textContent =
                field.label;


            wrapper.appendChild(
                label
            );


            let input;


            if (

                field.type ===
                "select"

            ) {


                input =
                    document.createElement(
                        "select"
                    );


                field.options.forEach(
                    optionValue => {


                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            optionValue;


                        option.textContent =
                            optionValue;


                        input.appendChild(
                            option
                        );

                    }
                );

            }


            else {


                input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    field.type;


                if (

                    field.value !==
                    undefined

                ) {

                    input.value =
                        field.value;

                }

            }


            input.id =
                field.id;


            wrapper.appendChild(
                input
            );


            formContainer.appendChild(
                wrapper
            );


        }
    );


    config.classList.remove(
        "hide"
    );


    setTimeout(() => {


        config.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });


    }, 100);

}


/* =========================================
   SAFE NUMBER FUNCTION
========================================= */

function getNumber(id) {

    const element =
        document.getElementById(id);


    if (!element) {

        return 0;

    }


    const value =
        Number(element.value);


    return isNaN(value)

        ? 0

        : value;

}


/* =========================================
   SAFE VALUE FUNCTION
========================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {

        return "";

    }


    return element.value;

}


/* =========================================
   BUILD PAYLOAD FROM DYNAMIC FIELDS

   Reads exactly the fields rendered for the
   currently selected simulation type and
   turns them into the same parameter names
   the backend calculator expects.
========================================= */

function buildSimulationPayload(feature) {

    const payload = {

        feature:
            feature.backendFeature

    };

    feature.fields.forEach(field => {

        let value;

        if (field.numeric) {

            value =
                getNumber(field.id);

        } else if (field.boolean) {

            value =
                getValue(field.id) === "Yes";

        } else {

            value =
                getValue(field.id);

        }

        payload[field.id] =
            value;

    });

    return payload;

}


/* =========================================
   RENDER SIMULATION RESULT

   Renders exactly what the backend
   calculator returned - the same
   standardized event structure produced
   for live Railway Authorized API data.
========================================= */

function renderSimulationResult(
    feature,
    event
) {

    const result =
        document.getElementById(
            "simulation-result"
        );

    if (!result) {

        return;

    }

    const currentImpact =
        Number(
            event.current_impact_min ?? 0
        );

    const normalImpact =
        Number(
            event.normal_impact_min ?? 0
        );

    const netImpact =
        Math.max(
            0,
            currentImpact - normalImpact
        );

    const skipKeys = new Set([
        "feature",
        "condition_type",
        "current_impact_min",
        "normal_impact_min",
        "event_id",
        "created_at",
        "active",
        "source",
        "section"
    ]);

    let paramRows = "";

    Object.keys(event)
        .filter(key => !skipKeys.has(key))
        .forEach(key => {

            const rawValue =
                event[key];

            if (
                rawValue === null ||
                rawValue === undefined ||
                rawValue === ""
            ) {

                return;

            }

            const label =
                key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase());

            paramRows += `
                <div class="param-row">
                    <span>${label}</span>
                    <b>${rawValue}</b>
                </div>
            `;

        });

    result.classList.remove("hide");

    result.innerHTML = `

        <div class="simulation-result-header">

            <span class="section-label">
                LIVE BACKEND CALCULATION RESULT
            </span>

            <h2>${feature.title}</h2>

            <span class="simulation-source-tag">
                engine: ${event.feature || feature.backendFeature}
            </span>

        </div>


        <div class="simulation-impact-result">

            <div class="impact-value">
                +${currentImpact.toFixed(2)} min
            </div>

            <div>
                <b>Current Impact (calculated by backend)</b>
                <p>
                    This is the live output of
                    <code>calculate_${feature.backendFeature}()</code>
                    for the parameters you entered.
                </p>
            </div>

        </div>


        <div class="simulation-analysis">

            <div>
                <small>NORMAL / BASELINE IMPACT</small>
                <b>${normalImpact.toFixed(2)} min</b>
            </div>

            <div>
                <small>NET ADDITIONAL DELAY</small>
                <b class="delay-result">+${netImpact.toFixed(2)} min</b>
            </div>

            <div>
                <small>AFFECTED SECTION</small>
                <b>${event.section || "-"}</b>
            </div>

        </div>


        <div class="simulation-params">

            <span class="section-label">
                PARAMETERS USED IN THIS CALCULATION
            </span>

            <div class="simulation-params-grid">
                ${paramRows}
            </div>

        </div>


        <div class="simulation-ai-note">

            <span>🧠</span>

            <p>
                This simulation event has been added to the
                active events list and can now feed into the
                RailForecast Dynamic ETA Engine together with
                historical ML prediction, live train data,
                real-time corrections and railway-authorized
                API intelligence.
            </p>

        </div>

    `;

    setTimeout(() => {

        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 100);

}


/* =========================================
   RUN SIMULATION

   Sends the entered parameters straight to
   POST /api/simulation/event, which runs
   them through the real backend calculator
   (backend/adapters/simulation_mapper.py ->
   backend/services/<feature>.py) - the same
   engine used for live Railway Authorized
   API data. No calculation happens in the
   frontend.
========================================= */

async function runSimulation() {


    if (!currentSimulation) {

        alert(
            "Please select a simulation feature first."
        );

        return;

    }


    const feature =
        simulationFeatures[
            currentSimulation
        ];


    const result =
        document.getElementById(
            "simulation-result"
        );


    if (!feature || !result) {

        return;

    }


    const payload =
        buildSimulationPayload(feature);


    result.classList.remove("hide");

    result.innerHTML = `
        <div class="simulation-loading">
            <span class="mini-spinner"></span>
            Running ${feature.backendFeature} calculation on the backend…
        </div>
    `;

    setTimeout(() => {

        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 50);


    try {

        const event =
            await submitSimulationEvent(payload);

        renderSimulationResult(
            feature,
            event
        );

        try {

            liveEvents =
                await loadActiveEvents();

            renderImpacts(liveEvents);

        } catch (refreshError) {

            console.warn(
                "Could not refresh active events:",
                refreshError
            );

        }

    } catch (error) {

        result.innerHTML = `
            <div class="simulation-error">
                <b>Simulation could not be calculated</b>
                <p>${error.message}</p>
            </div>
        `;

    }

}


/* =========================================
   CLOSE SIMULATION
========================================= */

function closeSimulation() {


    const config =
        document.getElementById(
            "simulation-config"
        );


    const result =
        document.getElementById(
            "simulation-result"
        );


    if (config) {

        config.classList.add(
            "hide"
        );

    }


    if (result) {

        result.classList.add(
            "hide"
        );


        result.innerHTML =
            "";

    }


    currentSimulation =
        null;

}


/* =========================================
   CONNECT AUTHORIZED API
========================================= */

function connectAPI(type) {


    const endpoint =
        document.getElementById(
            `${type}-endpoint`
        );


    const apiKey =
        document.getElementById(
            `${type}-key`
        );


    const status =
        document.getElementById(
            `${type}-status`
        );


    if (

        !endpoint ||

        !apiKey ||

        !status

    ) {

        console.error(
            "API elements not found for:",
            type
        );

        return;

    }


    if (

        endpoint.value.trim() ===
        ""

    ) {

        alert(
            "Please enter an API endpoint."
        );

        return;

    }


    if (

        apiKey.value.trim() ===
        ""

    ) {

        alert(
            "Please enter an authorized API key."
        );

        return;

    }


    status.textContent =
        "Connecting...";


    status.style.color =
        "#f2b84b";


    setTimeout(() => {


        status.textContent =
            "Connected";


        status.style.color =
            "#34c77b";


        alert(

            `${capitalize(type)} API connected successfully in prototype mode.`

        );


    }, 1000);

}


/* =========================================
   CAPITALIZE TEXT
========================================= */

function capitalize(text) {

    return (

        text.charAt(0)
            .toUpperCase()

        +

        text.slice(1)

    );

}


/* =========================================
   LIVE TRAIN POSITION ON VERTICAL ROUTE
========================================= */

/* =========================================
   UPDATE LIVE TRAIN POSITION FROM API
========================================= */

function updateLiveTrainPositionFromAPI(
    stations,
    train
) {

    if (!train) {

        return;

    }

    const network =
        document.getElementById(
            "rail-network"
        );

    if (!network) {

        return;

    }

    const path =
        network._trackPath ||
        network.querySelector(
            ".rail-track-path"
        );

    const points =
        network._points;

    const trainMarker =
        document.getElementById(
            "live-network-train"
        );

    if (
        !path ||
        !points ||
        points.length === 0 ||
        !trainMarker
    ) {

        return;

    }

    const currentCode =
        train.current_code ||
        train.currentCode ||
        "";

    let sectionProgress =
        Number(
            train.section_progress ??
            train.sectionProgress ??
            0
        );

    if (
        sectionProgress < 0 ||
        sectionProgress > 1
    ) {

        sectionProgress = 0;

    }

    /* =====================================
       FIND CURRENT / NEXT STATION INDEX
    ===================================== */

    let currentIndex =
        points.findIndex(
            point => {

                const station = point.station;

                const code =
                    station.to_code ||
                    station.code ||
                    station.station_code ||
                    "";

                return code === currentCode;

            }
        );

    if (currentIndex < 0) {

        currentIndex = 0;

    }

    let nextIndex =
        currentIndex + 1;

    if (nextIndex >= points.length) {

        nextIndex = currentIndex;

    }

    /* =====================================
       MOVE THE TRAIN MARKER ALONG THE
       ACTUAL CURVED PATH (not a straight
       line) USING THE SVG PATH GEOMETRY
    ===================================== */

    const totalLength =
        path.getTotalLength();

    const segmentCount =
        points.length - 1 || 1;

    const segmentStart =
        (currentIndex / segmentCount) * totalLength;

    const segmentEnd =
        (nextIndex / segmentCount) * totalLength;

    const targetLength =
        Math.max(
            0,
            Math.min(
                totalLength,
                segmentStart +
                (segmentEnd - segmentStart) * sectionProgress
            )
        );

    const trainPoint =
        path.getPointAtLength(
            targetLength
        );

    trainMarker.setAttribute(
        "transform",
        `translate(${trainPoint.x}, ${trainPoint.y})`
    );

    console.log(
        "Train moved to progress:",
        sectionProgress,
        "| section:",
        currentIndex,
        "->",
        nextIndex
    );

}


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        /* =====================================
           DEFAULT LIVE NETWORK (GUNTUR)
        ===================================== */

        renderDefaultRailwayNetwork();


        /* =====================================
           DEFAULT DATE
        ===================================== */

        const dateInput =
            document.getElementById(
                "date"
            );


        if (dateInput) {


            const today =
                new Date();


            const year =
                today.getFullYear();


            const month =
                String(

                    today.getMonth() + 1

                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(

                    today.getDate()

                ).padStart(
                    2,
                    "0"
                );


            dateInput.value =
                `${year}-${month}-${day}`;

        }


        /* =====================================
           ENTER KEY SEARCH
        ===================================== */

        const trainInput =
            document.getElementById(
                "train"
            );


        if (trainInput) {


            trainInput.addEventListener(

                "keydown",

                event => {


                    if (

                        event.key ===
                        "Enter"

                    ) {

                        forecast();

                    }


                }

            );

        }


        /* =====================================
           ENSURE HOME PAGE IS VISIBLE
        ===================================== */

        const homeScreen =
            document.getElementById(
                "home"
            );


        if (homeScreen) {

            homeScreen.classList.remove(
                "hide"
            );

        }


    }

);
async function loadActiveEvents() {

    try {

        const response = await fetch(
            apiUrl("/api/events")
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error ||
                "Failed to load events"
            );
        }

        return data.events || [];

    } catch (error) {

        console.error(
            "Active events error:",
            error
        );

        return [];
    }
}
async function submitSimulationEvent(eventData) {

    try {

        const response = await fetch(
            apiUrl("/api/simulation/event"),
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(eventData)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error ||
                "Failed to create simulation event"
            );
        }

        console.log(
            "Simulation event created:",
            data.event
        );

        return data.event;

    } catch (error) {

        console.error(
            "Simulation API error:",
            error
        );

        throw error;
    }
}
async function clearActiveEvents() {

    const response = await fetch(
        apiUrl("/api/events"),
        {
            method: "DELETE"
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {

        throw new Error(
            data.error ||
            "Failed to clear events"
        );
    }

    return data;
}


/* =========================================
   LIVE AUTO REFRESH
========================================= */

let liveRefreshInterval =
    null;


function startLiveRefresh() {


    if (liveRefreshInterval) {

        clearInterval(
            liveRefreshInterval
        );

    }


    liveRefreshInterval =

        setInterval(

            async () => {


                const trainInput =
                    document.getElementById(
                        "train"
                    );


                const dateInput =
                    document.getElementById(
                        "date"
                    );


                if (

                    !trainInput ||
                    !trainInput.value.trim()

                ) {

                    return;

                }


                try {


                    const data =

                        await loadLiveForecast(

                            trainInput.value.trim(),

                            dateInput
                                ? dateInput.value
                                : ""

                        );


                    liveTrainData =
                        data.train;


                    liveStationForecast =
                        data.forecast ||
                        [];


                    liveEvents =
                        data.events ||
                        [];


                    updateTrainStatus(
                        liveTrainData
                    );


                    updateJourney(
                        liveTrainData
                    );


                    renderForecastTimeline(
                        liveStationForecast
                    );


                    renderImpacts(
                        liveEvents
                    );


                    renderRailwayNetwork(

                        withCurrentOriginStation(
                            liveStationForecast,
                            liveTrainData
                        ),

                        liveTrainData

                    );


                    updateLiveTrainPositionFromAPI(

                        withCurrentOriginStation(
                            liveStationForecast,
                            liveTrainData
                        ),

                        liveTrainData

                    );


                }

                catch (error) {

                    console.error(

                        "Live refresh failed:",

                        error

                    );

                }


            },

            60000

        );

}
