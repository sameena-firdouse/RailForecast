def calculate_signal_halt(event):

    """
    Prepare signal halt data for the Unified Delay Engine.

    Uses current_impact_min directly when it is provided
    by simulation or a Railway API.

    Otherwise, calculates the impact using
    expected_deviation_min.
    """

    # ---------------- INPUTS ----------------

    section = event.get(
        "section"
    )

    signal_status = str(
        event.get(
            "signal_status",
            "normal"
        )
    ).lower()

    severity = str(
        event.get(
            "severity",
            "medium"
        )
    ).lower()


    # ---------------- CURRENT IMPACT ----------------

    provided_current_impact = float(
        event.get(
            "current_impact_min",
            0
        ) or 0
    )


    expected_deviation = float(
        event.get(
            "expected_deviation_min",
            0
        ) or 0
    )


    normal_impact = float(
        event.get(
            "normal_impact_min",
            0
        ) or 0
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

        # =================================
        # USE PROVIDED CURRENT IMPACT
        # =================================

        if provided_current_impact > 0:

            current_impact = (
                provided_current_impact
            )


        # =================================
        # OTHERWISE CALCULATE FROM
        # EXPECTED DEVIATION
        # =================================

        else:

            current_impact = max(
                0,
                expected_deviation
            )


            # ------------------------------
            # SEVERITY ADJUSTMENT
            # ------------------------------

            severity_factors = {

                "low": 0.5,

                "medium": 0.75,

                "high": 1.0,

                "critical": 1.25

            }


            severity_factor = (
                severity_factors.get(
                    severity,
                    1.0
                )
            )


            current_impact *= (
                severity_factor
            )


        # ------------------------------
        # ALTERNATE ROUTE REDUCTION
        # ------------------------------

        if alternate_route:

            current_impact *= 0.7


    # ---------------- STANDARDIZED OUTPUT ----------------

    return {

        "feature":
            "signal_halt",


        "condition_type":
            "expected",


        "section":
            section,


        "current_impact_min":
            round(
                current_impact,
                2
            ),


        "normal_impact_min":
            round(
                normal_impact,
                2
            ),


        "halt_start_time":
            halt_start_time,


        "signal_status":
            signal_status,


        "severity":
            severity,


        "expected_deviation_min":
            expected_deviation,


        "alternate_route_available":
            alternate_route,


        "source":
            event.get(
                "source",
                "simulation"
            )

    }