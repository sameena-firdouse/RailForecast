def calculate_unscheduled_maintenance(data):

    # =====================================
    # INPUT PARAMETERS
    # =====================================

    maintenance_type = str(
        data.get("maintenance_type", "unspecified")
    )

    section = data.get("section")

    detection_start_time = data.get(
        "detection_start_time"
    )

    block_type = str(
        data.get("block_type", "partial")
    ).lower()

    severity = str(
        data.get("severity", "medium")
    ).lower()

    estimated_repair_duration = float(
        data.get(
            "estimated_repair_duration_min",
            0
        )
    )

    affected_length = float(
        data.get(
            "affected_length_km",
            0
        )
    )

    normal_speed = float(
        data.get(
            "normal_speed_kmph",
            0
        )
    )

    restricted_speed = float(
        data.get(
            "restricted_speed_kmph",
            0
        )
    )

    track_availability = str(
        data.get(
            "track_availability",
            "available"
        )
    ).lower()

    traffic_level = str(
        data.get(
            "traffic_level",
            "moderate"
        )
    ).lower()


    # =====================================
    # SEVERITY FACTOR
    # =====================================

    severity_factors = {
        "low": 0.5,
        "medium": 1.0,
        "high": 1.5,
        "critical": 2.0
    }

    severity_factor = severity_factors.get(
        severity,
        1.0
    )


    # =====================================
    # TRAFFIC FACTOR
    # =====================================

    traffic_factors = {
        "low": 0.8,
        "moderate": 1.0,
        "high": 1.3,
        "severe": 1.6
    }

    traffic_factor = traffic_factors.get(
        traffic_level,
        1.0
    )


    # =====================================
    # COMPLETE BLOCK IMPACT
    # =====================================

    blocked_statuses = {
        "unavailable",
        "blocked",
        "closed"
    }

    is_blocked = (
        block_type in {
            "complete",
            "full",
            "blocked"
        }
        or track_availability in blocked_statuses
    )


    # =====================================
    # CALCULATE SPEED RESTRICTION IMPACT
    # =====================================

    speed_impact = 0.0

    if (
        affected_length > 0
        and normal_speed > 0
        and restricted_speed > 0
        and restricted_speed < normal_speed
    ):

        normal_time = (
            affected_length / normal_speed
        ) * 60

        restricted_time = (
            affected_length / restricted_speed
        ) * 60

        speed_impact = max(
            0,
            restricted_time - normal_time
        )


    # =====================================
    # CALCULATE CURRENT IMPACT
    # =====================================

    if is_blocked:

        # Train must wait for maintenance
        current_impact = (
            estimated_repair_duration
            * severity_factor
            * traffic_factor
        )

    else:

        # Partial availability:
        # additional time due to restricted speed
        current_impact = (
            speed_impact
            * severity_factor
            * traffic_factor
        )


    # =====================================
    # UNSCHEDULED DISRUPTION
    # =====================================

    normal_impact = 0.0


    # =====================================
    # STANDARDIZED EVENT OUTPUT
    # =====================================

    return {

        "feature":
            "unscheduled_maintenance",

        "condition_type":
            "disruption",

        "section":
            section,

        "maintenance_type":
            maintenance_type,

        "detection_start_time":
            detection_start_time,

        "block_type":
            block_type,

        "severity":
            severity,

        "estimated_repair_duration_min":
            estimated_repair_duration,

        "affected_length_km":
            affected_length,

        "normal_speed_kmph":
            normal_speed,

        "restricted_speed_kmph":
            restricted_speed,

        "track_availability":
            track_availability,

        "traffic_level":
            traffic_level,

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