/* =========================================
   RAILFORECAST
   COMPLETE JAVASCRIPT - NEW VERSION
========================================= */


/* =========================================
   HELPER
========================================= */

const $ = (id) => document.getElementById(id);


/* =========================================
   PAGE NAVIGATION
========================================= */

const screens = [
    "home",
    "passenger",
    "department",
    "simulation",
    "authorized-api"
];


function showScreen(screenId) {

    screens.forEach((id) => {

        const screen = $(id);

        if (!screen) return;

        screen.classList.add("hide");

    });


    const selectedScreen = $(screenId);

    if (selectedScreen) {

        selectedScreen.classList.remove("hide");

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================
   HOME
========================================= */

function home() {

    showScreen("home");

}


/* =========================================
   PASSENGER
========================================= */

function passenger() {

    showScreen("passenger");

}


/* =========================================
   DEPARTMENT
========================================= */

function department() {

    showScreen("department");

}


/* =========================================
   SIMULATION
========================================= */

function simulation() {

    showScreen("simulation");

}


/* =========================================
   AUTHORIZED API
========================================= */

function authorizedAPI() {

    showScreen("authorized-api");

}


/* =========================================
   DEFAULT DATE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const dateInput = $("date");

    if (dateInput) {

        const today = new Date();

        const formattedDate =
            today.toISOString().split("T")[0];

        dateInput.value = formattedDate;

    }


    setupTrainInput();

});


/* =========================================
   TRAIN INPUT ENTER KEY
========================================= */

function setupTrainInput() {

    const trainInput = $("train");

    if (!trainInput) return;


    trainInput.addEventListener(

        "keydown",

        (event) => {

            if (event.key === "Enter") {

                forecast();

            }

        }

    );

}


/* =========================================
   TRAIN SEARCH
========================================= */

async function forecast() {

    const trainInput = $("train");

    if (!trainInput) return;


    const trainNumber =
        trainInput.value.trim();


    if (!trainNumber) {

        showError(
            "Please enter a train number or train name."
        );

        return;

    }


    hideError();


    const loading = $("loading");

    const result = $("result");


    if (result) {

        result.classList.add("hide");

    }


    if (loading) {

        loading.classList.remove("hide");

    }


    try {

        /*
         =====================================
         API CALL
         =====================================

         Your config.js can contain:

         const API_BASE_URL =
             "http://localhost:5000";

         OR your deployed backend URL.

         This code automatically tries
         multiple possible API endpoints.
        */


        let response = null;

        let data = null;


        if (
            typeof API_BASE_URL !==
            "undefined"
        ) {

            const endpoints = [

                `${API_BASE_URL}/forecast/${trainNumber}`,

                `${API_BASE_URL}/api/forecast/${trainNumber}`,

                `${API_BASE_URL}/forecast?train=${trainNumber}`

            ];


            for (
                const endpoint of endpoints
            ) {

                try {

                    const res =
                        await fetch(endpoint);


                    if (res.ok) {

                        response = res;

                        break;

                    }

                }

                catch (error) {

                    console.log(
                        "Endpoint unavailable:",
                        endpoint
                    );

                }

            }


            if (response) {

                data =
                    await response.json();

            }

        }


        /*
         =====================================
         DEMO FALLBACK
         =====================================

         This allows your SIH prototype
         to work even when backend/API
         is unavailable.
        */


        if (!data) {

            data =
                createDemoForecast(
                    trainNumber
                );

        }


        renderForecast(data);


    }

    catch (error) {

        console.error(error);


        /*
         Prototype fallback
        */

        const demoData =
            createDemoForecast(
                trainNumber
            );


        renderForecast(
            demoData
        );

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
   DEMO FORECAST DATA
========================================= */

function createDemoForecast(
    trainNumber
) {

    return {

        train_number:
            trainNumber || "12705",


        train_name:
            "Guntur–Secunderabad Intercity Express",


        route:
            "Guntur Junction → Secunderabad Junction",


        current_station:
            "Khammam Junction",


        current_delay:
            12,


        next_station:
            "Dornakal Junction",


        last_updated:
            new Date().toLocaleTimeString(
                [],
                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }
            ),


        progress:
            42,


        journey_from:
            "Guntur Junction",


        journey_to:
            "Secunderabad Junction",


        impacts: [

            {

                feature:
                    "Congestion on Busy Routes",

                section:
                    "Khammam → Dornakal",

                impact:
                    5

            },


            {

                feature:
                    "Delays in Preceding Trains",

                section:
                    "Warangal → Kazipet",

                impact:
                    4

            },


            {

                feature:
                    "Temporary Speed Restriction",

                section:
                    "Bhongir → Charlapalli",

                impact:
                    3

            }

        ],


        model_performance: {

            baseline_mae:
                5.74,

            dynamic_mae:
                3.48,

            improvement:
                39.36

        },


        stations: [

            {

                station:
                    "Guntur Junction",

                code:
                    "GNT",

                scheduled:
                    "10:30 AM",

                predicted:
                    "10:35 AM",

                delay:
                    5,

                status:
                    "passed"

            },


            {

                station:
                    "Mangalagiri",

                code:
                    "MGL",

                scheduled:
                    "11:00 AM",

                predicted:
                    "11:07 AM",

                delay:
                    7,

                status:
                    "passed"

            },


            {

                station:
                    "Vijayawada Junction",

                code:
                    "BZA",

                scheduled:
                    "11:45 AM",

                predicted:
                    "11:55 AM",

                delay:
                    10,

                status:
                    "passed"

            },


            {

                station:
                    "Madhira",

                code:
                    "MDR",

                scheduled:
                    "12:40 PM",

                predicted:
                    "12:52 PM",

                delay:
                    12,

                status:
                    "passed"

            },


            {

                station:
                    "Khammam Junction",

                code:
                    "KMT",

                scheduled:
                    "1:30 PM",

                predicted:
                    "1:42 PM",

                delay:
                    12,

                status:
                    "current"

            },


            {

                station:
                    "Dornakal Junction",

                code:
                    "DKJ",

                scheduled:
                    "2:05 PM",

                predicted:
                    "2:19 PM",

                delay:
                    14,

                status:
                    "upcoming"

            },


            {

                station:
                    "Mahbubabad",

                code:
                    "MABD",

                scheduled:
                    "2:40 PM",

                predicted:
                    "2:56 PM",

                delay:
                    16,

                status:
                    "upcoming"

            },


            {

                station:
                    "Nekonda",

                code:
                    "NKD",

                scheduled:
                    "3:10 PM",

                predicted:
                    "3:27 PM",

                delay:
                    17,

                status:
                    "upcoming"

            },


            {

                station:
                    "Warangal Junction",

                code:
                    "WL",

                scheduled:
                    "3:50 PM",

                predicted:
                    "4:08 PM",

                delay:
                    18,

                status:
                    "upcoming"

            },


            {

                station:
                    "Kazipet Junction",

                code:
                    "KZJ",

                scheduled:
                    "4:30 PM",

                predicted:
                    "4:49 PM",

                delay:
                    19,

                status:
                    "upcoming"

            },


            {

                station:
                    "Jangaon",

                code:
                    "ZN",

                scheduled:
                    "5:15 PM",

                predicted:
                    "5:35 PM",

                delay:
                    20,

                status:
                    "upcoming"

            },


            {

                station:
                    "Aler",

                code:
                    "ALER",

                scheduled:
                    "5:50 PM",

                predicted:
                    "6:12 PM",

                delay:
                    22,

                status:
                    "upcoming"

            },


            {

                station:
                    "Bhongir",

                code:
                    "BG",

                scheduled:
                    "6:20 PM",

                predicted:
                    "6:44 PM",

                delay:
                    24,

                status:
                    "upcoming"

            },


            {

                station:
                    "Charlapalli",

                code:
                    "CHZ",

                scheduled:
                    "6:45 PM",

                predicted:
                    "7:10 PM",

                delay:
                    25,

                status:
                    "upcoming"

            },


            {

                station:
                    "Secunderabad Junction",

                code:
                    "SC",

                scheduled:
                    "7:10 PM",

                predicted:
                    "7:36 PM",

                delay:
                    26,

                status:
                    "destination"

            }

        ]

    };

}


/* =========================================
   RENDER COMPLETE FORECAST
========================================= */

function renderForecast(data) {

    const result = $("result");


    if (result) {

        result.classList.remove(
            "hide"
        );

    }


    renderTrainOverview(data);

    renderMetrics(data);

    renderJourney(data);

    renderImpacts(data);

    renderAccuracyChart(data);

    renderTimeline(data);

    updateSelectedTrainPosition(
        data
    );

}


/* =========================================
   TRAIN OVERVIEW
========================================= */

function renderTrainOverview(data) {

    if ($("title")) {

        $("title").textContent =
            `Train ${data.train_number} • ${data.train_name}`;

    }


    if ($("route")) {

        $("route").textContent =
            data.route;

    }

}


/* =========================================
   METRICS
========================================= */

function renderMetrics(data) {

    if ($("cur")) {

        $("cur").textContent =
            data.current_station ||
            "—";

    }


    if ($("delay")) {

        const delay =
            Number(data.current_delay || 0);


        $("delay").textContent =
            delay === 0
                ? "On Time"
                : `+${delay} min`;

    }


    if ($("next")) {

        $("next").textContent =
            data.next_station ||
            "—";

    }


    if ($("updated")) {

        $("updated").textContent =
            data.last_updated ||
            "—";

    }

}


/* =========================================
   JOURNEY PROGRESS
========================================= */

function renderJourney(data) {

    let progress =
        Number(data.progress);


    if (
        Number.isNaN(progress)
    ) {

        progress = 0;

    }


    progress =
        Math.max(
            0,
            Math.min(
                progress,
                100
            )
        );


    if ($("journey-percent")) {

        $("journey-percent").textContent =
            `${Math.round(progress)}%`;

    }


    if ($("journey-from")) {

        $("journey-from").textContent =
            data.journey_from ||
            "Source";

    }


    if ($("journey-to")) {

        $("journey-to").textContent =
            data.journey_to ||
            "Destination";

    }


    if ($("journey-progress")) {

        $("journey-progress").style.width =
            `${progress}%`;

    }


    if ($("progress-marker")) {

        $("progress-marker").style.left =
            `${progress}%`;

    }


    if ($("journey-status")) {

        $("journey-status").textContent =

            progress >= 100

                ? "Journey completed."

                : `${Math.round(progress)}% of the journey completed. Live train movement is being monitored.`;

    }

}


/* =========================================
   LIVE RAILWAY NETWORK
   YOUR TRAIN POSITION
========================================= */

function updateSelectedTrainPosition(
    data
) {

    const selectedTrain =
        $("selected-network-train");


    if (!selectedTrain) return;


    const progress =
        Number(data.progress || 0);


    /*
     The selected train visually moves
     based on overall journey progress.
    */


    let position =
        Math.max(
            5,
            Math.min(
                progress,
                95
            )
        );


    selectedTrain.style.left =
        `${position}%`;


    selectedTrain.style.transition =
        "left 1.5s ease";

}


/* =========================================
   ACTIVE DELAY IMPACTS
========================================= */

function renderImpacts(data) {

    const impacts =
        data.impacts || [];


    const impactSection =
        $("impact-section");


    if (!impactSection) return;


    if (
        impacts.length === 0
    ) {

        impactSection.classList.add(
            "hide"
        );

        return;

    }


    impactSection.classList.remove(
        "hide"
    );


    const totalImpact =
        impacts.reduce(

            (
                total,
                item
            ) =>

                total +
                Number(
                    item.impact || 0
                ),

            0

        );


    if ($("total-impact")) {

        $("total-impact").textContent =
            `+${totalImpact} min`;

    }


    const summary =
        $("impact-summary");


    if (summary) {

        summary.innerHTML =

            `
            <div class="impact-summary-item">

                <small>
                    ACTIVE DISRUPTIONS
                </small>

                <b>
                    ${impacts.length}
                </b>

            </div>


            <div class="impact-summary-item">

                <small>
                    TOTAL ESTIMATED IMPACT
                </small>

                <b>
                    +${totalImpact} min
                </b>

            </div>
            `;

    }


    const events =
        $("active-events");


    if (events) {

        events.innerHTML =
            "";


        impacts.forEach(
            (item) => {

                const event =
                    document.createElement(
                        "div"
                    );


                event.className =
                    "event-item";


                event.innerHTML =

                    `
                    <div>

                        <div class="event-feature">

                            ${item.feature}

                        </div>


                        <span class="event-section">

                            ${item.section}

                        </span>

                    </div>


                    <div class="event-impact">

                        +${item.impact} min

                    </div>
                    `;


                events.appendChild(
                    event
                );

            }
        );

    }

}


/* =========================================
   ETA ACCURACY CHART
========================================= */

let accuracyChart = null;


function renderAccuracyChart(data) {

    const canvas =
        $("accuracyChart");


    if (!canvas) return;


    const performance =
        data.model_performance || {};


    const baseline =
        Number(
            performance.baseline_mae ||
            5.74
        );


    const dynamic =
        Number(
            performance.dynamic_mae ||
            3.48
        );


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

                        "RailForecast AI"

                    ],


                    datasets: [

                        {

                            label:
                                "Mean Absolute Error (Minutes)",


                            data: [

                                baseline,

                                dynamic

                            ],


                            borderWidth:
                                1,


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

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    (context) =>

                                        `${context.raw} minutes MAE`

                            }

                        }

                    },


                    scales: {

                        x: {

                            ticks: {

                                color:
                                    "#c8d3e2"

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
                                    "rgba(255,255,255,0.06)"

                            }

                        }

                    }

                }

            }

        );

}


