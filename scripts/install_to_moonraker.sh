#!/usr/bin/env bash
# Deploy mainsail-cnc to a BTT-CB1 (or any Moonraker host).
#
# Idempotent. Re-runnable. Safe to interrupt before the restart step.
#
# What it does:
#   1. clones (or pulls) the mainsail-cnc monorepo to ~/mainsail-cnc
#      on the target, so the agent source, the Mainsail fork, and the
#      Klipper macros all share one real git working tree
#   2. vendors the cnc_agent component from
#      <monorepo>/moonraker-cnc-agent/src/... into
#      moonraker/moonraker/components/cnc_agent/ so Moonraker's
#      `import moonraker.components.cnc_agent` resolves
#   3. vendors the cnc_metadata component (gcode_file processor) from
#      the same source dir into moonraker/components/cnc_metadata/
#   4. copies scripts/cnc_metadata_extractor.py to
#      ~/printer_data/scripts/ on the target and chmods it executable
#   5. ensures the `[cnc_agent]` section is present in the active
#      moonraker.conf
#   6. ensures the `[cnc_metadata]` section is present in the active
#      moonraker.conf
#   7. deploys work_coordinate_systems.py to klippy/extras/
#   8. deploys wcs_macros.cfg to printer_data/config/macros/
#   9. (if not skipped) appends a single `[update_manager mainsail-cnc]`
#      section pointing at the monorepo so Mainsail's Update Manager
#      shows the project and can `git pull` it
#  10. restarts moonraker
#  11. waits for moonraker to come back up and checks the journal for a
#      clean "CncAgent component initialized." log line
#
# Usage:
#   ./scripts/install_to_moonraker.sh                       # deploys to $CNC_HOST (default: cnc)
#   CNC_HOST=myprinter ./scripts/install_to_moonraker.sh
#   CNC_HOST=user@host:2222 ./scripts/install_to_moonraker.sh
#
# Environment overrides (all optional):
#   CNC_HOST                  SSH target (default: cnc).
#   CNC_REPO_DIR              Path on the TARGET where the monorepo
#                             is cloned (default: ~/mainsail-cnc).
#   CNC_REPO_URL              Git origin to clone on the target
#                             (default: the local clone's `origin`
#                             remote, falling back to the public fork).
#   CNC_CHANNEL               Update channel (default: dev). Use
#                             `stable` once a stable release is tagged.
#   CNC_SKIP_UPDATE_MANAGER=1      Skip the [update_manager] append
#                                  entirely (steps 1 + 4 still run).
#   CNC_SKIP_CLONE=1               Skip step 1 entirely — use the
#                                  existing clone at $CNC_REPO_DIR
#                                  as-is. For users who manage the
#                                  monorepo checkout themselves.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CNC_HOST="${CNC_HOST:-cnc}"

if [[ ! -d "$REPO_ROOT/moonraker-cnc-agent/src/moonraker_cnc_agent" ]]; then
    echo "error: $REPO_ROOT/moonraker-cnc-agent/src/moonraker_cnc_agent not found" >&2
    exit 1
fi

REMOTE_HOME=$(ssh -o BatchMode=yes "$CNC_HOST" 'echo $HOME')
REMOTE_COMPONENTS_DIR="$REMOTE_HOME/moonraker/moonraker/components"
REMOTE_CNC_PKG="$REMOTE_COMPONENTS_DIR/cnc_agent"
REMOTE_CNC_METADATA_PKG="$REMOTE_COMPONENTS_DIR/cnc_metadata"
REMOTE_EXTRACTOR_SCRIPT_DIR="$REMOTE_HOME/printer_data/scripts"
REMOTE_EXTRACTOR_PATH="$REMOTE_EXTRACTOR_SCRIPT_DIR/cnc_metadata_extractor.py"
REMOTE_CONF="$REMOTE_HOME/printer_data/config/moonraker.conf"
REMOTE_KLIPPER_EXTRAS="$REMOTE_HOME/klipper/klippy/extras"
REMOTE_MACROS_DIR="$REMOTE_HOME/printer_data/config/macros"
CNC_CHANNEL="${CNC_CHANNEL:-dev}"

# Resolve paths on the target. Leading `~` is expanded against REMOTE_HOME;
# absolute paths pass through untouched.
#
# Note: bash 3.2 (the version macOS ships) treats a bare `~` in parameter-
# expansion patterns as the home-directory prefix rather than a literal
# character, so we escape it: `${p#\~}`. This works on bash 3.2 *and* 4+.
expand_remote_path() {
    local p="$1"
    case "$p" in
        "~"|"~/"*) printf '%s\n' "$REMOTE_HOME${p#\~}" ;;
        *)         printf '%s\n' "$p" ;;
    esac
}

