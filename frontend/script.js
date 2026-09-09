/* =========================================
   RAILFORECAST
   COMPLETE JAVASCRIPT
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
            "Passed"

    },


    {

        station:
            "Mangalagiri",

        code:
            "MGL",

        scheduled:
            "12:30 PM",

        predicted:
            "12:42 PM",

        delay:
            12,

        status:
            "Passed"

    },


    {

        station:
            "Vijayawada Junction",

        code:
            "BZA",

        scheduled:
            "1:15 PM",

        predicted:
            "1:28 PM",

        delay:
            13,

        status:
            "Passed"

    },


    {

        station:
            "Khammam",

        code:
            "KMM",

        scheduled:
            "1:30 PM",

        predicted:
            "1:42 PM",

        delay:
            12,

        status:
            "Current"

    },


    {

        station:
            "Dornakal Junction",

        code:
            "DKJ",

        scheduled:
            "2:05 PM",

        predicted:
            "2:17 PM",

        delay:
            12,

        status:
            "Upcoming"

    },


    {

        station:
            "Mahbubabad",

        code:
            "MABD",

        scheduled:
            "2:40 PM",

        predicted:
            "2:54 PM",

        delay:
            14,

        status:
            "Upcoming"

    },


    {

        station:
            "Nekonda",

        code:
            "NKD",

        scheduled:
            "3:10 PM",

        predicted:
            "3:26 PM",

        delay:
            16,

        status:
            "Upcoming"

    },


    {

        station:
            "Warangal Junction",

        code:
            "WL",

        scheduled:
            "3:50 PM",

        predicted:
            "4:06 PM",

        delay:
            16,

        status:
            "Upcoming"

    },


    {

        station:
            "Kazipet Junction",

        code:
            "KZJ",

        scheduled:
            "4:30 PM",

        predicted:
            "4:47 PM",

        delay:
            17,

        status:
            "Upcoming"

    },


    {

        station:
            "Jangaon",

        code:
            "ZN",

        scheduled:
            "5:15 PM",

        predicted:
            "5:34 PM",

        delay:
            19,

        status:
            "Upcoming"

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
            "Upcoming"

    },


    {

        station:
            "Bhongir",

        code:
            "BG",

        scheduled:
            "6:20 PM",

        predicted:
            "6:45 PM",

        delay:
            25,

        status:
            "Upcoming"

    },


    {

        station:
            "Charlapalli",

        code:
            "CHZ",

        scheduled:
            "6:45 PM",

        predicted:
            "7:12 PM",

        delay:
            27,

        status:
            "Upcoming"

    },


    {

        station:
            "Secunderabad Junction",

        code:
            "SC",

        scheduled:
            "7:10 PM",

        predicted:
            "7:42 PM",

        delay:
            32,

        status:
            "Destination"

    }

];


/* =========================================
   SIMULATION FEATURE DEFINITIONS
========================================= */

