"""
Moonraker component: cnc_metadata.

Registers a gcode_file processor that invokes the standalone
`cnc_metadata_extractor.py` script. The extractor writes a
`<file>.cnc-meta.json` sidecar next to each gcode file and tags the
file with a `; CNC-METADATA-V1` footer. The processor's `ident`
regex then short-circuits on subsequent metadata refreshes.

Configuration:

    [cnc_metadata]
    extractor_path: ~/printer_data/scripts/cnc_metadata_extractor.py
    timeout: 30.0

The `[cnc_metadata]` section is opt-in. If the section is absent the
component logs a startup message and exits without registering a
processor — a stock Moonraker install is unaffected.

This component is vendored by ./scripts/install_to_moonraker.sh into
moonraker/moonraker/components/cnc_metadata/ on the target, sibling
of cnc_agent/. The two are intentionally separate components: agent
holds the runtime state model, metadata holds the gcode processor.
"""

import logging
import os
import sys

DEFAULT_EXTRACTOR_PATH = os.path.expanduser("~/printer_data/scripts/cnc_metadata_extractor.py")
DEFAULT_TIMEOUT = 30.0
PROCESSOR_NAME = "cnc_metadata_extractor"
FOOTER_REGEX = r"^; CNC-METADATA-V1"


class CncMetadata:
    def __init__(self, config):
        self.server = config.get_server()
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.extractor_path = os.path.expanduser(config.get("extractor_path", DEFAULT_EXTRACTOR_PATH))
        self.timeout = float(config.getfloat("timeout", DEFAULT_TIMEOUT))
        self.logger.info(
            "CncMetadata component initialized (extractor=%s, timeout=%.1fs).",
            self.extractor_path,
            self.timeout,
        )

    async def component_init(self):
        try:
            fm = self.server.lookup_component("file_manager")
        except Exception:
            self.logger.exception("CncMetadata: file_manager component not available; processor not registered")
            return
        if not os.path.isfile(self.extractor_path):
            self.logger.warning(
                "CncMetadata: extractor not found at %s; processor not registered. "
                "Run scripts/install_to_moonraker.sh to deploy it.",
                self.extractor_path,
            )
            return
        if not os.access(self.extractor_path, os.R_OK | os.X_OK):
            self.logger.warning(
                "CncMetadata: extractor at %s is not executable; processor not registered. "
                "Run `chmod +x %s` (or re-run the install script).",
                self.extractor_path,
                self.extractor_path,
            )
            return
        fm.register_gcode_processor(
            PROCESSOR_NAME,
            {
                "name": PROCESSOR_NAME,
                "version": "v1",
                "command": [sys.executable, self.extractor_path, "{gcode_file_path}"],
                "timeout": self.timeout,
                "ident": {
                    "regex": FOOTER_REGEX,
                    "location": "footer",
                },
            },
        )
        self.logger.info(
            "CncMetadata: registered processor '%s' (command=[%s, %s, '{{gcode_file_path}}'], timeout=%.1fs)",
            PROCESSOR_NAME,
            sys.executable,
            self.extractor_path,
            self.timeout,
        )


def load_component(config):
    return CncMetadata(config)
