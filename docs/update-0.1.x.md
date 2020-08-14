# Update from 0.1.x to latest
Updates after 0.1.x are easier than 0.0.x to 0.1.x.

## Update Moonraker
```
cd ~/moonraker
git pull
sudo service moonraker restart
```

create a new file ~/moonraker.conf
```editorconfig
[server]
host: 0.0.0.0
config_path: ~/klipper_config

[authorization]
enabled: true
trusted_clients:
 192.168.0.0/24
```

## Update Klipper
```
cd ~/klipper
git fetch
git checkout origin/master
```

### Move klipper config files to the subdirectory
create the new subdirectory andmove `printer.cfg` in `~/klipper_config`:
```
mkdir ~/klipper_config/
mv ~/printer.cfg ~/klipper_config/
```
move also included klipper config files to this directory.

### Change Klipper default printer.cfg location
edit file `/etc/default/klipper` and change `/home/pi/printer.cfg`to `/home/pi/klipper_config/printer.cfg`.

### Modify printer.cfg
now you have to remove the `[moonraker]` section from `~/klipper_config/printer.cfg` and check if there are the following sections in it:
```
[virtual_sdcard]
path: ~/sdcard

[pause_resume]
[display_status]
```

and rename `RESET_SD` in your cancel print macro to `SDCARD_RESET_FILE`. 

## Update static files from Mainsail
```
rm -R ~/mainsail/*
cd ~/mainsail
wget -q -O mainsail.zip https://github.com/meteyou/mainsail/releases/download/v0.1.2/mainsail-beta-0.1.2.zip && unzip mainsail.zip && rm mainsail.zip
```