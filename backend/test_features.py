from features.signal_halt import calculate_signal_halt
from services.unified_delay_engine import combine_delay_impacts


# Simulate a signal halt event
signal_event = {
    "section": "Guntur → Mangalagiri",

    "halt_start_time": "2026-09-06T10:30:00",

    "signal_status": "fault",

    "severity": "high",

    "expected_deviation_min": 10,

    "normal_impact_min": 2,

    "alternate_route_available": True,

    "source": "simulation"
}


# Calculate signal halt delay
signal_result = calculate_signal_halt(signal_event)

print("Signal Halt Result:")
print(signal_result)


# Send the result to the unified delay engine
events = [signal_result]

combined_result = combine_delay_impacts(events)

print("\nUnified Delay Result:")
print(combined_result)