/* =========================================
   FUTURE ETA TIMELINE
========================================= */

function renderTimeline(data) {

    const timeline =
        $("timeline");


    if (!timeline) return;


    timeline.innerHTML =
        "";


    const stations =
        data.stations || [];


    stations.forEach(
        (
            station,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "forecast-row";


            const delay =
                Number(
                    station.delay || 0
                );


            let delayClass =
                "delay-good";


            if (delay > 10) {

                delayClass =
                    "delay-mid";

            }


            if (delay > 20) {

                delayClass =
                    "delay-bad";

            }


            let statusClass =
                "status-good";


            let statusText =
                station.status ||
                "Upcoming";


            if (
                station.status ===
                "current"
            ) {

                statusClass =
                    "status-mid";

                statusText =
                    "CURRENT";

            }


            if (
                station.status ===
                "upcoming"
            ) {

                statusClass =
                    "status-mid";

                statusText =
                    "UPCOMING";

            }


            if (
                station.status ===
                "destination"
            ) {

                statusClass =
                    "status-good";

                statusText =
                    "DESTINATION";

            }


            if (
                station.status ===
                "passed"
            ) {

                statusText =
                    "PASSED";

            }


            row.innerHTML =

                `
                <div class="timeline-dot">

                    ${getTimelineIcon(
                        station.status
                    )}

                </div>


                <div>

                    <div class="station-name">

                        ${station.station}

                    </div>


                    <div class="station-code">

                        ${station.code || ""}

                    </div>

                </div>


                <div>

                    <div class="time-value">

                        ${station.predicted}

                    </div>


                    <div class="time-label">

                        Scheduled:
                        ${station.scheduled}

                    </div>

                </div>


                <div
                    class="
                        delay-column
                        ${delayClass}
                    "
                >

                    +${delay} min

                </div>


                <div
                    class="
                        status-badge
                        ${statusClass}
                    "
                >

                    ${statusText}

                </div>
                `;


            timeline.appendChild(
                row
            );

        }
    );

}