const simulationFeatures = {


    /* =====================================
       SIGNAL
    ===================================== */

    signal: {

        title:
            "Signal Point Simulation",

        description:
            "Configure a signal malfunction or signal-related operational delay.",

        fields: [

            {

                id:
                    "sim-train",

                label:
                    "Train Number",

                type:
                    "text",

                value:
                    "12705"

            },


            {

                id:
                    "sim-section",

                label:
                    "Affected Section",

                type:
                    "select",

                options: [

                    "Vijayawada → Madhira",

                    "Madhira → Khammam",

                    "Khammam → Dornakal",

                    "Warangal → Kazipet"

                ]

            },


            {

                id:
                    "signal-status",

                label:
                    "Signal Condition",

                type:
                    "select",

                options: [

                    "Red Signal Hold",

                    "Signal Failure",

                    "Signal Communication Failure",

                    "Temporary Signal Hold"

                ]

            },


            {

                id:
                    "signal-delay",

                label:
                    "Expected Signal Delay (minutes)",

                type:
                    "number",

                value:
                    "15"

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
            "Configure congestion caused by heavy railway traffic.",

        fields: [

            {

                id:
                    "sim-train",

                label:
                    "Train Number",

                type:
                    "text",

                value:
                    "12705"

            },


            {

                id:
                    "sim-section",

                label:
                    "Congested Section",

                type:
                    "select",

                options: [

                    "Vijayawada → Madhira",

                    "Madhira → Khammam",

                    "Khammam → Dornakal",

                    "Warangal → Kazipet"

                ]

            },


            {

                id:
                    "traffic-level",

                label:
                    "Traffic Density",

                type:
                    "select",

                options: [

                    "Moderate",

                    "High",

                    "Severe"

                ]

            },


            {

                id:
                    "trains-count",

                label:
                    "Number of Trains Ahead",

                type:
                    "number",

                value:
                    "3"

            }

        ]

    },


    /* =====================================
       PRECEDING TRAIN
    ===================================== */

    preceding: {

        title:
            "Preceding Train Delay Simulation",

        description:
            "Analyze delay propagation from a preceding train.",

        fields: [

            {

                id:
                    "sim-train",

                label:
                    "Your Train Number",

                type:
                    "text",

                value:
                    "12705"

            },


            {

                id:
                    "preceding-train",

                label:
                    "Preceding Train Number",

                type:
                    "text",

                value:
                    "12706"

            },


            {

                id:
                    "sim-section",

                label:
                    "Affected Section",

                type:
                    "select",

                options: [

                    "Vijayawada → Madhira",

                    "Madhira → Khammam",

                    "Khammam → Dornakal",

                    "Warangal → Kazipet"

                ]

            },


            {

                id:
                    "preceding-delay",

                label:
                    "Preceding Train Delay (minutes)",

                type:
                    "number",

                value:
                    "20"

            }

        ]

    },


    /* =====================================
       SPEED RESTRICTION
    ===================================== */

    speed: {

        title:
            "Temporary Speed Restriction Simulation",

        description:
            "Calculate ETA impact caused by temporary speed restrictions.",

        fields: [

            {

                id:
                    "sim-train",

                label:
                    "Train Number",

                type:
                    "text",

                value:
                    "12705"

            },


            {

                id:
                    "sim-section",

                label:
                    "Restricted Section",

                type:
                    "select",

                options: [

                    "Vijayawada → Madhira",

                    "Madhira → Khammam",

                    "Khammam → Dornakal",

                    "Warangal → Kazipet"

                ]

            },


            {

                id:
                    "normal-speed",

                label:
                    "Normal Speed (km/h)",

                type:
                    "number",

                value:
                    "110"

            },


            {

                id:
                    "restricted-speed",

                label:
                    "Restricted Speed (km/h)",

                type:
                    "number",

                value:
                    "50"

            },


            {

                id:
                    "restriction-distance",

                label:
                    "Restricted Distance (km)",

                type:
                    "number",

                value:
                    "15"

            }

        ]

    },


    /* =====================================
       MAINTENANCE
    ===================================== */

    maintenance: {

        title:
            "Unscheduled Maintenance Block Simulation",

        description:
            "Simulate emergency maintenance and infrastructure blocks.",

        fields: [

            {

                id:
                    "sim-train",

                label:
                    "Train Number",

                type:
                    "text",

                value:
                    "12705"

            },


            {

                id:
                    "sim-section",

                label:
                    "Maintenance Section",

                type:
                    "select",

                options: [

                    "Vijayawada → Madhira",

                    "Madhira → Khammam",

                    "Khammam → Dornakal",

                    "Warangal → Kazipet"

                ]

            },


            {

                id:
                    "maintenance-type",

                label:
                    "Maintenance Type",

                type:
                    "select",

                options: [

                    "Track Repair",

                    "Track Inspection",

                    "Emergency Repair",

                    "Equipment Repair",

                    "Maintenance Block"

                ]

            },


            {

                id:
                    "maintenance-duration",

                label:
                    "Block Duration (minutes)",

                type:
                    "number",

                value:
                    "30"

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
            "Simulate operational delays caused by level crossings.",

        fields: [

            {

                id:
                    "sim-train",

                label:
                    "Train Number",

                type:
                    "text",

                value:
                    "12705"

            },


            {

                id:
                    "sim-section",

                label:
                    "Level Crossing Section",

                type:
                    "select",

                options: [

                    "Vijayawada → Madhira",

                    "Madhira → Khammam",

                    "Khammam → Dornakal",

                    "Warangal → Kazipet"

                ]

            },


            {

                id:
                    "crossing-status",

                label:
                    "Gate Condition",

                type:
                    "select",

                options: [

                    "Normal Operation",

                    "Gate Opening Delay",

                    "Gate Malfunction",

                    "Road Traffic Congestion"

                ]

            },


            {

                id:
                    "crossing-delay",

                label:
                    "Expected Crossing Delay (minutes)",

                type:
                    "number",

                value:
                    "10"

            }

        ]

    },


    /* =====================================
       BOTTLENECK
    ===================================== */

    bottleneck: {

        title:
            "Operational Bottleneck Simulation",

        description:
            "Simulate railway junction congestion and capacity limitations.",

        fields: [

            {

                id:
                    "sim-train",

                label:
                    "Train Number",

                type:
                    "text",

                value:
                    "12705"

            },


            {

                id:
                    "junction",

                label:
                    "Affected Junction",

                type:
                    "select",

                options: [

                    "Vijayawada Junction",

                    "Khammam Junction",

                    "Warangal Junction",

                    "Kazipet Junction"

                ]

            },


            {

                id:
                    "capacity",

                label:
                    "Available Route Capacity (%)",

                type:
                    "number",

                value:
                    "60"

            },


            {

                id:
                    "queue-trains",

                label:
                    "Number of Trains Waiting",

                type:
                    "number",

                value:
                    "4"

            }

        ]

    }

};


/* =========================================
   PAGE NAVIGATION
========================================= */

function hideAllScreens() {


    const screens =
        document.querySelectorAll(
            ".screen"
        );


    screens.forEach(

        screen => {

            screen.classList.add(
                "hide"
            );

        }

    );


}


function home() {


    hideAllScreens();


    document
        .getElementById(
            "home"
        )
        .classList
        .remove(
            "hide"
        );


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    );


}


function passenger() {


    hideAllScreens();


    document
        .getElementById(
            "passenger"
        )
        .classList
        .remove(
            "hide"
        );


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    );


}


function department() {


    hideAllScreens();


    document
        .getElementById(
            "department"
        )
        .classList
        .remove(
            "hide"
        );


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    );


}


function simulation() {


    hideAllScreens();


    document
        .getElementById(
            "simulation"
        )
        .classList
        .remove(
            "hide"
        );


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    );


}


