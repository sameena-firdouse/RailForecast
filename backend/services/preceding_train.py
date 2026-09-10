def calculate_preceding_train_delay(data):

    # =====================================
    # INPUT PARAMETERS
    # =====================================

    affected_train_id = str(
        data.get("affected_train_id", "")
    )

    preceding_train_id = str(
        data.get("preceding_train_id", "")
    )

    section = data.get("section")

    preceding_train_location = data.get(
        "preceding_train_location"
    )

    preceding_train_delay = float(
        data.get("preceding_train_delay_min", 0)
    )

    distance_ahead = float(
        data.get("distance_ahead_km", 0)
    )

    section_status = str(
        data.get("section_status", "clear")
    ).lower()

    estimated_clearance_time = float(
        data.get("estimated_clearance_time_min", 0)
    )


    # =====================================
    # SECTION STATUS FACTOR
    # =====================================

    status_factors = {
        "clear": 0.2,
        "occupied": 0.8,
        "congested": 1.0,
        "blocked": 1.5
    }

    status_factor = status_factors.get(
        section_status,
        0.5
    )


    # =====================================
    # DISTANCE FACTOR
    #
    # Closer preceding train can have
    # greater operational impact.
    # =====================================

    if distance_ahead <= 2:
        distance_factor = 1.0

    elif distance_ahead <= 5:
        distance_factor = 0.75

    elif distance_ahead <= 10:
        distance_factor = 0.5

    else:
        distance_factor = 0.25


    # =====================================
    # CURRENT IMPACT
    # =====================================

    delay_impact = (
        preceding_train_delay
        * status_factor
        * distance_factor
    )

    clearance_impact = (
        estimated_clearance_time
        * status_factor
    )

    current_impact = max(
        delay_impact,
        clearance_impact
    )


    # =====================================
    # NORMAL IMPACT
    #
    # Prototype baseline for normal
    # operational interaction.
    # =====================================

    normal_impact = min(
        current_impact * 0.2,
        2.0
    )


    # =====================================
    # STANDARDIZED EVENT OUTPUT
    # =====================================

    return {

        "feature": "preceding_train",

        "condition_type": "expected",

        "section": section,

        "affected_train_id": affected_train_id,

        "preceding_train_id": preceding_train_id,

        "preceding_train_location":
            preceding_train_location,

        "preceding_train_delay_min":
            preceding_train_delay,

        "distance_ahead_km":
            distance_ahead,

        "section_status":
            section_status,

        "estimated_clearance_time_min":
            estimated_clearance_time,

        "current_impact_min":
            round(current_impact, 2),

        "normal_impact_min":
            round(normal_impact, 2),

        "source": data.get(
            "source",
            "simulation"
        )
    }