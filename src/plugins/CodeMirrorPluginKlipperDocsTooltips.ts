/**
 * @link https://codemirror.net/examples/tooltip/
 */
import { hoverTooltip } from "@codemirror/view"

const DOCUMENTATION_URL_BASE = "https://www.klipper3d.org/Config_Reference.html"

const CONFIG_SECTIONS: readonly string[] = [
  "ad5206",
  "adc_scaled",
  "adc_temperature",
  "adxl345",
  "angle",
  "axis_twist_compensation",
  "bed_mesh",
  "bed_screws",
  "bed_tilt",
  "bltouch",
  "board_pins",
  "controller_fan",
  "delayed_gcode",
  "display",
  "display_data",
  "display_glyph",
  "display_template",
  "dotstar",
  "dual_carriage",
  "duplicate_pin_override",
  "endstop_phase",
  "exclude_object",
  "extruder",
  "extruder1",
  "extruder_stepper",
  "fan",
  "fan_generic",
  "filament_motion_sensor",
  "filament_switch_sensor",
  "firmware_retraction",
  "force_move",
  "gcode_arcs",
  "gcode_button",
  "gcode_macro",
  "hall_filament_width_sensor",
  "heater_bed",
  "heater_fan",
  "heater_generic",
  "homing_heaters",
  "homing_override",
  "idle_timeout",
  "include",
  "input_shaper",
  "led",
  "lis2dw",
  "manual_stepper",
  "mcp4018",
  "mcp4451",
  "mcp4728",
  "mcu",
  "menu",
  "mpu9250",
  "multi_pin",
  "neopixel",
  "output_pin",
  "palette2",
  "pause_resume",
  "pca9533",
  "pca9632",
  "printer",
  "probe",
  "probe_eddy_current",
  "pwm_cycle_time",
  "pwm_tool",
  "quad_gantry_level",
  "replicape",
  "resonance_tester",
  "respond",
  "safe_z_home",
  "samd_sercom",
  "save_variables",
  "screws_tilt_adjust",
  "sdcard_loop",
  "servo",
  "skew_correction",
  "smart_effector",
  "static_digital_output",
  "stepper",
  "stepper_x",
  "stepper_y",
  "stepper_z",
  "stepper_z1",
  "sx1509",
  "temperature_fan",
  "temperature_sensor",
  "thermistor",
  "tmc2130",
  "tmc2208",
  "tmc2209",
  "tmc2240",
  "tmc2660",
  "tmc5160",
  "tsl1401cl_filament_width_sensor",
  "verify_heater",
  "virtual_sdcard",
  "z_thermal_adjust",
  "z_tilt"
]

export function KlipperDocsTooltipPlugin() {
    return hoverTooltip((view, pos, side) => {
        const { from, to, text } = view.state.doc.lineAt(pos)

        let start = pos, end = pos
        while (start > from && /\w/.test(text[start - from - 1])) start--
        while (end < to && /\w/.test(text[end - from])) end++

        const word = text.slice(start - from, end - from)
        if (start === pos && side < 0 || end === pos && side > 0 || !CONFIG_SECTIONS.includes(word)) {
            return null;
        }

        return {
            pos: start,
            end,
            above: true,
            create() {
                const div = document.createElement("div")

                Object.assign(div.style, {
                    padding: "3px 10px",
                    borderRadius: "5px",
                    backgroundColor: "#FFF",
                })

                div.innerHTML = `\
                <a style="text-decoration: none;" href="${DOCUMENTATION_URL_BASE}#${word}" rel="noopener" target="_blank">
                    View documentation for [${word}]
                </a>`;

                return { dom: div }
            }
        }
    })
}
