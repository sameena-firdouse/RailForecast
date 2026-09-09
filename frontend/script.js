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
   DEMO TRAIN DATA
========================================= */

const trainData = {

    number: "12705",

    name:
        "Guntur–Secunderabad Intercity Express",

    route:
        "Guntur Junction → Secunderabad Junction",

    currentStation:
        "Khammam",

    currentCode:
        "KMM",

    currentDelay:
        12,

    nextStation:
        "Dornakal Junction",

    updated:
        "Just now",

    progress:
        42,

    from:
        "Guntur Junction",

    to:
        "Secunderabad Junction"

};


/* =========================================
   STATION FORECAST DATA
========================================= */

const stationForecast = [

    {
        station: "Guntur Junction",
        code: "GNT",
        scheduled: "10:30 AM",
        predicted: "10:35 AM",
        delay: 5,
        status: "Passed"
    },

    {
        station: "Mangalagiri",
        code: "MGL",
        scheduled: "12:30 PM",
        predicted: "12:42 PM",
        delay: 12,
        status: "Passed"
    },

    {
        station: "Vijayawada Junction",
        code: "BZA",
        scheduled: "1:15 PM",
        predicted: "1:28 PM",
        delay: 13,
        status: "Passed"
    },

    {
        station: "Madhira",
        code: "MDR",
        scheduled: "1:55 PM",
        predicted: "2:08 PM",
        delay: 13,
        status: "Passed"
    },

    {
        station: "Khammam",
        code: "KMM",
        scheduled: "2:30 PM",
        predicted: "2:42 PM",
        delay: 12,
        status: "Current"
    },

    {
        station: "Dornakal Junction",
        code: "DKJ",
        scheduled: "3:05 PM",
        predicted: "3:17 PM",
        delay: 12,
        status: "Upcoming"
    },

    {
        station: "Mahbubabad",
        code: "MABD",
        scheduled: "3:40 PM",
        predicted: "3:54 PM",
        delay: 14,
        status: "Upcoming"
    },

    {
        station: "Nekonda",
        code: "NKD",
        scheduled: "4:10 PM",
        predicted: "4:26 PM",
        delay: 16,
        status: "Upcoming"
    },

    {
        station: "Warangal Junction",
        code: "WL",
        scheduled: "4:50 PM",
        predicted: "5:06 PM",
        delay: 16,
        status: "Upcoming"
    },

    {
        station: "Kazipet Junction",
        code: "KZJ",
        scheduled: "5:30 PM",
        predicted: "5:47 PM",
        delay: 17,
        status: "Upcoming"
    },

    {
        station: "Ghanpur",
        code: "GNP",
        scheduled: "6:00 PM",
        predicted: "6:18 PM",
        delay: 18,
        status: "Upcoming"
    },

    {
        station: "Jangaon",
        code: "ZN",
        scheduled: "6:30 PM",
        predicted: "6:49 PM",
        delay: 19,
        status: "Upcoming"
    },

    {
        station: "Aler",
        code: "ALER",
        scheduled: "7:00 PM",
        predicted: "7:22 PM",
        delay: 22,
        status: "Upcoming"
    },

    {
        station: "Bhongir",
        code: "BG",
        scheduled: "7:30 PM",
        predicted: "7:55 PM",
        delay: 25,
        status: "Upcoming"
    },

    {
        station: "Charlapalli",
        code: "CHZ",
        scheduled: "8:00 PM",
        predicted: "8:27 PM",
        delay: 27,
        status: "Upcoming"
    },

    {
        station: "Secunderabad Junction",
        code: "SC",
        scheduled: "8:30 PM",
        predicted: "9:02 PM",
        delay: 32,
        status: "Destination"
    }

];


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

function forecast() {

    const trainInput =
        document.getElementById("train");

    const error =
        document.getElementById("err");

    const loading =
        document.getElementById("loading");

    const result =
        document.getElementById("result");


    if (!trainInput) {

        return;

    }


    const trainNumber =
        trainInput.value.trim();


    if (error) {

        error.classList.add("hide");

        error.textContent = "";

    }


    if (trainNumber === "") {

        if (error) {

            error.textContent =
                "Please enter a train number.";

            error.classList.remove("hide");

        }

        return;

    }


    if (result) {

        result.classList.add("hide");

    }


    if (loading) {

        loading.classList.remove("hide");

    }


    setTimeout(() => {


        if (loading) {

            loading.classList.add("hide");

        }


        if (result) {

            result.classList.remove("hide");

        }


        updateTrainStatus();

        updateJourney();

        renderForecastTimeline();

        renderImpacts();

        renderAccuracyChart();


        /* =====================================
           UPDATE LIVE TRAIN POSITION
        ===================================== */

        updateLiveTrainPosition(

            trainData.currentCode,

            trainData.nextStation,

            0.5

        );


        if (result) {

            result.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }


    }, 1000);

}


/* =========================================
   TRAIN STATUS
========================================= */

function updateTrainStatus() {

    const title =
        document.getElementById("title");

    const route =
        document.getElementById("route");

    const cur =
        document.getElementById("cur");

    const delay =
        document.getElementById("delay");

    const next =
        document.getElementById("next");

    const updated =
        document.getElementById("updated");


    if (title) {

        title.textContent =
            `Train ${trainData.number} • ${trainData.name}`;

    }


    if (route) {

        route.textContent =
            trainData.route;

    }


    if (cur) {

        cur.textContent =
            trainData.currentStation;

    }


    if (delay) {

        delay.textContent =
            `+${trainData.currentDelay} min`;

    }


    if (next) {

        next.textContent =
            trainData.nextStation;

    }


    if (updated) {

        updated.textContent =
            trainData.updated;

    }

}


/* =========================================
   JOURNEY PROGRESS
========================================= */

