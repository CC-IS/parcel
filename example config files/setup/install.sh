#!/bin/bash
echo -e "\nInstalling node:"

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get --assume-yes install xserver-xorg-video-fbturbo

sudo apt-get --assume-yes install libgtk-3-0

sudo apt-get --assume-yes install git libudev-dev

sudo apt-get --assume-yes install build-essential hostapd dnsmasq network-manager xserver-xorg xinit xserver-xorg-video-fbdev libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6

sudo apt-get --assume-yes install libasound2

while ! ping -c 1 -W 1 1.1.1.1; do
    echo "Waiting for 1.1.1.1 - network interface might be down..."
    sleep 1
done

echo  -e "\nClone the wrapper"

mkdir /usr/local/src/

sudo chmod 777 /usr/local/src

cd /usr/local/src

git clone --recurse-submodules https://github.com/scimusmn/stele-lite.git

ln -s /usr/local/src/stele-lite ~/app

cd stele-lite

echo  -e "\nInstalling dependencies for stele-lite:"

npm i

echo  -e "\nConfiguring"

cd configurator

sudo node install.js
