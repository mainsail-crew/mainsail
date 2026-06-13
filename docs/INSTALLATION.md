---
title: Installing Mainsail-CNC
description: Learn how to install Mainsail-CNC — a CNC-focused fork of Mainsail with native dashboard panels, CAM metadata support, and a Moonraker CNC agent.
---

# Installing Mainsail-CNC

Mainsail-CNC is a maintained fork of [Mainsail](https://github.com/mainsail-crew/mainsail) extended with CNC-native
dashboard panels, CNC-specific navigation terminology, file-card CAM metadata enrichment, and a Moonraker-side CNC
agent for spindle, coolant, WCS, and jog management.

This guide covers two installation paths:

| Path | Difficulty | Best for |
|------|------------|----------|
| [Quick install via KIAUH](#quick-install-via-kiauh) | Easy | Beginners, standard Raspberry Pi / Debian setups |
| [Manual install](#manual-install) | Advanced | Full control, custom hardware, existing Klipper installs |

!!! warning "Fork vs plugin"
    Mainsail-CNC is **not** a Mainsail plugin. It is a full fork of the Mainsail frontend. You replace the stock
    Mainsail web files with the built output of this fork. Your existing Klipper and Moonraker configuration is not
    affected.

## Prerequisites

- **A Debian-based system:** Raspberry Pi (3A+ or newer recommended), BTT-CB1, Odroid, or any x86 Linux machine.
- **SSH access** to your device.
- **Internet connection** for downloading packages and the repository.
- **Klipper and Moonraker already installed** (the install scripts below handle Mainsail-CNC only; Klipper/Moonraker
  must be set up separately — see the [Klipper docs](https://www.klipper3d.org/) and
  [Moonraker docs](https://moonraker.readthedocs.io/) if needed).

## Quick Install via KIAUH

[KIAUH](https://github.com/dw-0/kiauh) (Klipper Install And Update Helper) simplifies installing Klipper, Moonraker,
and web interfaces on Debian-based systems.

### 1. Install KIAUH

```bash
sudo apt update && sudo apt install git -y
cd ~ && git clone https://github.com/dw-0/kiauh.git
./kiauh/kiauh.sh
```

### 2. Install Klipper and Moonraker

In the KIAUH interactive menu:

1. Select **[Install]** → **[Install Klipper]** and follow the prompts.
2. Select **[Install]** → **[Install Moonraker]** and follow the prompts.

### 3. Install Mainsail (temporary)

Still in KIAUH, select **[Install]** → **[Install Mainsail]**. This gives you a working stock Mainsail installation
at `~/mainsail/`. We will replace it with the CNC fork in the next step.

### 4. Replace with Mainsail-CNC fork

SSH into your device and run:

```bash
# Remove stock Mainsail
rm -rf ~/mainsail/*
rm -rf ~/mainsail/.* 2>/dev/null || true

# Clone the CNC fork
git clone https://github.com/isaaceliape/mainsail-cnc.git ~/mainsail-cnc

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Build the fork
cd ~/mainsail-cnc
bun install --frozen-lockfile
bun run build

# Deploy built files to the Mainsail web directory
cp -a dist/* ~/mainsail/
cp dist/.* ~/mainsail/ 2>/dev/null || true
```

### 5. Add the CNC agent to Moonraker

```bash
cd ~/mainsail-cnc
./scripts/install_to_moonraker.sh
```

This script:
- Vendors the `cnc_agent` and `cnc_metadata` components into Moonraker's Python package.
- Appends `[cnc_agent]` and `[cnc_metadata]` sections to your `moonraker.conf`.
- Registers the fork in Moonraker's update manager.
- Restarts Moonraker and verifies the agent loaded cleanly.

### 6. Reload Moonraker

```bash
sudo systemctl restart moonraker
```

### 7. Access Mainsail-CNC

Open your browser and navigate to `http://<your-device-ip>`. You should see the CNC dashboard with panels for DRO,
Jog, Offsets, Spindle & Coolant, and CNC Status.

---

## Manual Install

This guide provides a detailed, step-by-step process for manually setting up Mainsail-CNC. It is intended for advanced
users who prefer complete control over their installation and configuration.

!!! warning "Username"
    This guide uses the default username `pi`. If your system uses a different username (e.g., `biqu` on a BTT-CB1),
    replace `pi` with your actual username in all commands and paths.

### System Requirements and Preparation

#### Hardware Requirements

- **Single-Board Computer (SBC) or Linux Machine:** Raspberry Pi (3A+ or newer), BTT-CB1, Odroid, or x86 server.
  Minimum: multi-core CPU, 512 MB RAM. Recommended: 1 GB+ RAM for on-device builds.
- **MicroSD Card (for Raspberry Pi):** 16 GB minimum. 32 GB+ if storing many G-code files.

#### Operating System

Debian-based Linux distribution. Update your system:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git unzip curl
```

### Step 1: Install Klipper

See the [Klipper installation guide](https://www.klipper3d.org/Installation.html) for full instructions. At minimum:

```bash
cd ~
git clone https://github.com/Klipper3d/klipper
virtualenv -p python3 ~/klippy-env
~/klippy-env/bin/pip install -r ~/klipper/scripts/klippy-requirements.txt
```

Create the printer data directory structure:

```bash
mkdir -p ~/printer_data/{config,logs,gcodes,systemd,comms}
touch ~/printer_data/config/printer.cfg
```

Create the systemd service (`/etc/systemd/system/klipper.service`):

```ini
[Unit]
Description=Klipper 3D Printer Firmware
After=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/klipper
ExecStart=/home/pi/klippy-env/bin/python /home/pi/klipper/klippy/klippy.py \
    /home/pi/printer_data/config/printer.cfg \
    -l /home/pi/printer_data/logs/klippy.log \
    -I /home/pi/printer_data/comms/klippy.serial \
    -a /home/pi/printer_data/comms/klippy.sock
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable klipper
sudo systemctl start klipper
```

### Step 2: Install Moonraker

```bash
cd ~
git clone https://github.com/Arksine/moonraker.git
virtualenv -p python3 ~/moonraker-env
~/moonraker-env/bin/pip install -r ~/moonraker/scripts/moonraker-requirements.txt
```

Create `~/printer_data/config/moonraker.conf`:

```ini
[server]
host: 0.0.0.0
port: 7125
max_upload_size: 1024
klippy_uds_address: ~/printer_data/comms/klippy.sock

[file_manager]
enable_object_processing: True

[authorization]
trusted_clients:
    10.0.0.0/8
    127.0.0.0/8
    169.254.0.0/16
    172.16.0.0/12
    192.168.0.0/16
    FE80::/10
    ::1/128

[octoprint_compat]
[history]

[announcements]
subscriptions:
    mainsail

[update_manager]
refresh_interval: 168
enable_auto_refresh: True

[update_manager mainsail]
type: web
channel: stable
repo: mainsail-crew/mainsail
path: ~/mainsail
```

Create the systemd service (`/etc/systemd/system/moonraker.service`):

```ini
[Unit]
Description=Moonraker API
After=network-online.target
Wants=klipper.service

[Service]
Type=simple
User=pi
EnvironmentFile=/home/pi/printer_data/systemd/moonraker.env
ExecStart=/home/pi/moonraker-env/bin/python $MOONRAKER_ARGS
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Create `~/printer_data/systemd/moonraker.env`:

```bash
MOONRAKER_ARGS="/home/pi/moonraker/moonraker/moonraker.py -c /home/pi/printer_data/config/moonraker.conf -l /home/pi/printer_data/logs/moonraker.log"
```

```bash
sudo systemctl enable moonraker
sudo systemctl start moonraker
```

### Step 3: Install Nginx (web server)

```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/mainsail`:

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /home/pi/mainsail;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy Moonraker WebSocket
    location /websocket {
        proxy_pass http://127.0.0.1:7125/websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Moonraker API
    location /server/ {
        proxy_pass http://127.0.0.1:7125;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/mainsail /etc/nginx/sites-enabled/mainsail
sudo nginx -t && sudo systemctl reload nginx
```

### Step 4: Install Mainsail-CNC Fork

#### 4.1 Install Bun

Mainsail-CNC uses **Bun** (not npm) for building.

```bash
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
```

Verify:

```bash
bun --version
```

#### 4.2 Clone and build

```bash
cd ~
git clone https://github.com/isaaceliape/mainsail-cnc.git
cd mainsail-cnc
bun install --frozen-lockfile
bun run build
```

This produces a `dist/` directory with the compiled frontend.

#### 4.3 Deploy to the web directory

```bash
# Remove any existing Mainsail files (preserving config.json if present)
cd ~/mainsail
find . -type f -not -name 'config.json' -delete
find . -mindepth 1 -type d -empty -delete

# Copy built files
cp -a ~/mainsail-cnc/dist/* .
cp ~/mainsail-cnc/dist/.* . 2>/dev/null || true
```

Or use the deploy script:

```bash
cd ~/mainsail-cnc
./deploy.sh --live
```

### Step 5: Install the Moonraker CNC Agent

The CNC agent provides endpoints for spindle, coolant, WCS management, and jog commands.

```bash
cd ~/mainsail-cnc
./scripts/install_to_moonraker.sh
```

The script performs the following:

1. Clones (or pulls) the monorepo to `~/mainsail-cnc`
2. Vendors `cnc_agent` into `moonraker/moonraker/components/cnc_agent/`
3. Vendors `cnc_metadata` into `moonraker/moonraker/components/cnc_metadata/`
4. Deploys `cnc_metadata_extractor.py` to `~/printer_data/scripts/`
5. Appends `[cnc_agent]` and `[cnc_metadata]` sections to `moonraker.conf` (idempotent)
6. Appends `[update_manager mainsail-cnc]` to `moonraker.conf` (idempotent)
7. Restarts Moonraker
8. Verifies the agent loaded cleanly in the journal logs

### Step 6: Verify Installation

#### Check Moonraker is running

```bash
curl -s http://127.0.0.1:7125/printer/info | python3 -m json.tool
```

#### Check CNC agent loaded

```bash
sudo journalctl -u moonraker --since "5 minutes ago" | grep -E "CncAgent|cnc_agent"
```

You should see:

```
CncAgent component initialized.
Klipper is ready, CncAgent is active.
```

#### Check CNC endpoints

```bash
curl -s http://127.0.0.1:7125/server/cnc/spindle | python3 -m json.tool
curl -s http://127.0.0.1:7125/server/cnc/coolant | python3 -m json.tool
curl -s http://127.0.0.1:7125/server/cnc/wcs | python3 -m json.tool
curl -s http://127.0.0.1:7125/server/cnc/units | python3 -m json.tool
curl -s http://127.0.0.1:7125/server/cnc/settings | python3 -m json.tool
```

#### Access the web interface

Open `http://<your-device-ip>` in a browser. You should see:

- **Dashboard** with CNC panels: CNC Status, DRO, Jog, Offsets, Spindle & Coolant
- **Navigation** with CNC labels: Job Files (was G-Code), MDI (was Console)
- **Machine** tab with Update Manager showing Mainsail-CNC

---

## Updating Mainsail-CNC

### Via Mainsail UI (Update Manager)

1. Go to **Machine** → **Update Manager**
2. Find **Mainsail-CNC** and click **Update**
3. Moonraker will `git pull` the latest code and restart

### Post-update steps

After a `git pull`, the following steps are needed to fully update:

1. **Re-vendor the agent** (if the agent code changed):
   ```bash
   cd ~/mainsail-cnc
   ./scripts/install_to_moonraker.sh
   ```

2. **Rebuild the frontend** (if frontend code changed):
   ```bash
   cd ~/mainsail-cnc
   bun install --frozen-lockfile  # only if bun.lock changed
   bun run build
   ./deploy.sh --live
   ```

3. **Restart Klipper** (if macros changed):
   From the Mainsail UI, click the **Restart** button in the Klippy State panel, or:
   ```bash
   sudo systemctl restart klipper
   ```

The Update Manager entry includes a `post_update` hint reminding you of these steps.

---

## CNC-Specific Configuration

### Klipper Macros

Mainsail-CNC expects certain G-code macros to be available in your `printer.cfg`. A scaffold is provided in
`klipper-macros/cnc_base.cfg`:

```ini
[gcode_macro CNC_SAFE_Z]
description: Raise Z to a safe height
gcode:
    # Replace with your machine-safe implementation
    G91
    G0 Z10 F600
    G90

[gcode_macro CNC_GO_TO_WORK_ZERO]
description: Move to the current work zero
gcode:
    # Replace with your machine-safe implementation
    G0 X0 Y0 F1500

[gcode_macro CNC_PARK]
description: Move to a predefined park location
gcode:
    # Replace with your machine-safe implementation
    G90
    G0 X0 Y0 Z50 F3000
```

Include this file in your `printer.cfg`:

```ini
[include /home/pi/mainsail-cnc/klipper-macros/cnc_base.cfg]
```

!!! note "Stock Klipper caveat"
    Stock Klipper does **not** support `G10`. Work-zero operations in this fork use `G92`:
    - `G92 X0 Y0` — set work position to 0 at current machine location
    - `G54`–`G59` — accepted as modal commands, but per-WCS origins require custom Klipper or agent-side tracking

### Machine Profile (Optional)

A machine profile YAML file can be used to declare capabilities and safety rules. Example:

```yaml
name: my-cnc-machine
frontend:
  show_machine_coords: true
  show_work_coords: true
  show_machine_health: true
capabilities:
  spindle:
    enabled: true
    mode: relay
    variable_speed: false
  coolant:
    channels: 2
  probe:
    enabled: false
  tool_setter:
    enabled: false
safety:
  require_confirm_for_zero_reset: true
  require_confirm_for_spindle_start: true
  require_homing_before_offsets: true
```

An example is available at `config/examples/machine-profile.example.yaml` in the repository.
By default the agent looks for `~/printer_data/config/machine_profile.yaml`; set
`machine_profile_path` in `[cnc_agent]` to override it.

### G-Code Metadata Extractor

The `cnc_metadata` component automatically processes uploaded G-code files through `scripts/cnc_metadata_extractor.py`,
which detects common CAM signatures (EstlCam, FreeCAD, Fusion 360, V-Carve) and writes a `.cnc-meta.json` sidecar
alongside each file. These sidecars are displayed on the Job Files cards.

The extractor is deployed automatically by `install_to_moonraker.sh`. Manual deployment:

```bash
mkdir -p ~/printer_data/scripts
install -m 0755 ~/mainsail-cnc/scripts/cnc_metadata_extractor.py ~/printer_data/scripts/
```

---

## WCS (Work Coordinate Systems)

This project includes a Klipper extra plugin (`klipper-extras/work_coordinate_systems.py`)
that adds proper G10 L2/L20 support to Klipper, enabling:

- **G54–G59** — six independent work coordinate system offset tables
- **G10 L2 P<n>** — set WCS n to explicit machine coordinates
- **G10 L20 P<n>** — set origin at current position (per-WCS zero)
- **G53** — switch to raw machine coordinates
- **WCS_STATUS** — report all offsets
- Automatic persistence to `~/wcs_offsets.json` (survives Klipper restart)
- State queryable via `printer.work_coordinate_systems.*` in the Moonraker API

### What it replaces

The WCS plugin replaces the old G92-based approach. Instead of `G92 X0 Y0`
(which applies a global offset), the plugin uses per-WCS `G10 L20 P{n} X0 Y0`.
This means:

- Each WCS (G54–G59) has its own origin offset — no more switching WCS and
  losing your zero
- Offsets persist automatically — no `SAVE_VARIABLE` needed
- CAM post-processors that emit `G10 L2 P{n}` work natively
- The active WCS and all offset tables are queryable from the frontend

### Enabling the WCS plugin

The plugin is deployed automatically by `scripts/install_to_moonraker.sh`
(step 7/11). After running the install script, add to `printer.cfg`:

```ini
[work_coordinate_systems]

[include macros/wcs_macros.cfg]
```

Then restart Klipper. Verify with:

```bash
curl -s 'http://127.0.0.1:7125/printer/objects/query?work_coordinate_systems'
```

### Removing the old system (if migrating)

If `macros.cfg` includes the following lines, remove or comment them out —
they conflict with the WCS plugin:

```ini
# Remove these if present:
# [include mpcnc/macros/coordinate-systems/*.cfg]
# [include mpcnc/macros/origin-offset/*.cfg]
```

Also update any macro that uses `G92` for zeroing to use `G10 L20 P{n}` instead.
The `ZERO_X`/`Y`/`Z`/`ALL` macros in `klipper-macros/wcs_macros.cfg` do this
automatically.

## Troubleshooting

### Moonraker won't start after agent install

Check the logs:

```bash
sudo journalctl -u moonraker -n 80 --no-pager
```

Look for errors referencing `cnc_agent` or `cnc_metadata`. Common causes:
- Python import error (vendored files not in the right location)
- Missing `[cnc_agent]` section in `moonraker.conf`

Fix: Re-run the install script:

```bash
cd ~/mainsail-cnc
./scripts/install_to_moonraker.sh
```

### Frontend shows stock Mainsail (no CNC panels)

1. Verify the CNC fork was built and deployed:
   ```bash
   ls ~/mainsail/index.html
   grep -l "CNC Status" ~/mainsail/assets/*.js 2>/dev/null || echo "CNC code not found in build"
   ```

2. Rebuild and redeploy:
   ```bash
   cd ~/mainsail-cnc
   bun run build
   ./deploy.sh --live
   ```

3. Hard-refresh your browser (Ctrl+Shift+R / Cmd+Shift+R).

### CNC endpoints return 404

The agent may not have loaded. Check:

```bash
curl -s http://127.0.0.1:7125/server/cnc/spindle
```

If you get a 404, verify the agent is vendored:

```bash
ls ~/moonraker/moonraker/components/cnc_agent/
ls ~/moonraker/moonraker/components/cnc_metadata/
```

Both directories should exist with `__init__.py` and the main `.py` file.

### Build fails on low-memory devices (e.g., Pi Zero)

On-device builds may require more RAM than available. Options:

1. **Build on another machine** and copy `dist/` to the target:
   ```bash
   # On your development machine
   cd mainsail-cnc
   bun run build

   # Copy to target
   scp -r dist/* pi@<printer-ip>:~/mainsail/
   ```

2. **Use the pre-built zip** from a CI release if available.

---

## Repository Layout

| Path | Description |
|------|-------------|
| `src/` | Mainsail Vue frontend with CNC panels |
| `moonraker-cnc-agent/` | Moonraker CNC agent (Python component) |
| `klipper-extras/` | Klipper extra plugins (e.g. `work_coordinate_systems.py` for G10 L2/L20) |
| `klipper-macros/` | CNC macros (WCS selector/zero macros, scaffold macros) |
| `scripts/` | Metadata extractor, install scripts |
| `config/examples/` | Example machine profile and update-manager config |
| `specs/` | Design specs and integration plans (e.g. `wcs-integration.md`) |
| `docs/` | Architecture, API, and milestone documentation |
| `deploy.sh` | Build-and-deploy script (dry-run by default) |
| `scripts/install_to_moonraker.sh` | Full install script for agent + update manager |

## Further Reading

- [Mainsail-CNC Architecture](docs/architecture.md) — system design and state flow
- [Moonraker CNC Agent API](docs/api.md) — `/server/cnc/*` endpoint documentation
- [Implementation Plan](IMPLEMENTATION_PLAN.md) — roadmap and task tracking
- [Klipper Documentation](https://www.klipper3d.org/)
- [Moonraker Documentation](https://moonraker.readthedocs.io/)
