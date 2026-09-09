def calculate_congestion(data):

    # =====================================
    # INPUT PARAMETERS
    # =====================================

    congestion_level = str(
        data.get("congestion_level", "moderate")
    ).lower()

    section = data.get("section")

    trains_ahead = float(
        data.get("trains_ahead", 0)
    )

    queue_waiting_time = float(
        data.get("queue_waiting_time_min", 0)
    )

    average_speed = float(
        data.get("average_speed_kmph", 0)
    )

    expected_clearance_time = float(
        data.get("expected_clearance_time_min", 0)
    )


    # =====================================
    # CONGESTION LEVEL FACTOR
    # =====================================

    congestion_factors = {
        "low": 1.0,
        "moderate": 1.5,
        "high": 2.0,
        "severe": 3.0
    }

    congestion_factor = congestion_factors.get(
        congestion_level,
        1.5
    )


    # =====================================
    # CURRENT CONGESTION IMPACT
    # =====================================

    trains_ahead_impact = (
        trains_ahead * congestion_factor
    )

    current_impact = (
        queue_waiting_time
        + trains_ahead_impact
    )


    # =====================================
    # NORMAL CONGESTION IMPACT
    #
    # Temporary prototype calculation.
    # Later this can come from historical
    # section congestion data.
    # =====================================

    normal_impact = min(
        queue_waiting_time,
        expected_clearance_time * 0.2
    )


    # =====================================
    # STANDARDIZED EVENT OUTPUT
    # =====================================

    return {

        "feature": "congestion",

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

        "congestion_level": congestion_level,

        "trains_ahead": trains_ahead,

        "queue_waiting_time_min": queue_waiting_time,

        "average_speed_kmph": average_speed,

        "expected_clearance_time_min": expected_clearance_time,

        "source": data.get(
            "source",
            "simulation"
        )
    }
