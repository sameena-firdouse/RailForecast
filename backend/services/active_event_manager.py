# ==========================================
# ACTIVE EVENT MANAGER
# ==========================================
# Stores and manages active simulation and
# Railway Authorized API events.
# ==========================================


from datetime import datetime


# ==========================================
# ACTIVE EVENTS STORAGE
# ==========================================

ACTIVE_EVENTS = []


# ==========================================
# ADD EVENT
# ==========================================

def add_event(event):

    # Make a copy before storing
    event_data = dict(event)

    # Add creation timestamp
    event_data["created_at"] = (
        datetime.now().isoformat(
            timespec="seconds"
        )
    )

    # Mark as active
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


    target_section = str(
        section
    ).strip().lower()


    matching_events = []


    for event in get_active_events():

        event_section = str(
            event.get(
                "section",
                ""
            )
        ).strip().lower()


        if event_section == target_section:

            matching_events.append(
                event
            )


    return matching_events


# ==========================================
# REMOVE EVENT
# ==========================================

def remove_event(event_index):

    if (
        event_index < 0
        or event_index >= len(
            ACTIVE_EVENTS
        )
    ):

        return False


    ACTIVE_EVENTS.pop(
        event_index
    )

    return True


# ==========================================
# CLEAR ALL EVENTS
# ==========================================

def clear_all_events():

    ACTIVE_EVENTS.clear()

    return True
