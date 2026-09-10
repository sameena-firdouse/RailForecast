# ==========================================
# SIMULATION MAPPER
# ==========================================
# Converts simulation/manual inputs into
# standardized events using the same
# feature calculators used by Railway APIs.
# ==========================================


from services.signal_halt import (
    calculate_signal_halt
)

from services.congestion import (
    calculate_congestion
)

from services.preceding_train import (
    calculate_preceding_train_delay
)

from services.level_crossing import (
    calculate_level_crossing
)

from services.operational_bottleneck import (
    calculate_operational_bottleneck
)

from services.temporary_speed_restriction import (
    calculate_temporary_speed_restriction
)

from services.unscheduled_maintenance import (
    calculate_unscheduled_maintenance
)


# ==========================================
# FEATURE CALCULATOR REGISTRY
# ==========================================

FEATURE_CALCULATORS = {

    "signal_halt":
        calculate_signal_halt,

    "congestion":
        calculate_congestion,

    "preceding_train":
        calculate_preceding_train_delay,

    "level_crossing":
        calculate_level_crossing,

    "operational_bottleneck":
        calculate_operational_bottleneck,

    "temporary_speed_restriction":
        calculate_temporary_speed_restriction,

    "unscheduled_maintenance":
        calculate_unscheduled_maintenance
}


# ==========================================
# MAP SIMULATION INPUT
# ==========================================

def map_simulation_event(data):

    # Make a copy so we don't modify
    # the original request data
    event_data = dict(data)


    # ======================================
    # IDENTIFY FEATURE
    # ======================================

    feature = str(
        event_data.get(
            "feature",
            ""
        )
    ).strip().lower()


    # ======================================
    # VALIDATE FEATURE
    # ======================================

    if feature not in FEATURE_CALCULATORS:

        raise ValueError(
            f"Unsupported simulation feature: "
            f"{feature}"
        )


    # ======================================
    # STANDARDIZE SOURCE
    # ======================================

    event_data["source"] = "simulation"


    # ======================================
    # GET CORRECT CALCULATOR
    # ======================================

    calculator = FEATURE_CALCULATORS[
        feature
    ]


    # ======================================
    # CALCULATE STANDARDIZED EVENT
    # ======================================

    standardized_event = calculator(
        event_data
    )


    return standardized_event