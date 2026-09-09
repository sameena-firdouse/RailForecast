# ==========================================
# EVENT PROCESSOR
# ==========================================
# Central processing layer for:
#
# 1. Simulation inputs
# 2. Railway Authorized API inputs
#
# Both sources eventually use the SAME
# feature calculators.
# ==========================================


from adapters.simulation_mapper import (
    map_simulation_event
)

from adapters.telemetry_api_mapper import (
    map_telemetry_data
)

from adapters.asset_api_mapper import (
    map_asset_data
)

from adapters.alert_api_mapper import (
    map_alert_data
)


# ==========================================
# PROCESS SIMULATION EVENT
# ==========================================

def process_simulation_event(data):

    event = map_simulation_event(
        data
    )

    return event


# ==========================================
# PROCESS TELEMETRY API EVENT
# ==========================================

def process_telemetry_event(
    feature,
    api_data
):

    # Convert Railway Telemetry API
    # response into standardized input
    event_data = map_telemetry_data(
        api_data
    )

    # Identify feature
    event_data["feature"] = feature

    # Process using same calculator
    event = map_simulation_event(
        event_data
    )

    # Preserve API source information
    event["source"] = (
        "railway_authorized_api"
    )

    event["api_type"] = (
        "telemetry"
    )

    return event


# ==========================================
# PROCESS ASSET API EVENT
# ==========================================

def process_asset_event(
    feature,
    api_data
):

    # Convert Railway Asset API
    # response into standardized input
    event_data = map_asset_data(
        api_data
    )

    # Identify feature
    event_data["feature"] = feature

    # Process using same calculator
    event = map_simulation_event(
        event_data
    )

    # Preserve source
    event["source"] = (
        "railway_authorized_api"
    )

    event["api_type"] = (
        "asset"
    )

    return event


# ==========================================
# PROCESS ALERT API EVENT
# ==========================================

def process_alert_event(
    feature,
    api_data
):

    # Convert Railway Alert API
    # response into standardized input
    event_data = map_alert_data(
        api_data
    )

    # Identify feature
    event_data["feature"] = feature

    # Process using same calculator
    event = map_simulation_event(
        event_data
    )

    # Preserve source
    event["source"] = (
        "railway_authorized_api"
    )

    event["api_type"] = (
        "alert"
    )

    return event
