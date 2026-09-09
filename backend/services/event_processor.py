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


def process_simulation_event(data):

    event = map_simulation_event(
        data
    )

    return event


def process_telemetry_event(
    feature,
    api_data
):

    event_data = map_telemetry_data(
        api_data
    )

    event_data["feature"] = feature

    event = map_simulation_event(
        event_data
    )

    event["source"] = (
        "railway_authorized_api"
    )

    event["api_type"] = (
        "telemetry"
    )

    return event


def process_asset_event(
    feature,
    api_data
):

    event_data = map_asset_data(
        api_data
    )

    event_data["feature"] = feature

    event = map_simulation_event(
        event_data
    )

    event["source"] = (
        "railway_authorized_api"
    )

    event["api_type"] = (
        "asset"
    )

    return event


def process_alert_event(
    feature,
    api_data
):

    event_data = map_alert_data(
        api_data
    )

    event_data["feature"] = feature

    event = map_simulation_event(
        event_data
    )

    event["source"] = (
        "railway_authorized_api"
    )

    event["api_type"] = (
        "alert"
    )

    return event