REMOTE_REPO_DIR=$(expand_remote_path "${CNC_REPO_DIR:-~/mainsail-cnc}")

# Resolve the repo URL from the local clone's `origin` remote, falling
# back to the default public fork.
if [[ -z "${CNC_REPO_URL:-}" ]]; then
    CNC_REPO_URL="$(git -C "$REPO_ROOT" config --get remote.origin.url 2>/dev/null || true)"
fi
CNC_REPO_URL="${CNC_REPO_URL:-https://github.com/isaaceliape/mainsail-cnc.git}"

echo "==> Target: $CNC_HOST  (home=$REMOTE_HOME)"
echo "==> Repo URL: $CNC_REPO_URL  (channel=$CNC_CHANNEL)"
echo "==> Monorepo dir: $REMOTE_REPO_DIR"

# Tempfile for the [update_manager] block before pushing to the target.
APPEND_BLOCK="$(mktemp)"
trap 'rm -f "$APPEND_BLOCK"' EXIT

# ---------------------------------------------------------------------------
# 1) clone (or pull) the monorepo on the target
# ---------------------------------------------------------------------------
# This is the single source of truth for the agent, the Mainsail fork,
# and the Klipper macros on the printer. Each Mainsail-driven update
# just runs `git pull` on this clone, so the directory has to be a
# real git checkout of the project, not a synthetic subpath.
if [[ "${CNC_SKIP_CLONE:-0}" == "1" ]]; then
    echo "==> [1/11] SKIPPED (CNC_SKIP_CLONE=1) — using existing $REMOTE_REPO_DIR as-is"
else
    echo "==> [1/11] clone (or pull) monorepo at $REMOTE_REPO_DIR"
    ssh "$CNC_HOST" "
        set -e
        if [[ ! -d '$REMOTE_REPO_DIR/.git' ]]; then
            mkdir -p '$(dirname "$REMOTE_REPO_DIR")'
            git clone '$CNC_REPO_URL' '$REMOTE_REPO_DIR'
            echo '    cloned'
        else
            cd '$REMOTE_REPO_DIR'
            # --ff-only is safe for a deploy artifact: if the local clone
            # has diverged (someone committed on the printer) the user
            # will need to resolve it manually, which is the right
            # behaviour for a deploy target.
            if git pull --ff-only 2>&1; then
                echo '    pulled (ff)'
            else
                echo '    pull failed (likely diverged or offline); leaving working tree as-is' >&2
            fi
        fi
    "
fi

REMOTE_AGENT_SRC="$REMOTE_REPO_DIR/moonraker-cnc-agent/src/moonraker_cnc_agent"

# ---------------------------------------------------------------------------
# 2) vendor the cnc_agent component into moonraker/components/cnc_agent/
# ---------------------------------------------------------------------------
echo "==> [2/11] vendor cnc_agent into moonraker/components/cnc_agent/"
ssh "$CNC_HOST" "
    set -e
    rm -rf '$REMOTE_CNC_PKG'
    mkdir -p '$REMOTE_CNC_PKG'
    install -m 0644 '$REMOTE_AGENT_SRC/cnc_agent.py' '$REMOTE_CNC_PKG/cnc_agent.py'
    # __init__.py re-exports load_component so Moonraker can import
    # moonraker.components.cnc_agent and find load_component on the package.
    cat > '$REMOTE_CNC_PKG/__init__.py' <<'PY'
from .cnc_agent import load_component
__all__ = ['load_component']
PY
    echo '    vendored at: '$REMOTE_CNC_PKG
    ls -la '$REMOTE_CNC_PKG'
"

# ---------------------------------------------------------------------------
# 3) vendor the cnc_metadata component into moonraker/components/cnc_metadata/
# ---------------------------------------------------------------------------
echo "==> [3/11] vendor cnc_metadata into moonraker/components/cnc_metadata/"
ssh "$CNC_HOST" "
    set -e
    rm -rf '$REMOTE_CNC_METADATA_PKG'
    mkdir -p '$REMOTE_CNC_METADATA_PKG'
    install -m 0644 '$REMOTE_AGENT_SRC/cnc_metadata.py' '$REMOTE_CNC_METADATA_PKG/cnc_metadata.py'
    cat > '$REMOTE_CNC_METADATA_PKG/__init__.py' <<'PY'
from .cnc_metadata import load_component
__all__ = ['load_component']
PY
    echo '    vendored at: '$REMOTE_CNC_METADATA_PKG
    ls -la '$REMOTE_CNC_METADATA_PKG'
"