/* =========================================
   TIMELINE ICON
========================================= */

function getTimelineIcon(
    status
) {

    if (status === "passed") {

        return "✓";

    }


    if (status === "current") {

        return "🚆";

    }


    if (
        status ===
        "destination"
    ) {

        return "🏁";

    }


    return "○";

}


/* =========================================
   ERROR HANDLING
========================================= */

function showError(message) {

    const error =
        $("err");


    if (!error) return;


    error.textContent =
        message;


    error.classList.remove(
        "hide"
    );

}


function hideError() {

    const error =
        $("err");


    if (!error) return;


    error.classList.add(
        "hide"
    );

}


/* =========================================
   SIMULATION DATA
========================================= */

const simulationData = {

    signal: {

        title:
            "Signal Points",

        description:
            "Simulate signal malfunction or signal clearance delays affecting train movement.",

        baseImpact:
            12

    },


    congestion: {

        title:
            "Congestion on Busy Routes",

        description:
            "Simulate increased train density and route congestion.",

        baseImpact:
            10

    },


    preceding: {

        title:
            "Delays in Preceding Trains",

        description:
            "Analyze delay propagation caused by preceding trains.",

        baseImpact:
            8

    },


    speed: {

        title:
            "Temporary Speed Restrictions",

        description:
            "Simulate speed restrictions affecting section running time.",

        baseImpact:
            9

    },


    maintenance: {

        title:
            "Unscheduled Maintenance Blocks",

        description:
            "Simulate emergency maintenance or temporary section closure.",

        baseImpact:
            18

    },


    crossing: {

        title:
            "Level Crossing Gates",

        description:
            "Simulate delays caused by level crossing operations.",

        baseImpact:
            6

    },


    bottleneck: {

        title:
            "Operational Bottlenecks",

        description:
            "Simulate capacity restrictions and junction congestion.",

        baseImpact:
            11

    }

};


