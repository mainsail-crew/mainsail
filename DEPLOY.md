# Deploy Mainsail to Raspberry Pi

## Prerequisites

- Node.js installed locally
- Raspberry Pi accessible via SSH at `192.168.1.122`
- SSH credentials: `octopi` / `octopi`

## 1. Build

```powershell
npm run build
```

Generates the production files in `dist/`.

## 2. Deploy to Pi

```powershell
scp -r dist/* octopi@192.168.1.122:~/mainsail/
```

Password: `octopi`

## 3. Fix permissions & restart services

```powershell
ssh -t octopi@192.168.1.122 "chmod 755 /home/octopi && chmod -R 755 /home/octopi/mainsail/assets && sudo systemctl restart moonraker && sudo systemctl reload nginx"
```

Password (SSH + sudo): `octopi`

## 4. Verify

Open `http://192.168.1.122/` in an **incognito/private window** (to bypass service worker cache).

## Dev mode (local)

```powershell
cp .env.development.local.example .env.development.local
# Edit .env.development.local → set MOONRAKER_TARGET=http://192.168.1.122:7125
npm run serve
```

Opens `http://localhost:8080/` with hot reload, proxying all Moonraker requests through Vite.
