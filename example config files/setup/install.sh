#!/bin/bash
echo -e "\nInstalling node:"

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get --assume-yes install xserver-xorg-video-fbturbo

sudo apt-get --assume-yes install libgtk-3-0

sudo apt-get --assume-yes install git libudev-dev

sudo apt-get --assume-yes install build-essential hostapd dnsmasq network-manager xserver-xorg xinit xserver-xorg-video-fbdev libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6

sudo apt-get --assume-yes install libasound2

echo  -e "\nClone the wrapper"

mkdir ~/app

cd ~/app

git clone --recurse-submodules https://github.com/scimusmn/stele-lite.git

cd stele-lite

echo  -e "\nInstalling dependencies for stele-lite:"

npm i

echo  -e "\nConfiguring"

cd configurator

npm i

sudo node install.js
