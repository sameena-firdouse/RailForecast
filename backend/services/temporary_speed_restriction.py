from datetime import datetime


def calculate_temporary_speed_restriction(data):

    # =====================================
    # INPUT PARAMETERS
    # =====================================

    section = data.get("section")

    current_train_location = data.get(
        "current_train_location"
    )

    current_speed = float(
        data.get("current_speed_kmph", 0)
    )

    current_train_delay = float(
        data.get("current_train_delay_min", 0)
    )

    tsr_start_location = data.get(
        "tsr_start_location"
    )

    tsr_end_location = data.get(
        "tsr_end_location"
    )

    tsr_distance = float(
        data.get("tsr_distance_km", 0)
    )

    normal_speed = float(
        data.get("normal_speed_kmph", 0)
    )

    restricted_speed = float(
        data.get("restricted_speed_kmph", 0)
    )

    tsr_status = str(
        data.get("tsr_status", "active")
    ).lower()

    tsr_start_time = data.get(
        "tsr_start_time"
    )

    expected_clearance_time = data.get(
        "expected_clearance_time"
    )


    # =====================================
    # CHECK IF TSR IS ACTIVE
    # =====================================

    active_statuses = {
        "active",
        "temporary",
        "restricted"
    }

    is_active = tsr_status in active_statuses


    # =====================================
    # CALCULATE SPEED RESTRICTION IMPACT
    # =====================================

    current_impact = 0.0

    if (
        is_active
        and tsr_distance > 0
        and normal_speed > 0
        and restricted_speed > 0
        and restricted_speed < normal_speed
    ):

        # Normal travel time (minutes)
        normal_time = (
            tsr_distance / normal_speed
        ) * 60


        # Restricted travel time (minutes)
        restricted_time = (
            tsr_distance / restricted_speed
        ) * 60


        # Additional delay due to TSR
        speed_restriction_delay = (
            restricted_time
            - normal_time
        )


        current_impact = max(
            0,
            speed_restriction_delay
        )


    # =====================================
    # TSR IS A NEW DISRUPTION
    #
    # Therefore normal impact is zero.
    #
    # Existing current train delay is NOT
    # added again because forecast()
    # already contains that delay.
    # =====================================

    normal_impact = 0.0


    # =====================================
    # STANDARDIZED EVENT OUTPUT
    # =====================================

    return {

        "feature":
            "temporary_speed_restriction",

        "condition_type":
            "disruption",

        "section":
            section,

        "current_train_location":
            current_train_location,

        "current_speed_kmph":
            current_speed,

        "current_train_delay_min":
            current_train_delay,

        "tsr_start_location":
            tsr_start_location,

        "tsr_end_location":
            tsr_end_location,

        "tsr_distance_km":
            tsr_distance,

        "normal_speed_kmph":
            normal_speed,

        "restricted_speed_kmph":
            restricted_speed,

        "tsr_status":
            tsr_status,

        "tsr_start_time":
            tsr_start_time,

        "expected_clearance_time":
            expected_clearance_time,

        "current_impact_min":
            round(
                current_impact,
                2
            ),

        "normal_impact_min":
            normal_impact,

        "source":
            data.get(
                "source",
                "simulation"
            )
    }