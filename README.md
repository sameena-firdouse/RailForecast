🎯 The Real-World Problem
A railway timetable provides a scheduled arrival time.
But actual train journeys can be affected by:
- ⏱️ Existing delays
- 🚦 Signal-related halts
- 🚆 Congestion
- 🛤️ Section bottlenecks
- 🔧 Maintenance and operational restrictions
- 🔄 Delay propagation from previous sections
- 📊 Historical delay patterns
- ⚠️ Unexpected operational conditions
Therefore:
Scheduled ETA
      ≠
Actual ETA

More importantly:
Current Delay
      ≠
Final Arrival Delay

A train that is currently 15 minutes late may not remain exactly 15 minutes late throughout the rest of its journey.
It may:
15 min late
     ↓
18 min late
     ↓
16 min late
     ↓
12 min late
     ↓
14 min late

depending on what happens across different railway sections.
💡 RailForecast's Solution
RailForecast divides a train's journey into sections and predicts how the delay may evolve from one section to the next.
Traditional approach
Scheduled Arrival
       +
Current Delay
       ↓
Estimated Arrival

RailForecast approach
                 Historical Data
                       │
                       ▼
              Section Delay Patterns
                       │
                       ▼
Current / Live ──► Feature Engineering
Conditions              │
                       ▼
                 Random Forest
                  ML Prediction
                       │
                       ▼
              Section Delay Forecast
                       │
                       ▼
             Sequential Propagation
                       │
                       ▼
                 Updated ETA
                       │
                       ▼
              Delay Explanation
                       │
                       ▼
              Passenger Information

🌍 Why This Matters
Passengers often need more information than:
"Your train is currently 15 minutes late."

They want to know:
- When should I leave for the station?
- When is the train likely to reach my station?
- Is the delay increasing?
- Is the train recovering lost time?
- Should I expect additional delay?
- Will my connecting journey be affected?
- How long might I have to wait?
RailForecast is designed to provide a future-oriented ETA prediction rather than only reporting the current status.
⭐ Key Features
Feature	Description
🚆 Dynamic ETA	ETA changes as train conditions change
🤖 Random Forest ML	Predicts section-level delay behavior
📊 Historical Analysis	Learns from historical section delays
🗺️ Section-Wise Prediction	Predicts delay across individual route sections
🔄 Delay Propagation	Carries predicted delay through subsequent sections
🧪 Simulation Mode	Tests how different conditions affect ETA
📡 Live API Support	Can incorporate available live railway data
🧠 Delay Explanation	Shows factors contributing to ETA changes
📱 Passenger-Oriented Output	Converts predictions into understandable travel information
📈 Model Evaluation	Compares ML predictions against a baseline


🗺️ Section-Wise Railway Prediction
RailForecast does not treat the entire train route as one single block.
The route is divided into sections.
For the current prototype, an example route is:
GNT
 │
 ▼
MGL
 │
 ▼
BZA
 │
 ▼
MDR
 │
 ▼
KMT
 │
 ▼
DKJ
 │
 ▼
SC

Each section can have different delay characteristics.
For example:
┌──────────────┬─────────────────────────────┐
│ Section      │ Possible Behavior           │
├──────────────┼─────────────────────────────┤
│ GNT → MGL    │ Delay / recovery            │
│ MGL → BZA    │ Different delay pattern     │
│ BZA → MDR    │ Delay propagation           │
│ MDR → KMT    │ Potential recovery          │
│ KMT → DKJ    │ Variable delay              │
│ DKJ → SC     │ Final approach              │
└──────────────┴─────────────────────────────┘

The actual behavior is learned from the available historical data rather than being manually assumed.

Conceptually:
Current Delay
      +
Section Behavior
      +
Historical Delay Pattern
      ↓
Next Section Prediction
      ↓
Updated Delay
      ↓
Following Section

