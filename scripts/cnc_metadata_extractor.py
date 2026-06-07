#!/usr/bin/env python3
"""
CNC gcode metadata extractor.

Reads a gcode file, detects which CAM tool produced it, extracts work
envelope / tools / feeds / spindle, and writes a `<basename>.cnc-meta.json`
sidecar next to it. Idempotent: files already tagged with the
`; CNC-METADATA-V1` footer are skipped.

Invocation:
    python3 cnc_metadata_extractor.py [--force] <path-to-gcode>

Flags:
    --force   re-extract even if the file was just modified
              (bypasses the 60-second mtime safety check)

Exit codes:
    0  processed (sidecar written or file skipped as a no-op)
    1  hard error (file unreadable, etc.)
    2  bad arguments
"""

import json
import logging
import os
import re
import sys
from typing import Any, Dict, List, Optional, Tuple

SCHEMA_VERSION = 1
FOOTER_MARKER = "; CNC-METADATA-V1"
HEADER_READ_BYTES = 1_048_576
MOVE_SAMPLE_LIMIT = 10_000
MIN_FILE_AGE_SECONDS = 60

log = logging.getLogger("cnc_metadata_extractor")

CAM_DETECTORS: List[Tuple[str, str, re.Pattern]] = [
    (
        "Fusion 360",
        "fusion",
        re.compile(
            r"(?:^; ?Fusion CAM\b|; ?Autodesk Fusion|; ?F360 CAM|; ?Posts processor:)",
            re.IGNORECASE | re.MULTILINE,
        ),
    ),
    ("EstlCam", "estlcam", re.compile(r"(?:^; ?ESTLCAM|estlcam|camext)", re.IGNORECASE | re.MULTILINE)),
    ("VCarve", "vcarve", re.compile(r"(?:VCarve Post Processor|; ?VCarve Pro)", re.IGNORECASE | re.MULTILINE)),
    ("FreeCAD Path", "freecad", re.compile(r"(?:; ?FreeCAD Path|\(FreeCAD\))", re.IGNORECASE | re.MULTILINE)),
    ("bCNC", "bcnc", re.compile(r"(?:^; ?bCNC|;BCN)", re.IGNORECASE | re.MULTILINE)),
    ("CamBam", "cambam", re.compile(r"(?:\(CamBam|; ?CamBam)", re.IGNORECASE | re.MULTILINE)),
    ("MeshCAM", "meshcam", re.compile(r"(?:\(MeshCAM|; ?MeshCAM)", re.IGNORECASE | re.MULTILINE)),
]


def sidecar_path_for(gcode_path: str) -> str:
    return gcode_path + ".cnc-meta.json"


def is_already_processed(gcode_path: str) -> bool:
    try:
        with open(gcode_path, "rb") as f:
            if os.path.getsize(gcode_path) > 8192:
                f.seek(-8192, os.SEEK_END)
                tail = f.read(8192)
            else:
                f.seek(0)
                tail = f.read()
    except OSError:
        return False
    return FOOTER_MARKER.encode("ascii") in tail


def is_too_young(gcode_path: str) -> bool:
    try:
        mtime = os.path.getmtime(gcode_path)
    except OSError:
        return False
    import time
    return (time.time() - mtime) < MIN_FILE_AGE_SECONDS


def read_head_and_tail(gcode_path: str) -> Tuple[str, str]:
    size = os.path.getsize(gcode_path)
    with open(gcode_path, "r", errors="replace") as f:
        head = f.read(HEADER_READ_BYTES)
        if size > HEADER_READ_BYTES * 2:
            f.seek(size - HEADER_READ_BYTES)
            tail = f.read()
        elif size > HEADER_READ_BYTES:
            tail = head[-(size - HEADER_READ_BYTES):] + f.read()
        else:
            tail = head
    return head, tail


def detect_cam(head: str, tail: str) -> Optional[Dict[str, str]]:
    sample = head + "\n" + tail[:4096]
    for nice_name, slug, pattern in CAM_DETECTORS:
        if pattern.search(sample):
            info: Dict[str, str] = {"cam_tool": nice_name, "cam_tool_slug": slug}
            if slug == "fusion":
                m = re.search(r";Fusion CAM\s+([\d.]+)", head)
                if m:
                    info["cam_tool_version"] = m.group(1)
                m = re.search(r";\s*Posts processor:\s*(\S+)", head)
                if m:
                    info["post_processor"] = m.group(1)
                m = re.search(r";\s*Document:\s*(.+)", head)
                if m:
                    info["document"] = m.group(1).strip()
                m = re.search(r";\s*Setup:\s*(.+)", head)
                if m:
                    info["setup"] = m.group(1).strip()
            return info
    return None


def extract_envelope(gcode_path: str) -> Optional[Dict[str, float]]:
    xmin = ymin = zmin = float("inf")
    xmax = ymax = zmax = float("-inf")
    found = False
    move_re = re.compile(r"^G[01]\b")
    coord_re = re.compile(r"\b([XYZ])([+-]?\d*\.?\d+)")
    with open(gcode_path, "r", errors="replace") as f:
        for i, line in enumerate(f):
            if i > MOVE_SAMPLE_LIMIT:
                break
            if not move_re.match(line):
                continue
            coords = {axis: float(val) for axis, val in coord_re.findall(line)}
            if not coords:
                continue
            found = True
            if "X" in coords:
                xmin = min(xmin, coords["X"])
                xmax = max(xmax, coords["X"])
            if "Y" in coords:
                ymin = min(ymin, coords["Y"])
                ymax = max(ymax, coords["Y"])
            if "Z" in coords:
                zmin = min(zmin, coords["Z"])
                zmax = max(zmax, coords["Z"])
    if not found:
        return None
    return {
        "x_min": round(xmin, 3),
        "x_max": round(xmax, 3),
        "y_min": round(ymin, 3),
        "y_max": round(ymax, 3),
        "z_min": round(zmin, 3),
        "z_max": round(zmax, 3),
    }


