#!/bin/sh
sudo systemctl unmask hostapd
service hostapd start
service dnsmasq start
