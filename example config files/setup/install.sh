#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

set -e

waitForNetwork ()
{
  if ! $(ping -c 1 -W 1 google.com > /dev/null 2>&1)
  then
    echo -e "\n** Waiting for network..."
    while ! $(ping -c 1 -W 1 google.com > /dev/null 2>&1); do
       echo "Still waiting..."
       sleep 1
    done
    echo -e "\n** Network connected."
  fi
}

handleError ()
{
  echo -e "\n**********************************************************"
  echo -e "Error at line $1"
  echo -e "\nCheck network connections and restart the install script."
  kill $FEEDBACK_PID > /dev/null 2>&1
}

workingText()
{
  while [ 1 ]; do
    for i in {0..4} ; do
        echo -n 'Working'
        for ((j=0; j<i; j++)) ; do echo -n '.'; done
        echo -n $'\r'
        sleep .5
        echo -n '            '$'\r'
    done
  done
}

trap 'handleError $LINENO' ERR

echo -e "\n* Starting stele-lite installation"

if [ ! -f "${DIR}/passwordChanged" ]
then
  echo -e "\n** Set new password for user 'pi':"
  passwd
  sudo touch "${DIR}/passwordChanged"
fi

if [ -f "${DIR}/wpa_supplicant.conf" ]
then
  sudo echo "static domain_name_servers=1.1.1.1 1.0.0.1" >> /etc/dhcpcd.conf
  echo -e "\n** Configuring Wifi..."

  sudo mv "${DIR}/wpa_supplicant.conf" /etc/wpa_supplicant/wpa_supplicant.conf

  sudo systemctl daemon-reload
  sudo systemctl restart dhcpcd

  waitForNetwork
else
  echo -e "\n** Wifi won't be configured."
fi

echo -e "\n** Installing node and system dependencies..."

workingText &
FEEDBACK_PID=$!

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - > /dev/null 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install xserver-xorg-video-fbturbo > /dev/null 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install libgtk-3-0 > /dev/null 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install git libudev-dev > /dev/null 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install build-essential hostapd dnsmasq network-manager xserver-xorg xinit xserver-xorg-video-fbdev libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6  > /dev/null 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install libasound2 > /dev/null 2>&1

kill $FEEDBACK_PID > /dev/null 2>&1

echo -e "Done."

echo  -e "\n** Checking directory structure..."

sudo mkdir -p /usr/local/src

sudo chmod 777 /usr/local/src

cd /usr/local/src

if [[ ! -d "stele-lite" ]]; then
  waitForNetwork
  echo  -e "\n** Cloning the repository..."
  ## sometimes this call fails because it fails to dns registry.nodejs.org, retrying usually works
  git clone --recurse-submodules https://github.com/scimusmn/stele-lite.git
  ln -s /usr/local/src/stele-lite ~/Application
fi

cd stele-lite

echo  -e "\n** Installing node dependencies for stele-lite:"

sleep 10

waitForNetwork

npm i > /dev/null

echo  -e "\n** Configuring machine..."

cd configurator

sudo node install.js