This allows ETA to evolve throughout the journey.
🤖 Machine Learning
RailForecast uses a Random Forest regression model for ETA/delay prediction.
The model learns relationships between historical railway behavior and delay.
Important features
The current model uses features such as:
departure_delay_min
historical_avg_delay_change
historical_delay_std
section_number
scheduled_running_time

The basic pipeline is:
Historical Railway Data
          ↓
Data Cleaning
          ↓
Feature Engineering
          ↓
Random Forest Training
          ↓
Delay Prediction
          ↓
ETA Calculation

📊 Historical Section-Delay Data
Historical railway data is used to understand how delay behaves across different sections.
For each section, the system can derive information such as:
- Average delay
- Delay variation
- Historical delay change
- Recovery behavior
- Scheduled running time
- Position of the section in the route
This allows RailForecast to distinguish between different railway sections.
For example:
Section A
5 → 6 → 5 → 4 → 6 minutes

Section B
5 → 18 → 3 → 22 → 9 minutes

Both sections could currently have a similar delay, but their historical behavior is different.
Therefore:
Current Condition
       +
Historical Section Behavior
       ↓
Different Future Prediction

🧮 How ETA Is Calculated
RailForecast combines the train's current state with predicted section behavior.
Conceptually:
Expected Arrival Time
=
Scheduled Arrival Time
+
Predicted Delay

For sequential sections:
Next Section ETA
=
Previous Section ETA
+
Expected Section Travel Time
+
Predicted Delay Adjustment

The prediction pipeline can be represented as:
Train Information
       ↓
Current Delay
       ↓
Historical Section Data
       ↓
Feature Engineering
       ↓
Random Forest Prediction
       ↓
Predicted Section Delay
       ↓
Delay Propagation
       ↓
Updated ETA

📡 Live Railway API Integration
RailForecast is designed to use live railway information when a supported railway API is connected.

When fresh railway information becomes available, the prediction pipeline can use the new condition and update the expected ETA.
Example
Initial Condition

Current delay = 8 minutes
        ↓
Predicted ETA = 08:38 PM

If a new condition indicates additional delay:
New railway condition
        ↓
Current delay = 14 minutes
        ↓
ML prediction updated
        ↓
Predicted ETA = 08:44 PM

The important concept is:
ETA is treated as a dynamic prediction rather than a fixed value.

Live prediction quality depends on the availability, freshness, accuracy, and fields provided by the connected railway API.

🧪 Simulation Mode
RailForecast can also simulate railway conditions.
This allows the system to demonstrate dynamic ETA changes even when live railway data is unavailable.
For example:
              Normal Condition
                     │
                     ▼
              Current Delay
                     │
                     ▼
                Prediction
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    Congestion   Signal Halt   Recovery
        │            │            │
        ▼            ▼            ▼
    Delay +       Delay +       Delay -
        │            │            │
        └────────────┼────────────┘
                     ▼
                Updated ETA

This provides a practical way to test:
- Delay increase
- Delay recovery
- Additional section delay
- Operational disruptions
- Different combinations of conditions
🧠 Explainable Delay Information
RailForecast is designed to answer two questions:
Question 1
What is the expected ETA?

Question 2
Why did the ETA change?

Instead of simply showing:
Train delayed by 17 minutes

the system can provide context such as:
Expected Arrival
08:47 PM

Estimated Delay
+17 minutes

Possible contributing factors

• Current train delay
• Historical section delay
• Delay propagation
• Section-specific behavior
• Simulated/live operational condition

The explanation is intended to make the prediction easier for passengers and evaluators to understand.


👤 Before the Journey
A passenger can select:
Train: 12705
From: GNT
To: SC

The system can then calculate the expected arrival behavior using available data.
Instead of only seeing:
Scheduled Arrival: 08:30 PM

the passenger could receive:
Expected Arrival: 08:47 PM

Estimated Delay: +17 min

Prediction influenced by:
• Current delay
• Historical section behavior
• Delay propagation

This can help passengers plan when to leave for the station.
🚉 During the Journey
As new railway information becomes available:
New Data
   ↓
Updated Condition
   ↓
