# Update from 0.0.x to 0.1.x
Between 0.0.x and 0.1.x was a big rebuild of Moonraker. Thats the reason for the separate guide.

## Change Klipper branch
```
cd ~/klipper
git fetch arksine
git checkout arksine/dev-moonraker-testing
```

## Install new Moonraker branch
```
cd ~
git clone https://github.com/Arksine/moonraker.git
```

we have to remove the old moonraker service and install the new version:
```
cd ~/moonraker/scripts
./uninstall-moonraker.sh
./install-moonraker.sh
```

Finally, we have to change the `printer.cfg`. The section `\[api_server\]` is now called `\[moonraker\]`.

## Update the nginx configuration

The nginx configuration (`/etc/nginx/sites-available/mainsail`) will need the following additional section: 
```
location /server {
    proxy_pass http://apiserver/server;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Scheme $scheme;
}
```

Restart nginx with `sudo service nginx restart`

## Update static files from Mainsail

```
rm -R ~/mainsail/*
cd ~/mainsail
wget -q -O mainsail.zip https://github.com/meteyou/mainsail/releases/download/v0.1.0/mainsail-beta-0.1.0.zip && unzip mainsail.zip && rm mainsail.zip
```