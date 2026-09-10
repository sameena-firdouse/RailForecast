# ==========================================
# TELEMETRY API MAPPER
# ==========================================
# Converts Railway Authorized Telemetry API
# data into standardized feature inputs.
# ==========================================


def map_telemetry_data(api_data):

    # Make a copy of the API response
    data = dict(api_data)

    # ==================================
    # STANDARD TELEMETRY DATA
    # ==================================

    mapped = {

        # TRAIN INFORMATION

        "train_id":
            data.get("train_id"),

        "current_train_location":
            data.get("current_location"),

        "current_speed_kmph":
            data.get(
                "current_speed_kmph",
                0
            ),

        "current_train_delay_min":
            data.get(
                "current_delay_min",
                0
            ),


        # OPERATIONAL INFORMATION

        "section":
            data.get("section"),

        "section_status":
            data.get("section_status"),


        # TRAIN MOVEMENT INFORMATION

        "distance_ahead_km":
            data.get("distance_ahead_km"),

        "average_headway_min":
            data.get("average_headway_min"),

        "trains_ahead":
            data.get(
                "trains_ahead",
                0
            ),


        # SOURCE

        "source":
            "railway_authorized_api",

        "api_type":
            "telemetry"
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