Updated Prediction
   ↓
Updated ETA
   ↓
Passenger Information

The same prediction pipeline can therefore be used continuously throughout the journey.
🔔 Future Passenger Notifications
The prediction engine can eventually be connected to notification services.
                  RailForecast
                       │
                       ▼
                 ETA Prediction
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        Website        SMS       Mobile App
          │            │            │
          └────────────┼────────────┘
                       ▼
                 Passenger Alert

Example:
🚆 Train 12705

Your expected arrival at BZA
has changed.

Previous ETA: 08:35 PM
Updated ETA: 08:47 PM

Estimated additional delay: 12 min.

Notification delivery is a future expansion depending on available services.
🏗️ Complete System Architecture
<img width="1418" height="2258" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/c6aac87f-8a93-4009-9340-077fb2361569" />



🔬 Complete Prediction Pipeline
┌─────────────────────────────┐
│ Historical Railway Dataset  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Section-wise Data Analysis  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Feature Engineering         │
│                             │
│ • Current delay             │
│ • Historical delay change   │
│ • Delay variation           │
│ • Section number            │
│ • Running time              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Random Forest Model         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Predicted Section Delay     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Sequential Delay Propagation│
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Updated ETA                 │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐ ┌──────────────┐
│ Delay       │ │ Passenger    │
│ Explanation │ │ Information  │
└─────────────┘ └──────────────┘

📈 Model Performance
The current Random Forest V2 model was evaluated against a baseline approach on the evaluated test period.
Model	MAE	RMSE
Baseline	5.74 min	8.14 min
Random Forest V2	3.48 min	5.58 min


Improvement
The Random Forest V2 model achieved approximately:
39.36% MAE reduction
compared with the baseline on the evaluated test period.
Visual comparison
MAE — Lower is better

Baseline
5.74 min
████████████████████████████████

Random Forest V2
3.48 min
███████████████████

📐 Understanding the Metrics
MAE — Mean Absolute Error
MAE represents the average absolute difference between predicted and actual delay.
MAE = Average |Actual Delay - Predicted Delay|

A lower MAE means predictions are, on average, closer to the actual values.
RMSE — Root Mean Squared Error
RMSE gives more weight to larger prediction errors.
RMSE = √(Average(Prediction Error²))

A lower RMSE indicates fewer or smaller large prediction errors.
Important: Model performance depends on the dataset, route, time period, feature quality, and evaluation methodology. These results should not be interpreted as a guarantee of live-world prediction accuracy.

🧪 Example Dynamic Prediction
Suppose a train begins with:
Current delay = 10 minutes

Historical behavior indicates:
Section A → additional delay
Section B → moderate increase
Section C → recovery
Section D → additional delay

A conceptual progression may look like:
START
10 min delay
     │
     ▼
Section A
14 min
     │
     ▼
Section B
16 min
     │
     ▼
Section C
13 min
     │
     ▼
Section D
18 min

The key idea is:
The predicted delay can increase or decrease from section to section.

This is different from simply adding one fixed delay value to the entire journey.
🔍 Why Section-Level Prediction Matters
Consider two sections:
SECTION A

5 → 6 → 5 → 4 → 6 min


SECTION B

5 → 18 → 3 → 22 → 9 min

Both may have similar average behavior, but Section B has much higher variability.
Therefore, a prediction system should ideally consider:
Current Delay
      +
Section History
      +
Delay Variability
      +
Position in Journey

rather than applying one universal delay to every section.
🆚 Status vs Forecast
A major distinction in RailForecast is:
┌─────────────────────────────┐
│ CURRENT STATUS              │
│                             │
│ "Train is 15 min late."     │
└──────────────┬──────────────┘
               │
               │
               ▼
┌─────────────────────────────┐
│ FUTURE FORECAST             │
│                             │
│ "What could the ETA be at   │
│  the upcoming station?"     │
└─────────────────────────────┘

