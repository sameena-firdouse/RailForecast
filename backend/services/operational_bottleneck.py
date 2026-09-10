def calculate_operational_bottleneck(data):

    # =====================================
    # INPUT PARAMETERS
    # =====================================

    section = data.get("section")

    current_train_delay = float(
        data.get("current_train_delay_min", 0)
    )

    trains_ahead = float(
        data.get("trains_ahead", 0)
    )

    average_headway = float(
        data.get("average_headway_min", 0)
    )

    section_occupancy = float(
        data.get("section_occupancy_percent", 0)
    )

    capacity_reduction = float(
        data.get("capacity_reduction_percent", 0)
    )

    expected_clearance_time = float(
        data.get(
            "expected_bottleneck_clearance_time_min",
            0
        )
    )

    train_priority = str(
        data.get("train_priority", "normal")
    ).lower()


    # =====================================
    # OCCUPANCY FACTOR
    # =====================================

    if section_occupancy >= 90:
        occupancy_factor = 1.5

    elif section_occupancy >= 70:
        occupancy_factor = 1.2

    elif section_occupancy >= 50:
        occupancy_factor = 1.0

    else:
        occupancy_factor = 0.7


    # =====================================
    # CAPACITY REDUCTION FACTOR
    # =====================================

    capacity_factor = (
        1 + capacity_reduction / 100
    )


    # =====================================
    # TRAIN PRIORITY FACTOR
    #
    # Higher priority trains may receive
    # operational preference, reducing
    # their additional waiting impact.
    # =====================================

    priority_factors = {
        "low": 1.2,
        "normal": 1.0,
        "high": 0.8,
        "premium": 0.6
    }

    priority_factor = priority_factors.get(
        train_priority,
        1.0
    )


    # =====================================
    # BOTTLENECK QUEUE IMPACT
    # =====================================

    queue_impact = (
        trains_ahead
        * average_headway
        * occupancy_factor
    )


    # =====================================
    # CURRENT BOTTLENECK IMPACT
    # =====================================

    base_impact = max(
        queue_impact,
        expected_clearance_time
    )

    current_impact = (
        base_impact
        * capacity_factor
        * priority_factor
    )


    # =====================================
    # NORMAL IMPACT
    #
    # Represents normal operational delay.
    # Current train delay is NOT added
    # because it already exists in forecast().
    # =====================================

    normal_impact = min(
        average_headway * 0.2,
        current_impact * 0.2
    )


    # =====================================
    # STANDARDIZED EVENT OUTPUT
    # =====================================

    return {

        "feature": "operational_bottleneck",

        "condition_type": "expected",

        "section": section,

        "current_train_delay_min":
            current_train_delay,

        "trains_ahead":
            trains_ahead,

        "average_headway_min":
            average_headway,

        "section_occupancy_percent":
            section_occupancy,

        "capacity_reduction_percent":
            capacity_reduction,

        "expected_bottleneck_clearance_time_min":
            expected_clearance_time,

        "train_priority":
            train_priority,

        "current_impact_min":
            round(current_impact, 2),

        "normal_impact_min":
            round(normal_impact, 2),

        "source": data.get(
            "source",
            "simulation"
        )
    }