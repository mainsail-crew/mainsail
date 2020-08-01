# Update from 0.1.x to latest
Updates after 0.1.x are easier than 0.0.x to 0.1.x.

## Update Moonraker
```
cd ~/moonraker
git pull
sudo service moonraker restart
```

## Update Klipper
```
cd ~/klipper
git fetch arksine
git checkout arksine/dev-moonraker-testing
sudo service klipper restart
```

## Update static files from Mainsail
```
rm -R ~/mainsail/*
cd ~/mainsail
wget -q -O mainsail.zip https://github.com/meteyou/mainsail/releases/download/v0.1.1/mainsail-beta-0.1.1.zip && unzip mainsail.zip && rm mainsail.zip
```