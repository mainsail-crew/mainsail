export default {
    software_version: '',
    hostname: '',
    cpu_info: '',
    webhooks: {
        state: '',
        state_message: '',
    },
    heaters: {
        available_heaters: [],
    },
    toolhead: {
        position: [],
        homed_axes: "",
        extruder: "",
        status: "",
        print_time: 0,
        printing_time: 0,
        estimated_print_time: 0,
        max_velocity: 0,
        max_accel: 0,
        max_accel_to_decel: 0,
        square_corner_velocity: 0,
    },
    pause_resume: {
        is_paused: false
    },
    idle_timeout: {
        printing_time: 0,
        state: "",
    },
    display_status: {
        message: null,
        progress: 0,
    },
    virtual_sdcard: {
        progress: 0,
        is_active: false,
        file_position: 0,
    },
    print_stats: {
        print_duration: 0,
        filament_used: 0,
        total_duration: 0,
        filename: "",
        state: "",
        message: ""
    },
    current_file: {

    },
    gcode_move: {
        extrude_factor: 1,
        speed_factor: 1,
        homing_origin: [0,0,0,0],
        absolute_coordinates: true,
        absolute_extrude: true,
        speed: 0,
    },
    endstops: {},
    configfile: {
        config: {},
        config_changed: false,
    }
}