/* =========================================
   CURRENT SIMULATION
========================================= */

let currentSimulation =
    null;


/* =========================================
   OPEN SIMULATION
========================================= */

function openSimulation(type) {

    currentSimulation =
        type;


    const simulation =
        simulationData[type];


    if (!simulation) return;


    const config =
        $("simulation-config");


    if (config) {

        config.classList.remove(
            "hide"
        );

    }


    if ($("simulation-title")) {

        $("simulation-title").textContent =
            simulation.title;

    }


    if ($("simulation-result")) {

        $("simulation-result").classList.add(
            "hide"
        );

    }


    setTimeout(
        () => {

            config.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        },
        100
    );

}


/* =========================================
   CLOSE SIMULATION
========================================= */

function closeSimulation() {

    const config =
        $("simulation-config");


    if (config) {

        config.classList.add(
            "hide"
        );

    }


    currentSimulation =
        null;

}


/* =========================================
   RUN SIMULATION
========================================= */

function runSimulation() {

    if (
        !currentSimulation
    ) {

        return;

    }


    const simulation =
        simulationData[
            currentSimulation
        ];


    const train =
        $("sim-train")?.value ||
        "12705";


    const section =
        $("sim-section")?.value ||
        "Selected Section";


    const severity =
        $("sim-severity")?.value ||
        "medium";


    const duration =
        Number(
            $("sim-duration")?.value
        ) || 30;


    let severityMultiplier =
        1;


    if (
        severity === "low"
    ) {

        severityMultiplier =
            0.6;

    }


    if (
        severity === "medium"
    ) {

        severityMultiplier =
            1;

    }


    if (
        severity === "high"
    ) {

        severityMultiplier =
            1.6;

    }


    /*
     =====================================
     SIMULATION IMPACT

     Impact uses:

     Feature Base Impact
     × Severity
     × Duration Factor
     =====================================
    */


    const durationFactor =
        Math.max(
            0.5,
            duration / 30
        );


    const impact =
        Math.round(

            simulation.baseImpact *
            severityMultiplier *
            durationFactor

        );


    /*
     Historical recovery assumption.
    */


    const recoveryRate =
        0.35;


    const recoverableDelay =
        Math.round(

            impact *
            recoveryRate

        );


    const finalImpact =
        Math.max(

            0,

            impact -
            recoverableDelay

        );


    const result =
        $("simulation-result");


    if (!result) return;


    result.classList.remove(
        "hide"
    );


    result.innerHTML =

        `
        <div class="simulation-result-header">

            <div>

                <span class="section-label">

                    SIMULATION RESULT

                </span>


                <h2>

                    ${simulation.title}

                </h2>

            </div>


            <div class="simulation-impact-value">

                +${finalImpact} min

            </div>

        </div>


        <div class="simulation-result-grid">


            <div>

                <small>
                    TRAIN
                </small>

                <b>
                    ${train}
                </b>

            </div>


            <div>

                <small>
                    AFFECTED SECTION
                </small>

                <b>
                    ${section}
                </b>

            </div>


            <div>

                <small>
                    SEVERITY
                </small>

                <b>

                    ${severity.toUpperCase()}

                </b>

            </div>


            <div>

                <small>
                    DISRUPTION DURATION
                </small>

                <b>
                    ${duration} min
                </b>

            </div>


        </div>


        <div class="simulation-calculation">


            <h3>

                ETA Impact Analysis

            </h3>


            <div class="calculation-row">

                <span>

                    Raw Disruption Impact

                </span>


                <b>

                    +${impact} min

                </b>

            </div>


            <div class="calculation-row">

                <span>

                    Expected Operational Recovery

                </span>


                <b class="recovery">

                    −${recoverableDelay} min

                </b>

            </div>


            <div class="calculation-row final-impact">

                <span>

                    Final ETA Impact

                </span>


                <b>

                    +${finalImpact} min

                </b>

            </div>


        </div>


        <div class="simulation-ai-note">

            🧠

            <p>

                RailForecast combines the simulated
                disruption with historical section delay
                patterns and operational recovery behaviour
                to estimate the expected impact on future ETA.

            </p>

        </div>
        `;


    result.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });

}


