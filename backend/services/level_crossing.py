def calculate_level_crossing(data):

    # =====================================
    # INPUT PARAMETERS
    # =====================================

    train_id = str(
        data.get("train_id", "")
    )

    section = data.get("section")

    current_train_delay = float(
        data.get("current_train_delay_min", 0)
    )

    distance_to_crossing = float(
        data.get("distance_to_crossing_km", 0)
    )

    current_train_speed = float(
        data.get("current_train_speed_kmph", 0)
    )

    gate_status = str(
        data.get("gate_status", "open")
    ).lower()

    remaining_closure_time = float(
        data.get("remaining_gate_closure_time_min", 0)
    )

    gate_clearance_delay = float(
        data.get("gate_clearance_delay_min", 0)
    )


    # =====================================
    # CHECK GATE STATUS
    # =====================================

    blocking_statuses = {
        "closed",
        "closing",
        "blocked"
    }


    if gate_status not in blocking_statuses:

        current_impact = 0.0

    else:

        # =================================
        # ESTIMATED TIME TO REACH CROSSING
        # =================================

        if current_train_speed > 0:

            time_to_crossing = (
                distance_to_crossing
                / current_train_speed
            ) * 60

        else:

            time_to_crossing = 0


        # =================================
        # WAITING TIME AT GATE
        #
        # Train only waits if it reaches
        # the crossing before the gate opens.
        # =================================

        waiting_time = max(
            0,
            remaining_closure_time
            - time_to_crossing
        )


        # =================================
        # CURRENT LEVEL CROSSING IMPACT
        # =================================

        current_impact = (
            waiting_time
            + gate_clearance_delay
        )


    # =====================================
    # NORMAL IMPACT
    #
    # Represents normal gate operation.
    # Current train delay is NOT added
    # here because it already exists in
    # the Dynamic ETA calculation.
    # =====================================

    normal_impact = min(
        gate_clearance_delay,
        1.0
    )


    # =====================================
    # STANDARDIZED EVENT OUTPUT
    # =====================================

    return {

        "feature": "level_crossing",

        "condition_type": "expected",

        "section": section,

        "train_id": train_id,

        "current_train_delay_min":
            current_train_delay,

        "distance_to_crossing_km":
            distance_to_crossing,

        "current_train_speed_kmph":
            current_train_speed,

        "gate_status":
            gate_status,

        "remaining_gate_closure_time_min":
            remaining_closure_time,

        "gate_clearance_delay_min":
            gate_clearance_delay,

        "current_impact_min":
            round(current_impact, 2),

        "normal_impact_min":
            round(normal_impact, 2),

        "source": data.get(
            "source",
            "simulation"
        )
    }