# ---------------------------------------------------------------------------
# 4) deploy the extractor script to ~/printer_data/scripts/
# ---------------------------------------------------------------------------
echo "==> [4/11] deploy cnc_metadata_extractor.py to $REMOTE_EXTRACTOR_SCRIPT_DIR"
REMOTE_EXTRACTOR_SRC="$REMOTE_REPO_DIR/scripts/cnc_metadata_extractor.py"
if [[ ! -f "$REPO_ROOT/scripts/cnc_metadata_extractor.py" ]]; then
    echo "    FAILED — local extractor not found at $REPO_ROOT/scripts/cnc_metadata_extractor.py" >&2
    exit 1
fi
ssh "$CNC_HOST" "
    set -e
    if [[ ! -f '$REMOTE_EXTRACTOR_SRC' ]]; then
        echo '    FAILED — extractor not found in cloned monorepo at '\$REMOTE_EXTRACTOR_SRC >&2
        exit 1
    fi
    mkdir -p '$REMOTE_EXTRACTOR_SCRIPT_DIR'
    install -m 0755 '$REMOTE_EXTRACTOR_SRC' '$REMOTE_EXTRACTOR_PATH'
    echo '    installed at: '$REMOTE_EXTRACTOR_PATH
"

# ---------------------------------------------------------------------------
# 5) ensure [cnc_agent] section
# ---------------------------------------------------------------------------
echo "==> [5/11] ensure [cnc_agent] section in $REMOTE_CONF"
ssh "$CNC_HOST" "
    set -e
    if ! grep -qE '^\[cnc_agent\]' '$REMOTE_CONF'; then
        printf '\n# CNC agent (installed by mainsail-cnc install_to_moonraker.sh)\n[cnc_agent]\n' >> '$REMOTE_CONF'
        echo '    appended [cnc_agent] section'
    else
        echo '    [cnc_agent] section already present'
    fi
"

# ---------------------------------------------------------------------------
# 6) ensure [cnc_metadata] section
# ---------------------------------------------------------------------------
echo "==> [6/11] ensure [cnc_metadata] section in $REMOTE_CONF"
ssh "$CNC_HOST" "
    set -e
    if ! grep -qE '^\[cnc_metadata\]' '$REMOTE_CONF'; then
        printf '\n# CNC metadata extractor (installed by mainsail-cnc install_to_moonraker.sh)\n[cnc_metadata]\nextractor_path: %s\ntimeout: 30.0\n' '$REMOTE_EXTRACTOR_PATH' >> '$REMOTE_CONF'
        echo '    appended [cnc_metadata] section'
    else
        echo '    [cnc_metadata] section already present'
    fi
"

# ---------------------------------------------------------------------------
# 7) deploy Klipper extra: work_coordinate_systems.py
# ---------------------------------------------------------------------------
echo "==> [7/11] deploy work_coordinate_systems.py to klippy/extras/"
REMOTE_WCS_EXTRAS_SRC="$REMOTE_REPO_DIR/klipper-extras/work_coordinate_systems.py"
ssh "$CNC_HOST" "
    set -e
    if [[ ! -f '$REMOTE_WCS_EXTRAS_SRC' ]]; then
        echo '    skipping — klipper-extras/work_coordinate_systems.py not found in monorepo'
    else
        install -m 0644 '$REMOTE_WCS_EXTRAS_SRC' '$REMOTE_KLIPPER_EXTRAS/work_coordinate_systems.py'
        echo '    installed at: '\$REMOTE_KLIPPER_EXTRAS/work_coordinate_systems.py
    fi
"

# ---------------------------------------------------------------------------
# 8) deploy WCS macros
# ---------------------------------------------------------------------------
echo "==> [8/11] deploy wcs_macros.cfg to printer_data/config/macros/"
REMOTE_WCS_MACROS_SRC="$REMOTE_REPO_DIR/klipper-macros/wcs_macros.cfg"
ssh "$CNC_HOST" "
    set -e
    if [[ ! -f '$REMOTE_WCS_MACROS_SRC' ]]; then
        echo '    skipping — klipper-macros/wcs_macros.cfg not found in monorepo'
    else
        mkdir -p '$REMOTE_MACROS_DIR'
        install -m 0644 '$REMOTE_WCS_MACROS_SRC' '$REMOTE_MACROS_DIR/wcs_macros.cfg'
        echo '    installed at: '\$REMOTE_MACROS_DIR/wcs_macros.cfg
    fi
"

# ---------------------------------------------------------------------------
# 9) append [update_manager mainsail-cnc] section (idempotent)
# ---------------------------------------------------------------------------
if [[ "${CNC_SKIP_UPDATE_MANAGER:-0}" == "1" ]]; then
    echo "==> [9/11] SKIPPED (CNC_SKIP_UPDATE_MANAGER=1)"
