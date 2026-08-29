const $ = (id) => document.getElementById(id);

function show(screen) {
    ["home", "passenger", "department"].forEach((s) => {
        const el = $(s);
        if (el) {
            el.classList.toggle("hide", s !== screen);
        }
    });

    window.scrollTo(0, 0);
}

function home() {
    show("home");
}

function passenger() {
    show("passenger");
}

function department() {
    show("department");
}

const API_BASE = (window.RAILFORECAST_API || "").replace(/\/$/, "");

async function forecast() {
    const train = $("train").value.trim();
    const date = $("date").value;
    const station = $("from").value.trim();

    if (!train) {
        showError("Enter a train number.");
        return;
    }

    if (!API_BASE) {
        showError("Backend API URL is not configured.");
        return;
    }

    $("err").classList.add("hide");

    try {
        const params = new URLSearchParams();

        if (date) {
            params.set("date", date);
        }

        if (station) {
            params.set("station", station);
        }

        const url =
            `${API_BASE}/api/forecast/${encodeURIComponent(train)}` +
            `?${params.toString()}`;

        console.log("Calling:", url);

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "Unable to generate forecast."
            );
        }

        render(data);

    } catch (error) {
        console.error(error);

        showError(
            error.message ||
            "Unable to connect to RailForecast backend."
        );
    }
}

function showError(message) {
    const errorBox = $("err");

    errorBox.textContent = message;
    errorBox.classList.remove("hide");
}

function render(data) {

    const train = data.train;

    $("result").classList.remove("hide");

    $("title").textContent =
        train.number +
        (train.name ? " · " + train.name : "");

    $("route").textContent =
        (train.current_name ||
            train.current_code ||
            "Unknown") +
        " → " +
        (train.next_name ||
            train.next_code ||
            "—");

    $("cur").textContent =
        train.current_name ||
        train.current_code ||
        "—";

    $("delay").textContent =
        `${train.delay >= 0 ? "+" : ""}` +
        `${Number(train.delay).toFixed(1)} min`;

    $("next").textContent =
        train.next_name ||
        train.next_code ||
        "—";

    $("updated").textContent =
        new Date(data.generated_at).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    const timeline = $("timeline");

    timeline.innerHTML = data.predictions
        .map((p, index) => {

            const delay = Number(
                p.predicted_delay_min
            );

            let statusClass = "bad";

            if (delay <= 2) {
                statusClass = "good";
            } else if (delay <= 10) {
                statusClass = "mid";
            }

            return `
                <div class="r">

                    <b>
                        ${index === 0 ? "●" : "│"}
                    </b>

                    <div>
                        <b>
                            ${escapeHtml(
                                p.to_station ||
                                p.to_code ||
                                "Unknown"
                            )}
                        </b>

                        <br>

                        <small>
                            ${escapeHtml(
                                p.to_code || ""
                            )}
                        </small>
                    </div>

                    <div>
                        <b>
                            ${p.predicted_eta}
                        </b>

                        <br>

                        <small>
                            Scheduled ${p.scheduled_eta}
                        </small>
                    </div>

                    <div class="${statusClass}">
                        <b>
                            ${delay > 0 ? "+" : ""}
                            ${delay.toFixed(1)} min
                        </b>

                        <br>

                        <small class="confidence">
                            ${p.confidence_percent}%
                            confidence
                        </small>
                    </div>

                    <b class="badge ${statusClass}">
                        ${p.status}
                    </b>

                </div>
            `;
        })
        .join("");
}

function escapeHtml(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]
    );
}

$("train").addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            forecast();
        }

    }
);