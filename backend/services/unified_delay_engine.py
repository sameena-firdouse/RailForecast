def combine_delay_impacts(events):

    expected_condition_impact = 0.0
    unscheduled_impact = 0.0

    active_events = []


    for event in events:

        condition_type = str(
            event.get(
                "condition_type",
                "expected"
            )
        ).lower()


        # ==================================
        # EXPECTED / RECURRING CONDITIONS
        # ==================================

        if condition_type == "expected":

            current_impact = float(
                event.get(
                    "current_impact_min",
                    0
                )
            )

            normal_impact = float(
                event.get(
                    "normal_impact_min",
                    0
                )
            )


            # Only add the additional impact
            # beyond the normal historical
            # operational condition

            additional_impact = (
                current_impact
                -
                normal_impact
            )


            expected_condition_impact += max(
                0,
                additional_impact
            )


        # ==================================
        # UNSCHEDULED / DISRUPTION EVENTS
        # ==================================

        elif condition_type in [
            "unscheduled",
            "disruption"
        ]:

            impact = float(
                event.get(
                    "current_impact_min",

                    event.get(
                        "delay_impact_min",
                        0
                    )
                )
            )


            unscheduled_impact += max(
                0,
                impact
            )


        # ==================================
        # UNKNOWN CONDITION TYPE
        # ==================================

        else:

            # Safely treat unknown event types
            # as additional disruption impact

            impact = float(
                event.get(
                    "current_impact_min",
                    0
                )
            )

            unscheduled_impact += max(
                0,
                impact
            )


        active_events.append(
            event
        )


    # ==================================
    # FINAL UNIFIED DELAY IMPACT
    # ==================================

    total_delay_impact = (

        expected_condition_impact

        +

        unscheduled_impact

    )


    return {

        "expected_condition_impact_min":

            round(
                expected_condition_impact,
                1
            ),


        "unscheduled_impact_min":

            round(
                unscheduled_impact,
                1
            ),


        "total_delay_impact_min":

            round(
                total_delay_impact,
                1
            ),


        "active_events":

            active_events

    }
