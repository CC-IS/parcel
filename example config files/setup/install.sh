#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

waitForNetwork ()
{
  while ! ping -c 1 -W 1 1.1.1.1 > /dev/null; do
     echo "Waiting for network..."
     sleep 1
  done
}

if [[ ( ! -f "${DIR}/WPA_COPIED") && (-f "${DIR}/wpa_supplicant.conf") ]]
then
  sudo echo "static domain_name_servers=1.1.1.1 1.0.0.1" >> /etc/dhcpcd.conf
  echo -e "\nConnecting to Wifi..."

  sudo cp "${DIR}/wpa_supplicant.conf" /etc/wpa_supplicant/wpa_supplicant.conf

  sudo systemctl daemon-reload
  sudo systemctl restart dhcpcd

  waitForNetwork

  sudo touch "${DIR}/WPA_COPIED"
else
  echo -e "Wifi won't be configured."
fi

echo -e "\nInstalling node:"

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get --assume-yes install xserver-xorg-video-fbturbo

sudo apt-get --assume-yes install libgtk-3-0

sudo apt-get --assume-yes install git libudev-dev

sudo apt-get --assume-yes install build-essential hostapd dnsmasq network-manager xserver-xorg xinit xserver-xorg-video-fbdev libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6

sudo apt-get --assume-yes install libasound2

waitForNetwork

echo  -e "\nClone the wrapper"

sudo chmod 777 /usr/local/src

cd /usr/local/src

git clone --recurse-submodules https://github.com/scimusmn/stele-lite.git

ln -s /usr/local/src/stele-lite ~/app

cd stele-lite

echo  -e "\nInstalling dependencies for stele-lite:"

waitForNetwork

npm i

echo  -e "\nConfiguring"

cd configurator

sudo node install.js