RailForecast focuses on the second problem.
🌐 Current Prototype
The current prototype demonstrates the prediction workflow using a selected train and its route sections.
The current implementation focuses on a single-train prediction scenario.
The architecture is designed to expand from:
Single Train
     ↓
Multiple Trains
     ↓
Multiple Routes
     ↓
Network-Level Prediction

📊 Current Prototype Data Flow
Train Selection
      ↓
Current Train Information
      ↓
Historical Section Data
      ↓
Feature Generation
      ↓
Random Forest V2
      ↓
Section Prediction
      ↓
Delay Propagation
      ↓
ETA
      ↓
Passenger Dashboard

🛠️ Technology Stack
Layer	Technology
Programming Language	Python
Machine Learning	Random Forest Regression
ML Framework	Scikit-learn
Data Processing	Pandas
Backend	Flask
Frontend	HTML
Styling	CSS
Client Logic	JavaScript
Data	Historical railway delay data
Live Integration	Railway API
Model Storage	Pickle
Visualization	JavaScript / Charting


📂 Project Structure
RailForecast/
│
├── backend/
│   ├── app.py
│   ├── random_forest_v2_eta_model.pkl
│   ├── major_section_history.csv
│   ├── .env.example
│   └── ...
│
├── frontend/
│   ├── ...
│
├── requirements.txt
│
├── README.md
│
└── ...

⚙️ Installation
1. Clone the repository
git clone https://github.com/sameena-firdouse/RailForecast.git
cd RailForecast

2. Create a virtual environment
Windows
python -m venv venv

Activate it:
venv\Scripts\activate

3. Install dependencies
pip install -r requirements.txt

4. Add the ML files
Make sure the following files are inside:
backend/

random_forest_v2_eta_model.pkl
major_section_history.csv

5. Configure environment variables
Copy:
backend/.env.example

to:
backend/.env

Then add the required API key.
Example:
RAILRADAR_API_KEY=your_api_key_here

Never commit real API keys or secrets to GitHub.

6. Start the backend
From the project root:
python backend/app.py

Then open:
http://127.0.0.1:5000

🔐 Security
API keys and credentials should never be stored directly in source code.
Use:
.env

and make sure it is included in:
.gitignore

Never upload:
API keys
Passwords
Private credentials
Secret tokens

to GitHub.
🧪 Testing Scenarios
RailForecast can be evaluated using different conditions.
Scenario 1 — Normal Operation
Current delay → Low
Historical behavior → Stable

             ↓

Expected result:
Relatively stable ETA

Scenario 2 — Increasing Delay
Current delay → High
Section condition → Delay increasing

             ↓

Expected result:
ETA moves later

Scenario 3 — Delay Recovery
Current delay → High
Historical section behavior → Recovery

             ↓

Expected result:
Predicted delay may decrease

Scenario 4 — Delay Propagation
Initial Delay
     ↓
Section 1
     ↓
Section 2
     ↓
Section 3
     ↓
Destination

The prediction can change as the train progresses through the route.

🧠 Core Innovation
The central idea behind RailForecast is:
Predict the delay where the passenger is going, not just report the delay where the train is now.

The difference can be visualized as:
              TRADITIONAL STATUS

                Train is here
                     │
                     ▼
              Current delay
                     │
                     ▼
                 Passenger


              RAILFORECAST

                Train is here
                     │
                     ▼
             Current condition
                     │
                     ▼
           Historical section data
                     │
                     ▼
              Machine Learning
                     │
                     ▼
            Delay propagation
                     │
                     ▼
              Future section
                     │
                     ▼
             Predicted ETA
                     │
                     ▼
                 Passenger

