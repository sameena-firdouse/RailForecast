# ==========================================
# ACTIVE EVENT MANAGER
# ==========================================

from datetime import datetime
import uuid


# ==========================================
# ACTIVE EVENTS STORAGE
# ==========================================

ACTIVE_EVENTS = []


# ==========================================
# NORMALIZE SECTION
# ==========================================

def normalize_section(section):

    if not section:
        return ""

    normalized = str(section).lower()

    normalized = normalized.replace(
        "junction",
        ""
    )

    normalized = normalized.replace(
        "j.n.",
        ""
    )

    normalized = normalized.replace(
        "jn",
        ""
    )

    normalized = normalized.replace(
        "→",
        ""
    )

    normalized = normalized.replace(
        "->",
        ""
    )

    normalized = normalized.replace(
        "-",
        ""
    )

    normalized = normalized.replace(
        "to",
        ""
    )

    normalized = normalized.replace(
        " ",
        ""
    )

    return normalized


# ==========================================
# ADD EVENT
# ==========================================

def add_event(event):

    event_data = dict(event)

    # Unique event ID
    event_data["event_id"] = str(
        uuid.uuid4()
    )

    # Creation time
    event_data["created_at"] = (
        datetime.now().isoformat(
            timespec="seconds"
        )
    )

    # Mark active
    event_data["active"] = True

    ACTIVE_EVENTS.append(
        event_data
    )

    return event_data


# ==========================================
# GET ACTIVE EVENTS
# ==========================================

def get_active_events():

    return [

        event

        for event in ACTIVE_EVENTS

        if event.get(
            "active",
            True
        )

    ]


# ==========================================
# GET EVENTS FOR SECTION
# ==========================================

def get_events_for_section(section):

    if not section:
        return []

    target_section = normalize_section(
        section
    )

    matching_events = []

    for event in get_active_events():

        event_section = normalize_section(
            event.get(
                "section",
                ""
            )
        )

        if event_section == target_section:

            matching_events.append(
                event
            )

    return matching_events


# ==========================================
# REMOVE EVENT BY EVENT ID
# ==========================================

def remove_event(event_id):

    for i, event in enumerate(
        ACTIVE_EVENTS
    ):

        if event.get(
            "event_id"
        ) == event_id:

            ACTIVE_EVENTS.pop(
                i
            )

            return True

    return False


# ==========================================
# CLEAR ALL EVENTS
# ==========================================

def clear_all_events():

    ACTIVE_EVENTS.clear()

    return True