else
    echo "==> [9/11] append [update_manager mainsail-cnc] section to $REMOTE_CONF"
    # Pull a local copy of the remote conf so we can decide whether to
    # append. Only the section header needs to be inspected.
    REMOTE_CONF_LOCAL="$(mktemp)"
    trap 'rm -f "$APPEND_BLOCK" "$REMOTE_CONF_LOCAL"' EXIT

    ssh "$CNC_HOST" "cat '$REMOTE_CONF'" > "$REMOTE_CONF_LOCAL"

    if grep -qE '^\[update_manager mainsail-cnc\]' "$REMOTE_CONF_LOCAL"; then
        echo "    [update_manager mainsail-cnc] already present in $REMOTE_CONF"
    else
        # printf is used (not a heredoc) so backticks in the post_update
        # hint are emitted literally and not re-evaluated by the shell.
        {
            printf '\n# -------------------------------------------------------------------------\n'
            printf '# mainsail-cnc update-manager entry (installed by install_to_moonraker.sh)\n'
            printf '# -------------------------------------------------------------------------\n\n'
            printf '[update_manager mainsail-cnc]\n'
            printf 'type: git_repo\n'
            printf 'channel: %s\n' "$CNC_CHANNEL"
            printf 'path: %s\n' "$REMOTE_REPO_DIR"
            printf 'origin: %s\n' "$CNC_REPO_URL"
            printf 'primary_branch: main\n'
            printf 'enable_node_updates: False\n'
            printf 'is_system_service: False\n'
            printf 'info_tags:\n'
            printf '    desc=Mainsail-CNC\n'
            printf '    post_update=Re-run ./scripts/install_to_moonraker.sh to re-vendor the agent; `bun run build` in upstream-mainsail/ and refresh; RESTART Klipper for the macros.\n'
            printf 'managed_services: moonraker\n'
            printf 'refresh_interval: 24\n'
        } > "$APPEND_BLOCK"

        cat "$APPEND_BLOCK" | ssh "$CNC_HOST" "cat >> '$REMOTE_CONF'"
        echo "    appended [update_manager mainsail-cnc] to $REMOTE_CONF"
    fi
fi

# ---------------------------------------------------------------------------
# 10) restart moonraker
# ---------------------------------------------------------------------------
echo "==> [10/11] restart moonraker"
ssh "$CNC_HOST" "sudo systemctl restart moonraker"

# ---------------------------------------------------------------------------
# 11) wait for moonraker and verify CncAgent loaded cleanly
# ---------------------------------------------------------------------------
echo "==> [11/11] wait for moonraker and verify CncAgent loaded cleanly"
for i in {1..30}; do
    if ssh -o ConnectTimeout=2 "$CNC_HOST" "curl -fsS http://127.0.0.1:7125/printer/info" >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

if ! ssh -o ConnectTimeout=2 "$CNC_HOST" "curl -fsS http://127.0.0.1:7125/printer/info" >/dev/null 2>&1; then
    echo "    FAILED — moonraker did not come back up in 30s" >&2
    echo "    check: ssh $CNC_HOST 'sudo journalctl -u moonraker -n 80 --no-pager'" >&2
    exit 1
fi

# Give cnc_agent a moment to initialize and Klipper to report ready
sleep 3

# Pull a window of recent logs to check load status. The 'Klipper is ready,
# CncAgent is active.' line is the strongest signal — it only fires if
# __init__ completed and registered the klippy_ready handler.
RECENT_LOGS=$(ssh "$CNC_HOST" "sudo journalctl -u moonraker --since '2 minutes ago' --no-pager 2>&1" || true)

INIT_LINE=$(echo "$RECENT_LOGS" | grep -E 'CncAgent component initialized' | tail -1 || true)
READY_LINE=$(echo "$RECENT_LOGS" | grep -E 'CncAgent is active' | tail -1 || true)
ERROR_LINES=$(echo "$RECENT_LOGS" | grep -E 'cnc_agent|CncAgent' | grep -iE 'error|exception|traceback' || true)

if [[ -n "$INIT_LINE" ]]; then
    echo "    OK: $INIT_LINE"
fi
if [[ -n "$READY_LINE" ]]; then
    echo "    OK: $READY_LINE"
fi
if [[ -z "$INIT_LINE" && -z "$READY_LINE" ]]; then
    echo "    FAILED — no CncAgent init/ready log lines in last 2 minutes" >&2
    echo "    recent cnc-related lines:" >&2
    echo "$RECENT_LOGS" | grep -E 'cnc_agent|CncAgent' | sed 's/^/      /' >&2
    exit 1
fi
if [[ -n "$ERROR_LINES" ]]; then
    echo "    FAILED — error lines referencing cnc_agent:" >&2
    echo "$ERROR_LINES" | sed 's/^/      /' >&2
    exit 1
fi

echo "==> Done."
