# ==========================================
# ASSET API MAPPER
# ==========================================
# Converts Railway Authorized Asset API data
# into standardized infrastructure inputs.
# ==========================================


def map_asset_data(api_data):

    # Make a copy of API response
    data = dict(api_data)


    # ==================================
    # STANDARD ASSET DATA
    # ==================================

    mapped = {

        # LOCATION / SECTION INFORMATION

        "section":
            data.get("section"),

        "affected_length_km":
            data.get(
                "affected_length_km",
                0
            ),


        # INFRASTRUCTURE STATUS

        "track_availability":
            data.get(
                "track_availability",
                "available"
            ),

        "section_status":
            data.get(
                "section_status",
                "normal"
            ),


        # SPEED INFORMATION

        "normal_speed_kmph":
            data.get(
                "normal_speed_kmph",
                0
            ),

        "restricted_speed_kmph":
            data.get(
                "restricted_speed_kmph",
                0
            ),


        # TSR INFORMATION

        "tsr_start_location":
            data.get("tsr_start_location"),

        "tsr_end_location":
            data.get("tsr_end_location"),

        "tsr_distance_km":
            data.get(
                "tsr_distance_km",
                0
            ),

        "tsr_status":
            data.get(
                "tsr_status",
                "inactive"
            ),


        # LEVEL CROSSING INFORMATION

        "gate_status":
            data.get("gate_status"),

        "remaining_gate_closure_time_min":
            data.get(
                "remaining_gate_closure_time_min",
                0
            ),

        "gate_clearance_delay_min":
            data.get(
                "gate_clearance_delay_min",
                0
            ),


        # SOURCE INFORMATION

        "source":
            "railway_authorized_api",

        "api_type":
            "asset"
    }


    # ==================================
    # PRESERVE FEATURE-SPECIFIC DATA
    # ==================================

    mapped.update({

        key: value

        for key, value in data.items()

        if key not in mapped

    })


    return mapped