---
layout: default
title: Setup multi webcam
parent: Quicktips
has_children: false
permalink: /quicktips/multicam
description: >-
    How to setup multi webcam with mainsailOS.
---

# {{ page.title }}
{{ page.description }}

__Disclaimer__  
Thank you [Charlie_Powell](https://community.octoprint.org/u/Charlie_Powell) for letting us adapt your guide for mainsailOS!  
The original guide can be found [here](https://community.octoprint.org/t/setting-up-multiple-webcams-in-octopi-the-right-way/32669).
{: .success}

## Prerequisites
You need:

- mainsailOS v0.5.0 or higher
- ssh access
- at least two cameras

__If you are working on a existing installation, make a backup!__

## 1. Creating the configuration files
mainsailOS supports an infinite number of webcam*.txt-style configuration files. They can be placed in
`/home/pi/klipper_config`.

### Create the second one from the ui or terminal:
In the UI, got to 'Settings > Interface' click on (1) and save as `webcam2.txt`.

If you prefere terminal:

```bash
$ cd /home/pi/klipper_config
$ cp webcam.txt webcam2.txt
```
Now you should have two identical files:
1. `/home/pi/klipper_config/webcam.txt`
2. `/home/pi/klipper_config/webcam2.txt`

## 2. Editing the original configuration file for a specific camera
Find out the path to the camera by ID. This makes it much easier to stop /dev/video0 and /dev/video1 from switching on you.

Run `ls /dev/v4l/by-id`, then save somewhere the long name of your camera. For example:

```bash
$ ls  /dev/v4l/by-id/
usb-046d_0825_88C56B60-video-index0  usb-046d_0825_88C56B60-video-index1
```
I'll use the first one, __usb-046d_0825_88C56B60-video-index0__


__Note__  
Not sure which device is which? You can run lsusb to match a name to an ID.
{: .info}

Then edit `/home/pi/klipper_config/webcam.txt` in by clicking on it in mainsail.

Or via terminal:
```bash
$ nano /home/pi/klipper_config/webcam.txt
```

Set camera="usb" at the top, and the camera_usb_options line to indicate the device:

`camera_usb_options="-r 640x480 -f 10 -d /dev/v4l/by-id/<device long id>"`

__Note__  
Using a Raspberry Pi camera? Set camera="raspi" at the top of the file, and you can ignore referencing the cameras by device ID.
{: .info}

## 3. Editing the second configuration file
There's two things that need adjusting here: the port mjpg_streamer will be running under, and the device again.

__Note__  
Using 1 RPi camera and 1 USB camera? You don't need to reference them by ID, since camera="raspi" vs. camera="usb" is enough.
{: .info}

Find the long ID of the second camera, as you did for the first one.

Editing `/home/pi/klipper_config/webcam2.txt` like described above.

As above again, set camera="usb" and set camera_usb_options but this time using the ID for the second camera:

`camera_usb_options="-r 640x480 -f 10 -d /dev/v4l/by-id/<device long id>"`

Adjust the port, by editing camera_http_options:

`camera_http_options="-n -p 8081"`

The port should reflect the number in `webcam*.txt`:
```
webcam.txt => -p 8080
webcam1.txt => -p 8081
webcam2.txt => -p 8082
webcam3.txt => -p 8083
```

__WARNING__  
mainsailOS already setup 4 nginx reverse proxies for port 8080 to 8083, so you can configure 4 webcams easy with this guide,
for more webcams you need to configure the nginx config, which we dont recommend!
{: .warning}

## 4. Test it works
Restart webcamd using `sudo service webcamd restart`, 
and try and find your second camera under `http://<your-ip>/webcam2/`. If it doesn't work, check in the webcam log, `/var/webcamd.log` for details.

If it works, you can use the stream & snapshot URLs in OctoPrint:

Stream: `http://<your-ip>/webcam2/?action=stream`

Snapshot: `http://<your-ip>/webcam2/?action=snapshot`

__DONE__  
Congratulations, you set up multi webcam with mainsailOS!  
If you want to add more, just follow the guide again and increment the webcam*.txt number i.e. webcam**3**.txt and so on.  
The webcams are easy accessible through your `http://<your-ip>/webcam`, `http://<your-ip>/webcam2` and so on.
{: .success}