def extract_tools_fusion(head: str) -> List[Dict[str, Any]]:
    tools: List[Dict[str, Any]] = []
    for m in re.finditer(r"\bT(\d+)\s+D([+-]?\d*\.?\d+)(?:\s+CR([+-]?\d*\.?\d+))?", head):
        tools.append(
            {
                "id": f"T{m.group(1)}",
                "diameter_mm": float(m.group(2)),
                "corner_radius_mm": float(m.group(3)) if m.group(3) else None,
            }
        )
    return tools


def extract_tools_estlcam(head: str) -> List[Dict[str, Any]]:
    tools: List[Dict[str, Any]] = []
    for m in re.finditer(r"^T(\d+)\s*=\s*(.+)$", head, re.MULTILINE):
        tools.append({"id": f"T{m.group(1)}", "name": m.group(2).strip()})
    return tools


def extract_tools(head: str, slug: str) -> List[Dict[str, Any]]:
    if slug == "fusion":
        return extract_tools_fusion(head)
    if slug == "estlcam":
        return extract_tools_estlcam(head)
    return []


def extract_spindle(head: str) -> Optional[float]:
    m = re.search(r"\bS(\d+(?:\.\d+)?)\b", head)
    if m:
        return float(m.group(1))
    return None


def extract_feeds(head: str) -> Dict[str, float]:
    feeds: Dict[str, float] = {}
    last_feed: Optional[float] = None
    move_re = re.compile(r"^(G0?[01])\b")
    feed_re = re.compile(r"\bF(\d+(?:\.\d+)?)")
    for line in head.splitlines():
        fm = feed_re.search(line)
        if fm:
            last_feed = float(fm.group(1))
        m = move_re.match(line)
        if not m:
            continue
        g = m.group(1).upper()
        feed_value = last_feed
        if feed_value is None:
            continue
        if g.startswith("G0"):
            feeds["rapid"] = feed_value
        elif g.startswith("G1"):
            feeds["cut"] = feed_value
            if "Z" in line:
                feeds["plunge"] = feed_value
    return feeds


def extract_operations(head: str) -> List[Dict[str, str]]:
    ops: List[Dict[str, str]] = []
    for m in re.finditer(r"\(([^)]+)\)", head):
        name = m.group(1).strip()
        if not name or name.startswith("T") or name.startswith("M") or name.startswith("G"):
            continue
        if any(c in name for c in "\n\r"):
            continue
        ops.append({"name": name})
    for m in re.finditer(r";\s*(?:Toolpath|Operation|Op|Operation Name)\s*:\s*(.+)", head, re.IGNORECASE):
        name = m.group(1).strip()
        if not name:
            continue
        ops.append({"name": name})
    seen = set()
    deduped = []
    for op in ops:
        if op["name"] in seen:
            continue
        seen.add(op["name"])
        deduped.append(op)
    return deduped[:32]


def build_metadata(gcode_path: str, cam: Optional[Dict[str, str]]) -> Dict[str, Any]:
    head, _tail = read_head_and_tail(gcode_path)
    meta: Dict[str, Any] = {
        "schema_version": SCHEMA_VERSION,
        "source_file": os.path.basename(gcode_path),
    }
    if cam:
        meta.update(cam)
    envelope = extract_envelope(gcode_path)
    if envelope:
        meta["work_envelope"] = envelope
    if cam:
        tools = extract_tools(head, cam.get("cam_tool_slug", ""))
        if tools:
            meta["tools"] = tools
    spindle = extract_spindle(head)
    if spindle is not None:
        meta["spindle_rpm"] = spindle
    feeds = extract_feeds(head)
    if feeds:
        meta["feeds_mm_per_min"] = feeds
    ops = extract_operations(head)
    if ops:
        meta["operations"] = ops
        meta["operation_count"] = len(ops)
    return meta


def append_footer(gcode_path: str) -> None:
    if is_already_processed(gcode_path):
        return
    with open(gcode_path, "a", encoding="utf-8") as f:
        f.write(f"\n{FOOTER_MARKER}\n")


def write_sidecar(gcode_path: str, meta: Dict[str, Any]) -> str:
    out = sidecar_path_for(gcode_path)
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, sort_keys=True)
        f.write("\n")
    os.replace(tmp, out)
    return out


def process(gcode_path: str, force: bool = False) -> int:
    if not os.path.isfile(gcode_path):
        log.error("file not found: %s", gcode_path)
        return 1
    if is_already_processed(gcode_path) and not force:
        log.info("already processed: %s", gcode_path)
        return 0
    if is_too_young(gcode_path) and not force:
        log.info("file too young, skipping: %s", gcode_path)
        return 0
    head, tail = read_head_and_tail(gcode_path)
    cam = detect_cam(head, tail)
    if cam is None:
        log.info("no CAM signature in %s — no sidecar written", gcode_path)
        return 0
    meta = build_metadata(gcode_path, cam)
    write_sidecar(gcode_path, meta)
    append_footer(gcode_path)
    log.info("wrote %s (cam_tool=%s)", sidecar_path_for(gcode_path), cam.get("cam_tool"))
    return 0


def main(argv: List[str]) -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    force = False
    args = list(argv[1:])
    while args and args[0].startswith("-"):
        if args[0] == "--force":
            force = True
            args.pop(0)
        else:
            print(__doc__, file=sys.stderr)
            return 2
    if len(args) != 1:
        print(__doc__, file=sys.stderr)
        return 2
    try:
        return process(args[0], force=force)
    except Exception:
        log.exception("extractor failed")
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