function authorizedAPI() {


    hideAllScreens();


    document
        .getElementById(
            "authorized-api"
        )
        .classList
        .remove(
            "hide"
        );


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    );


}


/* =========================================
   PASSENGER FORECAST
========================================= */

function forecast() {


    const trainInput =
        document.getElementById(
            "train"
        );


    const trainNumber =
        trainInput.value
            .trim();


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


    /*
    RESET ERROR
    */

    error.classList.add(
        "hide"
    );


    error.textContent =
        "";


    /*
    VALIDATE TRAIN
    */

    if (
        trainNumber === ""
    ) {


        error.textContent =
            "Please enter a train number.";


        error.classList.remove(
            "hide"
        );


        return;

    }


    /*
    SHOW LOADING
    */

    result.classList.add(
        "hide"
    );


    loading.classList.remove(
        "hide"
    );


    /*
    SIMULATE DATA LOADING
    */

    setTimeout(

        () => {


            loading.classList.add(
                "hide"
            );


            result.classList.remove(
                "hide"
            );


            updateTrainStatus();


            updateJourney();


            renderForecastTimeline();


            renderImpacts();


            renderAccuracyChart();


            updateSelectedTrain();


            result.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });


        },

        1200

    );


}


/* =========================================
   UPDATE TRAIN STATUS
========================================= */

