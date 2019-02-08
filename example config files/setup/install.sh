#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cat /dev/null > stele_install.log

waitForNetwork ()
{
  if ! $(ping -c 1 -W 1 registry.nodejs.org > /dev/null 2>&1)
  then
    echo -e "\n** Waiting for network..."
    while ! $(ping -c 1 -W 1 registry.nodejs.org > /dev/null 2>&1); do
       echo "Still waiting..."
       sleep 1
    done
    echo -e "\n** Network connected."
  fi
}

startWorking()
{
  workingText 2> /dev/null &
  FEEDBACK_PID=$!
}

doneWorking()
{
  kill -1 $FEEDBACK_PID > /dev/null 2>/dev/null
  sleep .5 &
  wait $!
}

workingText()
{
  trap "echo -n $'\r''Working.... Done!'$'\n'; exit" SIGHUP

  while [ 1 ]; do
    for i in {0..4} ; do
        echo -n $'\r''Working'
        for ((j=0; j<i; j++)) ; do echo -n '.'; done
        for ((j=0; j<4-i; j++)) ; do echo -n ' '; done
        sleep .5 &
        wait $!
    done
  done
}

handleError ()
{
  echo -e "\n**********************************************************"
  echo -e "Error at line $1"
  echo -e "\nCheck network connections and restart the install script."
  echo -e "Also check stele_install.log for error information."
  doneWorking
}

onExit()
{
  doneWorking
}


trap 'handleError $LINENO' ERR

trap 'onExit' EXIT

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

  echo -e "\n** Wifi connected."
else
  echo -e "\n** Wifi won't be configured."
fi

echo -e "\n** Installing node and system dependencies..."

startWorking

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - > stele_install.log 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install xserver-xorg-video-fbturbo > stele_install.log 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install libgtk-3-0 > stele_install.log 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install git libudev-dev > stele_install.log 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install build-essential hostapd dnsmasq network-manager xserver-xorg xinit xserver-xorg-video-fbdev libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6  > stele_install.log 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install libasound2 > stele_install.log 2>&1

doneWorking

echo  -e "\n** Checking directory structure..."

sudo mkdir -p /usr/local/src

sudo chmod 777 /usr/local/src

cd /usr/local/src

if [[ ! -d "stele-lite" ]]; then
  waitForNetwork
  echo  -e "\n** Cloning the repository..."
  git clone --recurse-submodules https://github.com/scimusmn/stele-lite.git
  ln -s /usr/local/src/stele-lite ~/Application
fi

cd stele-lite

echo  -e "\n** Installing node dependencies for stele-lite:"

startWorking

## sometimes this call fails because it fails to dns registry.nodejs.org, retrying usually works
while [[ $(npm i 2> >( tee -a ~/stele_install.log | grep -o -i ERR!)) = 'ERR!' ]]; do
  echo -e "\nErrors while trying to install packages, retrying..."
  waitForNetwork
done

doneWorking

echo  -e "\n** Configuring machine..."

cd configurator

sudo node install.js --config-only

echo -e "\n**********************************************************"
echo -e 'Going for system reboot in 10 seconds.'
sleep 10

sudo reboot
