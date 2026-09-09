# ==========================================
# ALERT API MAPPER
# ==========================================
# Converts Railway Authorized Alert API data
# into standardized disruption inputs.
# ==========================================


def map_alert_data(api_data):

    # Make a copy of API response
    data = dict(api_data)

    return {

        # ==================================
        # ALERT INFORMATION
        # ==================================

        "alert_id": data.get(
            "alert_id"
        ),

        "alert_type": data.get(
            "alert_type"
        ),

        "severity": data.get(
            "severity",
            "medium"
        ),

        "status": data.get(
            "status",
            "active"
        ),


        # ==================================
        # LOCATION INFORMATION
        # ==================================

        "section": data.get(
            "section"
        ),

        "current_location": data.get(
            "current_location"
        ),

        "affected_length_km": data.get(
            "affected_length_km",
            0
        ),


        # ==================================
        # TIME INFORMATION
        # ==================================

        "detection_start_time": data.get(
            "detection_start_time"
        ),

        "estimated_clearance_time": data.get(
            "estimated_clearance_time"
        ),

        "estimated_repair_duration_min": data.get(
            "estimated_repair_duration_min",
            0
        ),


        # ==================================
        # BLOCK / DISRUPTION INFORMATION
        # ==================================

        "block_type": data.get(
            "block_type"
        ),

        "track_availability": data.get(
            "track_availability"
        ),

        "traffic_level": data.get(
            "traffic_level"
        ),


        # ==================================
        # SIGNAL INFORMATION
        # ==================================

        "signal_status": data.get(
            "signal_status"
        ),

        "halt_start_time": data.get(
            "halt_start_time"
        ),

        "alternate_route_available": data.get(
            "alternate_route_available",
            False
        ),


        # ==================================
        # OPERATIONAL BOTTLENECK INFORMATION
        # ==================================

        "average_headway_min": data.get(
            "average_headway_min",
            0
        ),

        "capacity_reduction_percent": data.get(
            "capacity_reduction_percent",
            0
        ),

        "section_occupancy_percent": data.get(
            "section_occupancy_percent",
            0
        ),

        "trains_ahead": data.get(
            "trains_ahead",
            0
        ),

        "train_priority": data.get(
            "train_priority",
            "normal"
        ),

        "expected_bottleneck_clearance_time_min": data.get(
            "expected_bottleneck_clearance_time_min",
            0
        ),


        # ==================================
        # SOURCE INFORMATION
        # ==================================

        "source": "railway_authorized_api",

        "api_type": "alert"
    }