function updateTrainStatus() {


    document.getElementById(
        "title"
    ).textContent =

        `Train ${trainData.number} • ${trainData.name}`;


    document.getElementById(
        "route"
    ).textContent =

        trainData.route;


    document.getElementById(
        "cur"
    ).textContent =

        trainData.currentStation;


    document.getElementById(
        "delay"
    ).textContent =

        `+${trainData.currentDelay} min`;


    document.getElementById(
        "next"
    ).textContent =

        trainData.nextStation;


    document.getElementById(
        "updated"
    ).textContent =

        trainData.updated;


}


/* =========================================
   JOURNEY PROGRESS
========================================= */

function updateJourney() {


    const progress =
        trainData.progress;


    document.getElementById(
        "journey-percent"
    ).textContent =

        `${progress}%`;


    document.getElementById(
        "journey-from"
    ).textContent =

        trainData.from;


    document.getElementById(
        "journey-to"
    ).textContent =

        trainData.to;


    document.getElementById(
        "journey-progress"
    ).style.width =

        `${progress}%`;


    document.getElementById(
        "progress-marker"
    ).style.left =

        `${progress}%`;


    document.getElementById(
        "journey-status"
    ).textContent =

        `Your train is currently near ${trainData.currentStation}. ${progress}% of the journey has been completed.`;


}


/* =========================================
   UPDATE SELECTED NETWORK TRAIN
========================================= */

function updateSelectedTrain() {


    const selectedTrain =
        document.getElementById(
            "selected-network-train"
        );


    if (
        selectedTrain
    ) {


        selectedTrain.style.display =
            "block";

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

            (
                sum,
                item
            ) =>

                sum +
                item.impact,

            0

        );


    totalImpact.textContent =
        `+${total} min`;


    summary.innerHTML =
        `

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


    events.innerHTML =
        "";


    impactData.forEach(

        item => {


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "event-item";


            element.innerHTML =
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

function renderForecastTimeline() {


    const timeline =
        document.getElementById(
            "timeline"
        );


    timeline.innerHTML =
        "";


    stationForecast.forEach(

        station => {


            let delayClass =
                "delay-good";


            if (
                station.delay >=
                10
            ) {


                delayClass =
                    "delay-mid";

            }


            if (
                station.delay >=
                20
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


            if (
                station.status ===
                "Destination"
            ) {


                statusClass =
                    "status-good";

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


            row.innerHTML =
                `

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


            timeline.appendChild(
                row
            );


        }

    );


}


/* =========================================
   ACCURACY CHART
========================================= */