/* =========================================
   AUTHORIZED API CONNECTION
========================================= */

function connectAPI(type) {

    const endpointInput =
        $(`${type}-endpoint`);


    const keyInput =
        $(`${type}-key`);


    const status =
        $(`${type}-status`);


    if (
        !endpointInput ||
        !keyInput ||
        !status
    ) {

        return;

    }


    const endpoint =
        endpointInput.value.trim();


    const key =
        keyInput.value.trim();


    /*
     =====================================
     VALIDATION
     =====================================
    */


    if (!endpoint) {

        status.textContent =
            "Endpoint Required";


        status.style.color =
            "#ff8989";


        return;

    }


    if (!key) {

        status.textContent =
            "API Key Required";


        status.style.color =
            "#ff8989";


        return;

    }


    /*
     =====================================
     DEMO CONNECTION

     For the SIH prototype,
     this changes connection state.

     When real government APIs are
     provided, replace this section with
     secure backend API integration.

     IMPORTANT:
     Real API keys should NOT be directly
     exposed in frontend JavaScript.
     =====================================
    */


    status.textContent =
        "Connecting...";


    status.style.color =
        "#f2b84b";


    setTimeout(
        () => {

            status.textContent =
                "Connected";


            status.style.color =
                "#34c77b";


            saveAPIConnection(
                type,
                endpoint
            );

        },
        900
    );

}


