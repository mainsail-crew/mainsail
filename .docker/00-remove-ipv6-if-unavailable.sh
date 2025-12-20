#!/bin/sh
# Remove IPv6 listen directives if IPv6 is not available

set -e

ME=$(basename "$0")
DEFAULT_CONF_FILE="/etc/nginx/conf.d/default.conf"

# Check if IPv6 is available and not empty
if [ ! -f "/proc/net/if_inet6" ] || [ ! -s "/proc/net/if_inet6" ]; then
    echo "$ME: info: IPv6 not available, removing IPv6 listen directives"
    sed -i '/listen \[::\]:/d' "$DEFAULT_CONF_FILE"
fi
