---
layout: default
title: Remote Access
parent: Quicktips
permalink: /quicktips/remote-access
description: >-
  A guide to safe remote access.
---

# {{ page.title }}
{{ page.description }}  

__Notice__  
This is not a complete guide with every single step in detail, but rather a recommendation of what to do and especially what not to do to get access to the printer from somewhere remote from your network.
{: .info}

You have to decide if you ..
- only want to have status messages on your smartphone
- or you need full remote access to Mainsail from everywhere

Of course, you can also use a combination of both.

## Status messages

For simple status messages there are a couple of additional tools that can be used:
- __discord:__ Mooncord is a bot that sends you status messages over discord.  
[https://github.com/eliteSchwein/mooncord](https://github.com/eliteSchwein/mooncord)
- __telegram:__ moonraker-telegram is a bot that sends you status messages over telegram.  
[https://github.com/Raabi91/moonraker-telegram](https://github.com/Raabi91/moonraker-telegram)

These tools are installed on the local machine and send the status messages via the respective platforms. Thus, no access to your local network from outside is necessary.

For details, please refer to the projects instructions.

## Remote Access to Mainsail

<div class="alert">
What <b>not to do</b>: 
	<ul>
		<li>Please do not open ports of Mainsail/Moonraker in your router to the rest of the world. There are plenty of reports of Octoprint installations being freely accessible on the Internet, with just as many reasons why this is not a good idea.</li>
	</ul>
	<a href="https://isc.sans.edu/forums/diary/3D+Printers+in+The+Wild+What+Can+Go+Wrong/24044/" target="_blank">https://isc.sans.edu/forums/diary/3D+Printers+in+The+Wild+What+Can+Go+Wrong/24044/</a>
</div>

<div class="warning">
What you <b>could do</b>:  
	<ul>
		<li>Use an external service provider (e.g. tailscale) to gain access to your home network.
			<ul>
				<li>Con: you give the control out of your hand</li>
			</ul>
		</li>
		<li>Reverse Proxy</li>
	</ul>
</div>

<div class="success">
<b>Recommendation</b> what you <b>should do</b>:  
	<ul>
		<li>Set up your own secured VPN tunnel.
			<ul>
				<li>either in the router</li>
				<li>or your Pi</li>
			</ul>
		</li>
	</ul>
</div>

## Set up VPN

Several routers allow you to set up a VPN tunnel without much effort.  
After you have entered the login data into e.g. your smartphone, you will have secure access to your entire network, including Mainsail.

If your router does not support this, you can also set up your own VPN, e.g. on your Pi.  
Therefore you could use: [OpenVPN](https://openvpn.net/), [WireGuard](https://www.wireguard.com/) or [PiVPN](https://www.pivpn.io/)

To be able to reach your home network even with a non-static IP address, you should use a dynamic DNS service. This will forward a domain directly to your IP address. Often, these DynDNS services can also be set up directly in the router, so that the IP address gets automatically updated on a change.

Some free services: [DuckDNS](https://www.duckdns.org) or [FreeDNS ](https://freedns.afraid.org/)

__Notice__  
The devices that dial in via the VPN tunnel are assigned to a different address range. This address range must be configured in moonraker under _trusted_clients_ and _cors_domains_. [https://moonraker.readthedocs.io/en/latest/configuration/#authorization](https://moonraker.readthedocs.io/en/latest/configuration/#authorization)  <br/><br/>
For example:  
__192.168.1__.x&emsp;_// devices on your regular LAN_  
__192.168.50__.x&emsp;_// devices connected through your VPN tunnel_
{: .info}
