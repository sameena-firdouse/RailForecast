RailForecast 🚆
Smarter Journeys. On Time.
RailForecast is a railway arrival-time prediction project designed to estimate train delays dynamically and provide passengers with clearer, updated arrival-time information.

Instead of treating a train journey as one single block, RailForecast considers historical section-level behaviour, the train's current delay, and railway operating conditions. Its prediction pipeline uses a Random Forest model and then accounts for real-time conditions and unexpected events to produce a dynamic ETA.
Project status: This repository contains the RailForecast prototype and its documented system design. Railway-authorized API connections and passenger notification channels should be treated as integrations only where they have actually been implemented and tested.

📌 The Problem
Train arrival times can change during a journey. A delay at one point may continue into later sections, while another section may allow the train to recover some time. Operational conditions can also affect the journey, including:
- Signal halts
- Congestion on busy routes
- Delays caused by preceding trains
- Level-crossing gate closures
- Operational bottlenecks
- Temporary speed restrictions
- Unscheduled maintenance blocks
A single static ETA may not reflect these changing conditions. Passengers can therefore find it difficult to understand whether a train is likely to arrive later than expected, recover time, or experience a new delay.
Why this matters
Passengers need arrival-time information that can be updated as journey conditions change. More useful ETA estimates can help passengers plan station arrival, connections, pickups, and onward travel.
💡 Our Solution
RailForecast is designed to estimate and update a train's expected arrival time using a structured prediction pipeline:
1. Learn from historical data: Calculate section-level running-time and delay patterns.
2. Predict with machine learning: Use historical section metrics and current delay as inputs to a Random Forest model.
3. Account for operating conditions: Consider expected conditions such as signal halts, congestion, preceding-train delays, level crossings, and operational bottlenecks.
4. Handle unexpected events separately: Add the estimated impact of events such as temporary speed restrictions and unscheduled maintenance blocks.
5. Update the ETA: Process the adjusted delay and produce a final dynamic ETA.
The objective is not simply to display the current delay. It is to estimate how that delay may change over the remaining journey.
🧭 System Architecture

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/ef857cd7-3a68-4daf-93b0-5eb144e8071a" />

The main screen is divided into two distinct areas:
- Passenger: Displays train location, current delay, and delay-related information. This is the passenger-facing information section.
- Railway Department: Contains the simulation module and the railway-authorized API pathway. These are the two input pathways shown feeding the standardized ETA calculation.
The passenger display is separate from the ETA calculation flow in this architecture.

Architecture walkthrough
Passenger section
- Train location
- Current delay
- Delay factors
- Operational restrictions: signal halts, level-crossing gates, and operational bottlenecks
- Traffic conditions: congestion on busy routes and delays in preceding trains
- Infrastructure disruptions: temporary speed restrictions, unscheduled maintenance blocks, and weather
Railway Department — Simulation
- Signal halts
- Congestion on busy routes
- Delays in preceding trains
- Temporary speed restrictions
- Unscheduled maintenance blocks
- Level-crossing gates
- Operational bottlenecks
These conditions can be represented through simulation input parameters to demonstrate how changing railway conditions may affect ETA.

Railway-authorized API pathway
- Telemetry API
- Asset API
- Alert API
In the proposed API pathway, data from the APIs is collected as raw API data and passed through an API Mapper / Processor before reaching standardized ETA calculation. Actual availability and access depend on authorized data-provider integrations.

ETA output
- Standardized ETA Calculation
- ETA Processing Engine
- Updated ETA
🔬 Dynamic ETA Calculation Pipeline
The following diagram explains how the prediction stage and condition-adjustment stages work together.

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/503e3661-6eae-42ce-8a59-8751af824fdb" />

Step-by-step pipeline
1. Historical data

Historical train-running records are used to calculate section-level metrics, including:
- Average section running time
- Average section delay
- Average delay change
- Average recovery
- Recovery rate
- Delay increase rate
2. Current delay

The train's current delay is considered alongside the historical section metrics.

3. Random Forest ETA

The Random Forest model uses the historical metrics and current delay to estimate the net delay change (delay and recovery).

4. Separate condition handling

The estimated net delay change is considered through two pathways:
- Real-time expected conditions: Signal halts, congestion on busy routes, delays in preceding trains, level-crossing gates, and operational bottlenecks are handled by the Real-Time Correction Layer. The layer compares current abnormal conditions with normal expected conditions. A unified ETA and duplicate check follows.
- Unexpected events: Temporary speed restrictions and unscheduled maintenance blocks are treated separately in the illustrated pipeline, with their estimated ETA impact added separately.
5. Final dynamic ETA

