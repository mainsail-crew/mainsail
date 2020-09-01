# Update Mainsail

## Update Klipper
```
cd ~/klipper
git fetch
git checkout origin/master
```

Please check the location of the `printer.cfg` and the UDS in the `/etc/default/klipper` file. This
should look like:
```
KLIPPY_ARGS="/home/pi/klipper/klippy/klippy.py /home/pi/klipper_config/printer.cfg -l /tmp/klippy.log -a /tmp/klippy_uds"
```
If you have to change the location of `printer.cfg` in `/etc/default/klipper`
please create the directory `~/klipper_config` and move your config files in this directory.

Restart Klipper (`sudo service klipper restart`) and check the `klippy.log`, if Klipper starts
correctly and then continue the guide.

## Update Moonraker (API)
```
cd ~/moonraker
git fetch
git checkout origin/master
```

Restart Moonraker (`sudo service moonraker restart`) and open the url `http://<printer-ip>:7125/printer/info` in your browser.

If you see a content like this
```
{"result": {"hostname": "voron250", "error_detected": false, "version": "v0.8.0-643-g528f9f25", "is_ready": true, "message": "Printer is ready", "cpu": "4 core ARMv7 Processor rev 4 (v7l)"}}
```

## Update Mainsail (webinterface)
```
cd ~/mainsail
rm -R ./*
wget -q -O mainsail.zip https://github.com/meteyou/mainsail/releases/download/v0.2.0/mainsail-beta-0.2.0.zip && unzip mainsail.zip && rm mainsail.zip
```
Now it should be possible to open the interface: `http://<printer-ip>/`.