function updateJourney() {

    const progress =
        trainData.progress;


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
            `${progress}%`;

    }


    if (journeyFrom) {

        journeyFrom.textContent =
            trainData.from;

    }


    if (journeyTo) {

        journeyTo.textContent =
            trainData.to;

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

        journeyStatus.textContent =
            `Your train is currently near ${trainData.currentStation}. ${progress}% of the journey has been completed.`;

    }

}


/* =========================================
   ACTIVE DELAY IMPACTS
========================================= */

function renderImpacts() {

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


    const impactData = [

        {

            feature:
                "Route Congestion",

            section:
                "Khammam → Dornakal",

            impact:
                7

        },


        {

            feature:
                "Historical Delay Pattern",

            section:
                "Warangal → Kazipet",

            impact:
                5

        }

    ];


    const total =
        impactData.reduce(

            (sum, item) =>
                sum + item.impact,

            0

        );


    totalImpact.textContent =
        `+${total} min`;


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
                +${total} min
            </b>

        </div>

    `;


    events.innerHTML = "";


    impactData.forEach(item => {

        const element =
            document.createElement("div");


        element.className =
            "event-item";


        element.innerHTML = `

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


        events.appendChild(element);

    });


    impactSection.classList.remove(
        "hide"
    );

}


/* =========================================
   FORECAST TIMELINE
========================================= */

function renderForecastTimeline() {

    const timeline =
        document.getElementById(
            "timeline"
        );


    if (!timeline) {

        return;

    }


    timeline.innerHTML = "";


    stationForecast.forEach(station => {


        let delayClass =
            "delay-good";


        if (

            station.delay >= 10 &&

            station.delay < 20

        ) {

            delayClass =
                "delay-mid";

        }


        if (

            station.delay >= 20

        ) {

            delayClass =
                "delay-bad";

        }


        let statusClass =
            "status-good";


        if (

            station.status ===
            "Current"

        ) {

            statusClass =
                "status-mid";

        }


        if (

            station.status ===
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

            station.status ===
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

                    ${station.station}

                </div>


                <div class="station-code">

                    ${station.code}

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


            <div class="delay-column">

                <div class="${delayClass}">

                    +${station.delay} min

                </div>


                <div class="confidence">

                    AI Prediction

                </div>

            </div>


            <div class="status-badge ${statusClass}">

                ${station.status}

            </div>

        `;


        timeline.appendChild(row);

    });

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


    const updatedDelay =
        trainData.currentDelay +
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

                    +${trainData.currentDelay} min

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

function updateLiveTrainPosition(

    currentStation,

    nextStation,

    sectionProgress = 0.5

) {


    const network =
        document.getElementById(
            "rail-network"
        );


    const train =
        document.getElementById(
            "live-network-train"
        );


    if (!network || !train) {

        console.log(
            "Rail network or train element not found."
        );

        return;

    }


    const stations =
        network.querySelectorAll(
            ".network-station"
        );


    /* =====================================
       NORMALIZE STATION NAMES
    ===================================== */

    function normalizeStation(value) {

        return String(value || "")

            .toUpperCase()

            .replace(
                /\bJUNCTION\b/g,
                ""
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


    const normalizedCurrent =
        normalizeStation(
            currentStation
        );


    const normalizedNext =
        normalizeStation(
            nextStation
        );


    let currentElement =
        null;


    let nextElement =
        null;


    /* =====================================
       FIND CURRENT AND NEXT STATIONS
    ===================================== */

    stations.forEach(station => {


        const stationCode =
            normalizeStation(
                station.dataset.code
            );


        const stationName =
            normalizeStation(
                station.innerText
            );


        /* CURRENT STATION */

        if (

            stationCode ===
            normalizedCurrent ||

            stationName ===
            normalizedCurrent ||

            stationName.includes(
                normalizedCurrent
            ) ||

            normalizedCurrent.includes(
                stationName
            )

        ) {

            currentElement =
                station;

        }


        /* NEXT STATION */

        if (

            stationCode ===
            normalizedNext ||

            stationName ===
            normalizedNext ||

            stationName.includes(
                normalizedNext
            ) ||

            normalizedNext.includes(
                stationName
            )

        ) {

            nextElement =
                station;

        }


    });


    /* =====================================
       CURRENT STATION NOT FOUND
    ===================================== */

    if (!currentElement) {

        console.log(
            "Current station not found:",
            currentStation
        );

        return;

    }


    /* =====================================
       GET NETWORK POSITION
    ===================================== */

    const networkRect =
        network.getBoundingClientRect();


    const currentRect =
        currentElement.getBoundingClientRect();


    const startPosition =

        currentRect.top

        -

        networkRect.top

        +

        (
            currentRect.height / 2
        );


    let endPosition =
        startPosition;


    /* =====================================
       NEXT STATION POSITION
    ===================================== */

    if (nextElement) {


        const nextRect =
            nextElement.getBoundingClientRect();


        endPosition =

            nextRect.top

            -

            networkRect.top

            +

            (
                nextRect.height / 2
            );


    }


    /* =====================================
       KEEP PROGRESS BETWEEN 0 AND 1
    ===================================== */

    sectionProgress =

        Math.max(

            0,

            Math.min(

                1,

                sectionProgress

            )

        );


    /* =====================================
       CALCULATE LIVE TRAIN POSITION
    ===================================== */

    const trainPosition =

        startPosition

        +

        (

            endPosition

            -

            startPosition

        )

        *

        sectionProgress;


    /* =====================================
       MOVE TRAIN
    ===================================== */

    train.style.top =
        `${trainPosition}px`;


    console.log(

        "Train moved to:",

        currentStation,

        "→",

        nextStation,

        "| Progress:",

        sectionProgress

    );

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