/* =========================================
   SAVE API CONNECTION STATUS
========================================= */

function saveAPIConnection(
    type,
    endpoint
) {

    const connections =
        JSON.parse(

            localStorage.getItem(
                "railforecast-api-connections"
            )

        ) || {};


    connections[type] = {

        endpoint:

            endpoint,

        connected:

            true,

        connectedAt:

            new Date().toISOString()

    };


    localStorage.setItem(

        "railforecast-api-connections",

        JSON.stringify(
            connections
        )

    );

}


/* =========================================
   LOAD API CONNECTION STATUS
========================================= */

function loadAPIConnections() {

    const connections =
        JSON.parse(

            localStorage.getItem(
                "railforecast-api-connections"
            )

        ) || {};


    Object.keys(
        connections
    ).forEach(
        (type) => {

            const connection =
                connections[type];


            const status =
                $(`${type}-status`);


            const endpoint =
                $(`${type}-endpoint`);


            if (
                connection.connected &&
                status
            ) {

                status.textContent =
                    "Connected";


                status.style.color =
                    "#34c77b";

            }


            if (
                connection.endpoint &&
                endpoint
            ) {

                endpoint.value =
                    connection.endpoint;

            }

        }
    );

}


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadAPIConnections();

    }

);


/* =========================================
   OPTIONAL LIVE AUTO REFRESH
========================================= */

let liveRefreshInterval =
    null;


function startLiveRefresh() {

    if (
        liveRefreshInterval
    ) {

        clearInterval(
            liveRefreshInterval
        );

    }


    /*
     Refresh every 60 seconds.

     When your real backend is connected,
     this can call forecast() automatically.
    */


    liveRefreshInterval =
        setInterval(

            () => {

                const passengerScreen =
                    $("passenger");


                const result =
                    $("result");


                if (

                    passengerScreen &&

                    !passengerScreen.classList.contains(
                        "hide"
                    ) &&

                    result &&

                    !result.classList.contains(
                        "hide"
                    )

                ) {

                    console.log(
                        "Live forecast refresh available."
                    );

                }

            },

            60000

        );

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        startLiveRefresh();

    }

);
