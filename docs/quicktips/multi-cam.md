---
layout: default
title: Multicam
parent: Quicktips
has_children: false
permalink: /quicktips/multicam
description: >-
    How to setup multi Webcams with mainsailOS.
---

# {{ page.title }}
{{ page.description }}

__Disclaimer__  
Thank you to [Charlie_Powell](https://community.octoprint.org/u/Charlie_Powell) for letting us adapt his guide for MainsailOS!  
The original guide can be found [here](https://community.octoprint.org/t/setting-up-multiple-webcams-in-octopi-the-right-way/32669).
{: .info}

## Prerequisites
For multicam to work, you will need:

- MainsailOS v0.5.0 or higher
- SSH access
- Two or more cameras

__WARNING__  
**If you are working with an existing installation, make a backup!**
{: .warning}

## Creating the configuration files
MainsailOS supports an infinite number of `webcam*.txt` style configuration files. They should be placed in
`/home/pi/klipper_config`.

In Mainsail's user interface, go to 'Settings > Interface' and click on (1) and save as `webcam2.txt`.

:image:

You should now have two identical files with different names:
1. `/home/pi/klipper_config/webcam.txt`
2. `/home/pi/klipper_config/webcam2.txt`

## Edit the original configuration file for a specific camera
Find the path to the camera by its ID. This makes it easier to stop `dev/video0` and `/dev/video1` from being switchedin the future.

In a terminal, run the command `ls /dev/v4l/by-id`, copy your camera id and paste it into the editor in Mainsail. For example:

```bash
$ ls  /dev/v4l/by-id/
```

returns

```
usb-046d_0825_88C56B60-video-index0  usb-046d_0825_88C56B60-video-index1
```
This example will use the first one: `usb-046d_0825_88C56B60-video-index0`


__Note__  
Not sure which device is which? You can run `lsusb` to match a camera name to an ID.
{: .info}

Edit `/home/pi/klipper_config/webcam.txt`  by clicking on it in Mainsail.

Insert two lines at the beginning of `webcam.txt`:

```
camera="usb"
camera_usb_options="-r 640x480 -f 10 -d /dev/v4l/by-id/<device long id>"
```

The `device long id` should match the camera name from running `lsusb`.

__Note__  
If you are using a Raspberry Pi branded camera, set camera="raspi" at the top of the file and you do not have to reference the cameras by device ID.

{: .info}

## 3. Editing the second configuration file
When using a second camera, you must add the port `mjpg_streamer` runs under and the device.

__Note__  
If you are using one Raspberry Pi branded camera and a different USB camera you don't need to reference them by ID, as camera="raspi" and camera="usb" is enough.
{: .info}

Similar to finding the first camera, run `ls` and copy the ID of the second camera:

```bash
ls  /dev/v4l/by-id/
```

Edit `/home/pi/klipper_config/webcam2.txt` as described above and add:
`camera="usb"` and `set camera_usb_options` but this time using the ID for the second camera:

```bash
camera_usb_options="-r 640x480 -f 10 -d /dev/v4l/by-id/<device long id>"
```

Adjust the port by editing `camera_http_options`:

`camera_http_options="-n -p 8081"`

The port should reflect the number in `webcam*.txt`:
```
webcam.txt => -p 8080
webcam1.txt => -p 8081
webcam2.txt => -p 8082
webcam3.txt => -p 8083
```

__INFO__  
MainsailOS comes setup with four nginx reverse proxies for port 8080 through 8083, so you can configure 4 webcams with this guide. 
For more webcams you will need to edit the nginx configuration, which is not recommended.  It can be easy to make a mistake when editing nginx, which will also  cause Mainsail to stop working.  
If you need more than four webcams, visit us on [Discord](https://discord.gg/skWTwTD){:target="_blank"} and we will help you.
{: .warning}

## 4. Test that it works
Restart `webcamd` by clicking the power button icon in the upper right corner of Mainsail and click `Webcamd` to restart it. 
Find your second camera under `http://<your-ip>/webcam2/`.
If it doesn't work, check in the webcam log in the filemanager log section for details.

If it works, you can use the URLs in Mainsail:

Stream: `http://<your-ip>/webcam2/`

__DONE__  
Congratulations, you set up multi webcam with Mainsail!  
If you want to add more,  follow the guide again and increment the `webcam*.txt` number, i.e. `webcam**3**.txt` and so on.  
The webcams are accessible through your `http://<your-ip>/webcam`, `http://<your-ip>/webcam2`, etc.
{: .success}
