def calculate_signal_halt(event):
    """
    Prepare signal halt data for the Unified Delay Engine.

    Signal halts are treated as recurring/expected operational
    conditions, so only the additional abnormal impact is ultimately
    added by the Unified Delay Engine.
    """

    # ---------------- INPUTS ----------------

    section = event.get("section")

    signal_status = str(
        event.get("signal_status", "normal")
    ).lower()

    severity = str(
        event.get("severity", "medium")
    ).lower()

    expected_deviation = float(
        event.get("expected_deviation_min", 0)
    )

    normal_impact = float(
        event.get("normal_impact_min", 0)
    )

    alternate_route = event.get(
        "alternate_route_available",
        False
    )

    halt_start_time = event.get(
        "halt_start_time"
    )

    # ---------------- NORMAL SIGNAL ----------------

    if signal_status in [
        "normal",
        "clear",
        "active"
    ]:

        current_impact = 0

    else:

        # Base current disruption
        current_impact = max(
            0,
            expected_deviation
        )

        # Severity adjustment
        severity_factors = {
            "low": 0.5,
            "medium": 0.75,
            "high": 1.0,
            "critical": 1.25
        }

        severity_factor = severity_factors.get(
            severity,
            1.0
        )

        current_impact *= severity_factor

        # Alternate route reduces current impact
        if alternate_route:
            current_impact *= 0.7


    # ---------------- STANDARDIZED OUTPUT ----------------

    return {
        "feature": "signal_halt",

        "condition_type": "expected",

        "section": section,

        "current_impact_min": round(
            current_impact,
            2
        ),

        "normal_impact_min": round(
            normal_impact,
            2
        ),

        "halt_start_time": halt_start_time,

        "signal_status": signal_status,

        "severity": severity,

        "expected_deviation_min": expected_deviation,

        "alternate_route_available": alternate_route,

        "source": event.get(
            "source",
            "simulation"
        )
    }