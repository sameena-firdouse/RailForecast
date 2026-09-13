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
        : (window.RAILFORECAST_API || "https://railforecast.onrender.com");


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

    const url =
        apiUrl(
            `/api/forecast/${encodeURIComponent(trainNumber)}?date=${encodeURIComponent(date)}`
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
========================================= */

const simulationFeatures = {


    /* =====================================
       SIGNAL POINTS
    ===================================== */

    signal: {

        title:
            "Signal Point Simulation",

        description:
            "Simulate signal malfunction and operational signal holds.",

        fields: [

            {
                id: "sim-train",
                label: "Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "sim-section",
                label: "Affected Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "signal-status",
                label: "Signal Condition",
                type: "select",

                options: [

                    "Red Signal Hold",

                    "Signal Failure",

                    "Signal Communication Failure",

                    "Temporary Signal Hold"

                ]
            },

            {
                id: "signal-delay",
                label: "Expected Signal Delay (minutes)",
                type: "number",
                value: "15"
            }

        ]

    },


    /* =====================================
       CONGESTION
    ===================================== */

    congestion: {

        title:
            "Route Congestion Simulation",

        description:
            "Simulate congestion caused by increased railway traffic.",

        fields: [

            {
                id: "sim-train",
                label: "Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "sim-section",
                label: "Congested Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "traffic-level",
                label: "Traffic Density",
                type: "select",

                options: [

                    "Moderate",

                    "High",

                    "Severe"

                ]
            },

            {
                id: "trains-count",
                label: "Number of Trains Ahead",
                type: "number",
                value: "3"
            }

        ]

    },


    /* =====================================
       PRECEDING TRAIN DELAY
    ===================================== */

    preceding: {

        title:
            "Preceding Train Delay Simulation",

        description:
            "Analyze delay propagation from preceding trains.",

        fields: [

            {
                id: "sim-train",
                label: "Your Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "preceding-train",
                label: "Preceding Train Number",
                type: "text",
                value: "12706"
            },

            {
                id: "sim-section",
                label: "Affected Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "preceding-delay",
                label: "Preceding Train Delay (minutes)",
                type: "number",
                value: "20"
            }

        ]

    },


    /* =====================================
       TEMPORARY SPEED RESTRICTION
    ===================================== */

    speed: {

        title:
            "Temporary Speed Restriction Simulation",

        description:
            "Calculate delay caused by temporary speed restrictions.",

        fields: [

            {
                id: "sim-train",
                label: "Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "sim-section",
                label: "Restricted Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "normal-speed",
                label: "Normal Speed (km/h)",
                type: "number",
                value: "110"
            },

            {
                id: "restricted-speed",
                label: "Restricted Speed (km/h)",
                type: "number",
                value: "50"
            },

            {
                id: "restriction-distance",
                label: "Restricted Distance (km)",
                type: "number",
                value: "15"
            }

        ]

    },


    /* =====================================
       UNSCHEDULED MAINTENANCE
    ===================================== */

    maintenance: {

        title:
            "Unscheduled Maintenance Block Simulation",

        description:
            "Simulate emergency maintenance blocks and infrastructure restrictions.",

        fields: [

            {
                id: "sim-train",
                label: "Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "sim-section",
                label: "Maintenance Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "maintenance-type",
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
                id: "maintenance-duration",
                label: "Block Duration (minutes)",
                type: "number",
                value: "30"
            }

        ]

    },


    /* =====================================
       LEVEL CROSSING
    ===================================== */

    crossing: {

        title:
            "Level Crossing Gate Simulation",

        description:
            "Simulate delays caused by level crossing operations.",

        fields: [

            {
                id: "sim-train",
                label: "Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "sim-section",
                label: "Level Crossing Section",
                type: "select",
                options: railwaySections
            },

            {
                id: "crossing-status",
                label: "Gate Condition",
                type: "select",

                options: [

                    "Normal Operation",

                    "Gate Opening Delay",

                    "Gate Malfunction",

                    "Road Traffic Congestion"

                ]
            },

            {
                id: "crossing-delay",
                label: "Expected Crossing Delay (minutes)",
                type: "number",
                value: "10"
            }

        ]

    },


    /* =====================================
       OPERATIONAL BOTTLENECK
    ===================================== */

    bottleneck: {

        title:
            "Operational Bottleneck Simulation",

        description:
            "Simulate junction congestion and capacity limitations.",

        fields: [

            {
                id: "sim-train",
                label: "Train Number",
                type: "text",
                value: "12705"
            },

            {
                id: "junction",
                label: "Affected Junction",
                type: "select",

                options: [

                    "Vijayawada Junction",

                    "Khammam",

                    "Warangal Junction",

                    "Kazipet Junction"

                ]
            },

            {
                id: "capacity",
                label: "Available Route Capacity (%)",
                type: "number",
                value: "60"
            },

            {
                id: "queue-trains",
                label: "Number of Trains Waiting",
                type: "number",
                value: "4"
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
            data.forecast ||
            data.station_forecast ||
            data.stations ||
            [];


        liveEvents =
            data.events ||
            data.active_events ||
            [];


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
            liveStationForecast,
            liveTrainData
        );


        updateLiveTrainPositionFromAPI(
            liveStationForecast,
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

            train.current_station ||

            train.currentStation ||

            "Live location unavailable";

    }


    if (delay) {


        const currentDelay =

            Number(

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

                status ===
                "Current"

            ) {

                statusClass =
                    "status-mid";

            }


            if (

                status ===
                "Upcoming"

            ) {

                statusClass =
                    "status-mid";

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

                            station.station ||

                            station.station_name ||

                            "Unknown Station"

                        }

                    </div>


                    <div class="station-code">

                        ${

                            station.code ||

                            station.station_code ||

                            ""

                        }

                    </div>

                </div>


                <div>

                    <div class="time-value">

                        ${

                            station.predicted ||

                            station.predicted_time ||

                            station.eta ||

                            "--"

                        }

                    </div>


                    <div class="time-label">

                        Scheduled:

                        ${

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


    network.innerHTML =
        "";


    if (

        !stations ||

        stations.length === 0

    ) {

        return;

    }


    stations.forEach(
        station => {


            const stationElement =

                document.createElement(
                    "div"
                );


            stationElement.className =
                "network-station";


            const code =

                station.code ||

                station.station_code ||

                "";


            stationElement.dataset.code =
                code;


            const name =

                station.station ||

                station.station_name ||

                "Station";


            const currentCode =

                train.current_code ||

                train.currentCode ||

                "";


            const isCurrent =

                code === currentCode;


            stationElement.innerHTML = `

                <div class="network-station-marker">

                    ${

                        isCurrent

                            ? "🚆"

                            : "●"

                    }

                </div>


                <div class="network-station-info">

                    <b>

                        ${code}

                    </b>


                    <span>

                        ${name}

                    </span>

                </div>

            `;


            if (isCurrent) {

                stationElement.classList.add(
                    "current-network-station"
                );

            }


            network.appendChild(
                stationElement
            );

        }

    );


    /* =====================================
       ADD LIVE TRAIN MARKER
    ===================================== */

    const trainMarker =

        document.createElement(
            "div"
        );


    trainMarker.id =
        "live-network-train";


    trainMarker.className =
        "live-network-train";


    trainMarker.textContent =
        "🚆";


    network.appendChild(
        trainMarker
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
   RUN SIMULATION
========================================= */

function runSimulation() {


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


    if (!result) {

        return;

    }


    let impact = 0;

    let explanation = "";

    let affectedSection = "";


    /* =====================================
       SIGNAL SIMULATION
    ===================================== */

    if (

        currentSimulation ===
        "signal"

    ) {


        const delay =
            getNumber(
                "signal-delay"
            );


        const condition =
            getValue(
                "signal-status"
            );


        affectedSection =
            getValue(
                "sim-section"
            );


        let multiplier = 1;


        if (

            condition ===
            "Signal Failure"

        ) {

            multiplier = 1.3;

        }


        else if (

            condition ===
            "Signal Communication Failure"

        ) {

            multiplier = 1.2;

        }


        else if (

            condition ===
            "Temporary Signal Hold"

        ) {

            multiplier = 0.8;

        }


        impact =
            Math.round(
                delay * multiplier
            );


        explanation =
            `${condition} is affecting train movement and signal clearance in the selected section.`;

    }


    /* =====================================
       CONGESTION SIMULATION
    ===================================== */

    else if (

        currentSimulation ===
        "congestion"

    ) {


        const traffic =
            getValue(
                "traffic-level"
            );


        const trains =
            getNumber(
                "trains-count"
            );


        affectedSection =
            getValue(
                "sim-section"
            );


        let baseImpact = 8;


        if (

            traffic ===
            "High"

        ) {

            baseImpact = 15;

        }


        if (

            traffic ===
            "Severe"

        ) {

            baseImpact = 25;

        }


        impact =
            Math.round(

                baseImpact +

                trains * 3

            );


        explanation =
            `${trains} trains ahead are creating ${traffic.toLowerCase()} traffic congestion and increasing waiting time.`;

    }


    /* =====================================
       PRECEDING TRAIN
    ===================================== */

    else if (

        currentSimulation ===
        "preceding"

    ) {


        const precedingTrain =
            getValue(
                "preceding-train"
            );


        const precedingDelay =
            getNumber(
                "preceding-delay"
            );


        affectedSection =
            getValue(
                "sim-section"
            );


        impact =
            Math.round(
                precedingDelay * 0.65
            );


        explanation =
            `Delay propagation from Train ${precedingTrain} is reducing route availability for your train.`;

    }


    /* =====================================
       SPEED RESTRICTION
    ===================================== */

    else if (

        currentSimulation ===
        "speed"

    ) {


        const normalSpeed =
            getNumber(
                "normal-speed"
            );


        const restrictedSpeed =
            getNumber(
                "restricted-speed"
            );


        const distance =
            getNumber(
                "restriction-distance"
            );


        affectedSection =
            getValue(
                "sim-section"
            );


        if (

            normalSpeed <= 0 ||

            restrictedSpeed <= 0 ||

            distance <= 0

        ) {

            alert(
                "Please enter valid speed and distance values."
            );

            return;

        }


        const normalTime =

            (
                distance /

                normalSpeed
            )

            * 60;


        const restrictedTime =

            (
                distance /

                restrictedSpeed
            )

            * 60;


        impact =
            Math.round(

                restrictedTime -

                normalTime

            );


        explanation =
            `Speed is reduced from ${normalSpeed} km/h to ${restrictedSpeed} km/h over a distance of ${distance} km.`;

    }


    /* =====================================
       MAINTENANCE
    ===================================== */

    else if (

        currentSimulation ===
        "maintenance"

    ) {


        const duration =
            getNumber(
                "maintenance-duration"
            );


        const maintenanceType =
            getValue(
                "maintenance-type"
            );


        affectedSection =
            getValue(
                "sim-section"
            );


        let multiplier =
            0.8;


        if (

            maintenanceType ===
            "Emergency Repair"

        ) {

            multiplier =
                1.1;

        }


        else if (

            maintenanceType ===
            "Maintenance Block"

        ) {

            multiplier =
                1;

        }


        else if (

            maintenanceType ===
            "Track Inspection"

        ) {

            multiplier =
                0.5;

        }


        impact =
            Math.round(
                duration *
                multiplier
            );


        explanation =
            `${maintenanceType} is temporarily reducing route availability in the affected railway section.`;

    }


    /* =====================================
       LEVEL CROSSING
    ===================================== */

    else if (

        currentSimulation ===
        "crossing"

    ) {


        const crossingDelay =
            getNumber(
                "crossing-delay"
            );


        const status =
            getValue(
                "crossing-status"
            );


        affectedSection =
            getValue(
                "sim-section"
            );


        let multiplier =
            1;


        if (

            status ===
            "Gate Opening Delay"

        ) {

            multiplier =
                1.2;

        }


        else if (

            status ===
            "Gate Malfunction"

        ) {

            multiplier =
                1.5;

        }


        else if (

            status ===
            "Road Traffic Congestion"

        ) {

            multiplier =
                1.3;

        }


        impact =
            Math.round(
                crossingDelay *
                multiplier
            );


        explanation =
            `${status} is increasing train waiting time near the affected level crossing.`;

    }


    /* =====================================
       OPERATIONAL BOTTLENECK
    ===================================== */

    else if (

        currentSimulation ===
        "bottleneck"

    ) {


        const capacity =
            getNumber(
                "capacity"
            );


        const trains =
            getNumber(
                "queue-trains"
            );


        affectedSection =
            getValue(
                "junction"
            );


        if (

            capacity < 0 ||

            capacity > 100

        ) {

            alert(
                "Route capacity must be between 0 and 100."
            );

            return;

        }


        const capacityImpact =

            (
                100 -

                capacity
            )

            * 0.5;


        const trainImpact =

            trains *

            4;


        impact =
            Math.round(

                capacityImpact +

                trainImpact

            );


        explanation =
            `Available route capacity at ${affectedSection} is ${capacity}% with ${trains} trains waiting for clearance.`;

    }


    impact =
        Math.max(
            0,
            impact
        );


    const currentDelay =

    Number(

        liveTrainData?.current_delay ??

        liveTrainData?.currentDelay ??

        0

    );


const updatedDelay =

    currentDelay +

    impact;


    result.classList.remove(
        "hide"
    );


    result.innerHTML = `

        <div class="simulation-result-header">

            <span class="section-label">

                SIMULATION RESULT

            </span>


            <h2>

                ${feature.title}

            </h2>

        </div>


        <div class="simulation-impact-result">


            <div class="impact-value">

                +${impact} min

            </div>


            <div>

                <b>

                    Predicted Additional Delay

                </b>


                <p>

                    ${explanation}

                </p>

            </div>


        </div>


        <div class="simulation-analysis">


            <div>

                <small>

                    AFFECTED AREA

                </small>


                <b>

                    ${affectedSection}

                </b>

            </div>


            <div>

                <small>

                    SIMULATION IMPACT

                </small>


                <b class="delay-result">

                    +${impact} min

                </b>

            </div>


            <div>

                <small>

                    CURRENT TRAIN DELAY

                </small>


                <b>

                    +${currentDelay} min

                </b>

            </div>


            <div>

                <small>

                    UPDATED PREDICTED DELAY

                </small>


                <b>

                    +${updatedDelay} min

                </b>

            </div>


        </div>


        <div class="simulation-ai-note">

            <span>

                🧠

            </span>


            <p>

                This simulation creates an additional disruption impact that can be passed into the RailForecast Dynamic ETA Engine together with historical ML prediction, live train data, real-time corrections and railway-authorized API intelligence.

            </p>


        </div>

    `;


    setTimeout(() => {

        result.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });

    }, 100);

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
    routeStations,
    train
) {

    if (!train) {
        return;
    }
    
    
    const trainElement =
        document.getElementById("selected-network-train");

    if (!network || !trainElement) {
        console.log("Rail network or train element not found.");
        return;
    }

    const currentCode = String(
        train.current_code ||
        train.currentCode ||
        ""
    ).toUpperCase();

    let nextCode = String(
        train.next_code ||
        train.nextCode ||
        ""
    ).toUpperCase();

    let sectionProgress = Number(
        train.section_progress ??
        train.sectionProgress ??
        0
    );

    if (!Number.isFinite(sectionProgress)) {
        sectionProgress = 0;
    }

    sectionProgress = Math.max(0, Math.min(1, sectionProgress));

    if (!nextCode && Array.isArray(routeStations)) {
        const currentIndex = routeStations.findIndex(
            station => String(
                station.code || station.station_code || ""
            ).toUpperCase() === currentCode
        );

        if (
            currentIndex >= 0 &&
            currentIndex < routeStations.length - 1
        ) {
            nextCode = String(
                routeStations[currentIndex + 1].code ||
                routeStations[currentIndex + 1].station_code ||
                ""
            ).toUpperCase();
        }
    }
    

if (!network) {

    console.warn(
        "Rail network element not found"
    );

    return;

}
    const stationElements =
        Array.from(
            network.querySelectorAll(".network-station")
        );

    const getStationCode = station => {
        const dataCode = station.dataset.code;

        if (dataCode) {
            return String(dataCode).trim().toUpperCase();
        }

        const node = station.querySelector(".station-node");

        return node
            ? node.textContent.trim().toUpperCase()
            : "";
    };

    const currentElement =
        stationElements.find(
            station => getStationCode(station) === currentCode
        );

    const nextElement =
        stationElements.find(
            station => getStationCode(station) === nextCode
        );

    if (!currentElement) {
        console.log("Current station not found:", currentCode);
        return;
    }

    stationElements.forEach(
        station => station.classList.remove("active-station")
    );

    currentElement.classList.add("active-station");

    const networkRect =
        network.getBoundingClientRect();

    const currentRect =
        currentElement.getBoundingClientRect();

    const startX =
        currentRect.left - networkRect.left +
        currentRect.width / 2;

    const startY =
        currentRect.top - networkRect.top +
        currentRect.height / 2;

    let x = startX;
    let y = startY;

    if (nextElement) {
        const nextRect =
            nextElement.getBoundingClientRect();

        const endX =
            nextRect.left - networkRect.left +
            nextRect.width / 2;

        const endY =
            nextRect.top - networkRect.top +
            nextRect.height / 2;

        x = startX + (endX - startX) * sectionProgress;
        y = startY + (endY - startY) * sectionProgress;
    }

    trainElement.style.left = `${x}px`;
    trainElement.style.top = `${y}px`;
    trainElement.style.transform = "translate(-50%, -50%)";

}


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {


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
function apiUrl(path) {
    return `${API_BASE}${path}`;
}
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

                        liveStationForecast,

                        liveTrainData

                    );


                    updateLiveTrainPositionFromAPI(

                        liveStationForecast,

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