function renderAccuracyChart() {


    const canvas =
        document.getElementById(
            "accuracyChart"
        );


    if (
        !canvas
    ) {

        return;

    }


    if (
        accuracyChart
    ) {


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
                                "Mean Absolute Error (Minutes)",

                            data: [

                                5.74,

                                3.48

                            ],


                            backgroundColor: [

                                "rgba(242,184,75,0.7)",

                                "rgba(79,124,255,0.8)"

                            ],


                            borderColor: [

                                "#f2b84b",

                                "#4f7cff"

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

                            backgroundColor:
                                "#101d2e"

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


    if (
        !feature
    ) {

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


    const formContainer =
        config.querySelector(
            ".simulation-form-grid"
        );


    const result =
        document.getElementById(
            "simulation-result"
        );


    /*
    UPDATE TITLE
    */

    title.textContent =
        feature.title;


    /*
    CLEAR OLD INPUTS
    */

    formContainer.innerHTML =
        "";


    /*
    HIDE OLD RESULT
    */

    result.classList.add(
        "hide"
    );


    result.innerHTML =
        "";


    /*
    CREATE NEW FEATURE INPUTS
    */

    feature.fields.forEach(

        field => {


            const wrapper =
                document.createElement(
                    "div"
                );


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


            /*
            SELECT
            */

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


            /*
            NORMAL INPUT
            */

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


    /*
    SHOW CONFIGURATION
    */

    config.classList.remove(
        "hide"
    );


    /*
    SCROLL TO FORM
    */

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
   RUN SIMULATION
========================================= */

function runSimulation() {


    if (
        !currentSimulation
    ) {


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


    let impact =
        0;


    let explanation =
        "";


    let affectedSection =
        "";


    /*
    =====================================
    SIGNAL SIMULATION
    =====================================
    */

    if (
        currentSimulation ===
        "signal"
    ) {


        const delay =
            Number(

                document.getElementById(
                    "signal-delay"
                ).value

            );


        const condition =
            document.getElementById(
                "signal-status"
            ).value;


        affectedSection =
            document.getElementById(
                "sim-section"
            ).value;


        impact =
            delay;


        if (
            condition ===
            "Signal Failure"
        ) {


            impact =
                Math.round(
                    delay * 1.3
                );

        }


        explanation =
            `${condition} is affecting train movement in the selected railway section.`;


    }


    /*
    =====================================
    CONGESTION SIMULATION
    =====================================
    */

    else if (
        currentSimulation ===
        "congestion"
    ) {


        const traffic =
            document.getElementById(
                "traffic-level"
            ).value;


        const trains =
            Number(

                document.getElementById(
                    "trains-count"
                ).value

            );


        affectedSection =
            document.getElementById(
                "sim-section"
            ).value;


        let trafficImpact =
            10;


        if (
            traffic ===
            "High"
        ) {


            trafficImpact =
                20;

        }


        if (
            traffic ===
            "Severe"
        ) {


            trafficImpact =
                35;

        }


        impact =
            trafficImpact +
            trains * 3;


        explanation =
            `${trains} trains ahead are causing ${traffic.toLowerCase()} railway congestion.`;


    }


    /*
    =====================================
    PRECEDING TRAIN SIMULATION
    =====================================
    */

    else if (
        currentSimulation ===
        "preceding"
    ) {


        const precedingTrain =
            document.getElementById(
                "preceding-train"
            ).value;


        const precedingDelay =
            Number(

                document.getElementById(
                    "preceding-delay"
                ).value

            );


        affectedSection =
            document.getElementById(
                "sim-section"
            ).value;


        /*
        DELAY PROPAGATION
        */

        impact =
            Math.round(

                precedingDelay *
                0.65

            );


        explanation =
            `Delay propagation from Train ${precedingTrain} is reducing route availability for your train.`;


    }


    /*
    =====================================
    SPEED RESTRICTION SIMULATION
    =====================================
    */

    else if (
        currentSimulation ===
        "speed"
    ) {


        const normalSpeed =
            Number(

                document.getElementById(
                    "normal-speed"
                ).value

            );


        const restrictedSpeed =
            Number(

                document.getElementById(
                    "restricted-speed"
                ).value

            );


        const distance =
            Number(

                document.getElementById(
                    "restriction-distance"
                ).value

            );


        affectedSection =
            document.getElementById(
                "sim-section"
            ).value;


        if (
            restrictedSpeed <=
            0
        ) {


            alert(
                "Restricted speed must be greater than zero."
            );


            return;

        }


        const normalTime =
            (
                distance /
                normalSpeed
            )
            *
            60;


        const restrictedTime =
            (
                distance /
                restrictedSpeed
            )
            *
            60;


        impact =
            Math.round(

                restrictedTime -
                normalTime

            );


        explanation =
            `Speed reduced from ${normalSpeed} km/h to ${restrictedSpeed} km/h over ${distance} km.`;


    }


    /*
    =====================================
    MAINTENANCE SIMULATION
    =====================================
    */

    else if (
        currentSimulation ===
        "maintenance"
    ) {


        const duration =
            Number(

                document.getElementById(
                    "maintenance-duration"
                ).value

            );


        const maintenanceType =
            document.getElementById(
                "maintenance-type"
            ).value;


        affectedSection =
            document.getElementById(
                "sim-section"
            ).value;


        /*
        MAINTENANCE IMPACT
        */

        impact =
            Math.round(

                duration *
                0.8

            );


        if (
            maintenanceType ===
            "Emergency Repair"
        ) {


            impact =
                Math.round(

                    duration *
                    1.1

                );

        }


        explanation =
            `${maintenanceType} is temporarily reducing railway section availability.`;


    }


    /*
    =====================================
    LEVEL CROSSING SIMULATION
    =====================================
    */

    else if (
        currentSimulation ===
        "crossing"
    ) {


        const crossingDelay =
            Number(

                document.getElementById(
                    "crossing-delay"
                ).value

            );


        const status =
            document.getElementById(
                "crossing-status"
            ).value;


        affectedSection =
            document.getElementById(
                "sim-section"
            ).value;


        let multiplier =
            1;


        if (
            status ===
            "Gate Malfunction"
        ) {


            multiplier =
                1.5;

        }


        if (
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
            `${status} is increasing operational waiting time at the level crossing.`;


    }


    /*
    =====================================
    BOTTLENECK SIMULATION
    =====================================
    */

    else if (
        currentSimulation ===
        "bottleneck"
    ) {


        const capacity =
            Number(

                document.getElementById(
                    "capacity"
                ).value

            );


        const trains =
            Number(

                document.getElementById(
                    "queue-trains"
                ).value

            );


        affectedSection =
            document.getElementById(
                "junction"
            ).value;


        const capacityImpact =
            (
                100 -
                capacity
            )
            *
            0.5;


        const trainImpact =
            trains *
            4;


        impact =
            Math.round(

                capacityImpact +
                trainImpact

            );


        explanation =
            `Route capacity at ${affectedSection} is reduced to ${capacity}% with ${trains} trains waiting.`;


    }


    /*
    PREVENT NEGATIVE DELAY
    */

    impact =
        Math.max(

            0,

            impact

        );


    /*
    CALCULATE UPDATED ETA
    */

    const currentDelay =
        trainData.currentDelay;


    const updatedDelay =
        currentDelay +
        impact;


    /*
    SHOW RESULT
    */

    result.classList.remove(
        "hide"
    );


    result.innerHTML =
        `

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

                    UPDATED TRAIN DELAY

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

                This disruption impact can be passed to
                the RailForecast Dynamic ETA Engine
                together with live train movement,
                historical section delay patterns,
                real-time operational corrections
                and Random Forest predictions.

            </p>

        </div>

        `;


    setTimeout(

        () => {


            result.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

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
        document.getElementById(
            "simulation-config"
        );


    const result =
        document.getElementById(
            "simulation-result"
        );


    config.classList.add(
        "hide"
    );


    result.classList.add(
        "hide"
    );


    result.innerHTML =
        "";


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


    /*
    VALIDATE ENDPOINT
    */

    if (
        endpoint.value
            .trim() ===
        ""
    ) {


        alert(
            "Please enter an API endpoint."
        );


        return;

    }


    /*
    VALIDATE API KEY
    */

    if (
        apiKey.value
            .trim() ===
        ""
    ) {


        alert(
            "Please enter an authorized API key."
        );


        return;

    }


    /*
    SHOW CONNECTING
    */

    status.textContent =
        "Connecting...";


    status.style.color =
        "#f2b84b";


    /*
    SIMULATE CONNECTION
    */

    setTimeout(

        () => {


            status.textContent =
                "Connected";


            status.style.color =
                "#34c77b";


            alert(

                `${capitalize(type)} API connected successfully in prototype mode.`

            );


        },

        1000

    );


}


/* =========================================
   CAPITALIZE FUNCTION
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
   ENTER KEY TRAIN SEARCH
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        const trainInput =
            document.getElementById(
                "train"
            );


        if (
            trainInput
        ) {


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


        /*
        SET DEFAULT DATE
        */

        const dateInput =
            document.getElementById(
                "date"
            );


        if (
            dateInput
        ) {


            const today =
                new Date();


            const year =
                today.getFullYear();


            const month =
                String(

                    today.getMonth() +
                    1

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


    }

);