🌍 Real-World Impact
RailForecast aims to reduce uncertainty for railway passengers.
Potential benefits include:
👤 Passengers
Better information about expected arrival.
🚉 Stations
Potentially more informative passenger displays.
📱 Mobile Applications
Dynamic ETA information.
🔔 Notifications
Potential future alerts when ETA changes significantly.
🚌 Connecting Transport
Potential integration with buses, taxis, metro and other transport services.
🚆 Railway Analytics
Potential future analysis of section-level delay propagation.
🚀 Roadmap
Phase 1 — Current Prototype
- [x] Historical railway data
- [x] Section-wise delay analysis
- [x] Random Forest model
- [x] Feature engineering
- [x] Dynamic ETA logic
- [x] Sequential delay propagation
- [x] Simulation conditions
- [x] Single-train demonstration
- [x] Web interface
- [x] Model evaluation
Phase 2 — Real-Time Expansion
- [ ] More live railway API sources
- [ ] Multiple trains
- [ ] Multiple routes
- [ ] Continuous real-time updates
- [ ] Improved data validation
- [ ] More real-time operational features
Phase 3 — Passenger Platform
- [ ] Train search
- [ ] Destination-based ETA
- [ ] Passenger accounts
- [ ] SMS notifications
- [ ] Mobile notifications
- [ ] Station alerts
- [ ] Connecting-train alerts
Phase 4 — Advanced Prediction
- [ ] Weather-aware prediction
- [ ] Major-event impact
- [ ] Maintenance information
- [ ] Network-wide delay propagation
- [ ] Advanced time-series models
- [ ] Ensemble ML models
- [ ] Prediction confidence intervals
- [ ] Uncertainty-aware ETA
🔬 Future Research
Potential future research directions include:
Random Forest
      ↓
Gradient Boosting
      ↓
XGBoost / LightGBM
      ↓
Time-Series Models
      ↓
Hybrid ML Models
      ↓
Network-Level Prediction

Other possible directions:
- Graph-based railway prediction
- Network-wide delay propagation
- Real-time feature updates
- Prediction intervals
- Explainable AI
- Weather-aware prediction
- Event-aware prediction
- Multi-train interaction
- Uncertainty-aware ETA
⚠️ Limitations
The current prototype has some limitations.
1. Single-train demonstration
The current implementation demonstrates the workflow using a selected train.
2. Historical data dependency
Prediction quality depends on the availability and quality of historical railway data.
3. Live API dependency
Live prediction depends on the availability, accuracy and freshness of the connected railway API.
4. Unexpected disruptions
Sudden events that are not represented in the available input data may not be predicted accurately.
5. Route generalization
A model trained and evaluated on a particular route should not automatically be assumed to perform equally well on every railway route.
📚 Data & Model Notes
Prediction quality depends on:
- Historical data coverage
- Number of observations per section
- Data freshness
- Feature quality
- API reliability
- Route characteristics
- Operational changes
- Model training methodology
As more representative railway data becomes available, the model can be retrained and evaluated across additional trains and routes.
📊 Project at a Glance
                         RAILFORECAST
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
      Historical Data     Live Data        Simulation
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                     Feature Engineering
                              │
                              ▼
                     Random Forest Model
                              │
                              ▼
                  Section-wise Prediction
                              │
                              ▼
                    Delay Propagation
                              │
                              ▼
                         Dynamic ETA
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
          Delay Explanation        Passenger Information

🏆 Project Summary
RailForecast combines:
🚆 Railway Data
      +
📊 Historical Section Analysis
      +
🤖 Machine Learning
      +
📡 Live / Current Conditions
      +
🧪 Simulation
      +
🔄 Delay Propagation
      +
🧠 Explainable Prediction
      ↓
🎯 Dynamic Railway ETA

The system moves beyond simply asking:
"How late is the train now?"

and focuses on:
"Based on what we know about the train and its route, when is it expected to reach the passenger's station?"

👨‍💻 Project
RailForecast
Dynamic railway ETA prediction using historical section-delay behavior, machine learning, current conditions, and sequential delay propagation.
Tagline
🚆 Smarter railway journeys. Predicted before they happen.

⭐ Support
If you find RailForecast interesting, consider giving the repository a ⭐ and exploring the implementation.
<p align="center">

🚆 RailForecast
Predict the journey. Reduce the uncertainty.
</p>
```