The pathways are combined into the updated ETA prediction delay, which is passed to the final dynamic ETA output.
🧪 Example Scenario: How RailForecast Helps
The following is an illustrative example to explain the approach; the values are hypothetical and are not a live train prediction.

Imagine a train is currently running 12 minutes late.
1. Historical section data indicates that this part of the route usually allows the train to recover around 3 minutes.
2. The Random Forest model uses the historical section metrics and current delay to estimate the likely net delay change.
3. A signal halt and congestion are detected or selected in the simulation. The Real-Time Correction Layer considers their impact relative to normal expected conditions.
4. Later, an unexpected temporary speed restriction is introduced. Its estimated impact is added separately, as shown in the pipeline.
5. The ETA Processing Engine processes the adjusted result and produces an updated arrival-time estimate.
For illustration only, suppose the final calculation estimates that the train will arrive 18 minutes late rather than the original 12 minutes late. The passenger-facing information can then show the updated delay and ETA, helping passengers understand that the expected arrival time has changed.
Example condition table
Condition	How it may affect the journey
Signal halt	Adds waiting time
Busy-route congestion	May increase section running time
Preceding-train delay	May affect the train's movement
Level-crossing gate	May introduce a stoppage
Operational bottleneck	May slow movement through a constrained section
Temporary speed restriction	May increase running time unexpectedly
Maintenance block	May cause a disruption or additional delay
Recovery opportunity	May reduce some accumulated delay


🗺️ Section-Wise Prediction
RailForecast's approach considers that different sections of a route can have different delay and recovery patterns.

For example, one section may experience congestion, another may allow time recovery, and a later section may be affected by a signal halt. Section-level analysis helps avoid assuming that the same delay behaviour applies to the entire route.

The prototype can represent a route as a sequence of station-to-station sections and evaluate the relevant historical running-time and delay metrics for each section.
📊 Model Evaluation
In the current RailForecast V2 evaluation, the reported results are:
Metric	RailForecast V2	Baseline
MAE	3.48	5.74
RMSE	5.58	8.14


Reported MAE improvement over baseline: approximately 39.36%.
- MAE (Mean Absolute Error): The average absolute difference between predicted and actual values. Lower is better.
- RMSE (Root Mean Squared Error): Measures prediction error while giving larger errors more weight. Lower is better.
These are the project's reported evaluation results. They should be interpreted in the context of the dataset, test split, and target unit used in the experiment.
✨ Key Features and Design Goals
- Section-wise railway delay analysis
- Historical running-time and delay metrics
- Random Forest-based ETA prediction
- Consideration of current train delay
- Real-time expected-condition correction pathway
- Separate handling of unexpected events
- Simulation mode for demonstrating changing railway conditions when live data is unavailable
- Standardized ETA calculation and updated ETA output
- Passenger-facing display of train location, delay, and delay factors
- Architecture designed to support authorized railway data integrations
🔭 Future Scope
- Integrate verified, authorized live railway data sources.
- Validate predictions across more trains, routes, and operating conditions.
- Improve event detection and delay-impact estimation.
- Add passenger notifications through website, SMS, or mobile app integrations.
- Provide clearer explanations of why an ETA changed.
- Monitor model performance as new journey data becomes available.
🛠️ Technology
The project uses a machine-learning-based prediction approach with a Random Forest model. Refer to the source code and project configuration in this repository for the exact implementation languages, libraries, and deployment setup.
▶️ Running the Project
1. Clone this repository.
2. Open the project folder.
3. Follow the setup and run instructions provided in the source-code folders or project configuration.
4. Use the prototype's available inputs or simulation mode to explore ETA changes.
Add exact installation commands here if they are part of your current implementation. Avoid listing unverified dependencies or claiming API integrations that are not configured.

⚠️ Data and Integration Notes
- Simulation inputs demonstrate possible railway conditions; they are not proof that a real event is occurring.
- Railway-authorized APIs require valid access and provider approval.
- The architecture diagram describes the intended data flow. Only describe an API, alert, or live-data feature as operational if it is implemented and verified.
- Example delays in this README are illustrative and must not be treated as actual train running information.
👥 Project
RailForecast — Smarter Journeys. On Time.

A project focused on improving train ETA estimation through historical section-level analysis, machine learning, and dynamic delay adjustment.
