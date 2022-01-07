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
This guide does not include every step in detail, but is a recommendation for safe remote access.
{: .info}

You will need to decide if you want to receive status messages on your smartphone, have full remote access to Mainsail, or both.

## Status messages

For simple status messages there are a two additional tools that can be used:
- __Discord:__ Mooncord is a bot that sends you status messages over Discord: [https://github.com/eliteSchwein/mooncord](https://github.com/eliteSchwein/mooncord)
- __Telegram:__ moonraker-telegram is a bot that sends you status messages over the messaging application Telegram: [https://github.com/Raabi91/moonraker-telegram](https://github.com/Raabi91/moonraker-telegram)

These tools are installed on the local machine and send status messages to their respective platforms. No changes are needed to externally access your local network.

For details, please refer to each project's instructions and documentation.

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
		<li>Use an external service provider such as Tailscale to gain access to your home network.
			<ul>
				<li>A potential downside is not having personal control of the connection.</li>
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
				<li>In your router</li>
				<li>Or your Raspberry Pi</li>
			</ul>
		</li>
	</ul>
</div>

## Set up VPN

Several routers allow you to set up a VPN tunnel. After you have configured the VPN and logged in from another device, you will have secure access to your entire network, including Mainsail.

If your router does not support this, you can also set up your own VPN, for example, using your Raspberry Pi.  
[OpenVPN](https://openvpn.net/), [WireGuard](https://www.wireguard.com/) or [PiVPN](https://www.pivpn.io/) are all options that could work.

To be able to reach your home network even with a non-static IP address, you will need to use a Dynamic DNS service. This will forward a domain directly to your IP address. Often these DynDNS services can also be set up directly in your router so when your external IP address changes, your domain will be automatically updated.  Free Dynamic DNS services include [DuckDNS](https://www.duckdns.org) or [FreeDNS ](https://freedns.afraid.org/)

__Notice__  
The devices that you use to access VPN tunnel are assigned to a different address range. This address range must be configured in Moonraker under _trusted_clients_ and _cors_domains_. See also [Moonraker's documentation on network authorization.](https://moonraker.readthedocs.io/en/latest/configuration/#authorization)  <br/><br/>
For example:  
__192.168.1__.x&emsp;_// devices on your regular LAN_  
__192.168.50__.x&emsp;_// devices connected through your VPN tunnel_
{: .info}
