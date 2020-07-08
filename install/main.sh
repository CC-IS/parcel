#!/bin/bash

# save the directory of the shell script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

OUTPUT="${HOME}/stele_install.log"

OPTS="$@"

ACCOUNT=''
REPO=''
SETUP_DIR="/boot/setup"

# while getopts ':a:r:s:d' option; do
#   case "${option}"
#   in
#   a) ACCOUNT=${OPTARG};;
#   r) REPO=${OPTARG};;
#   s) SETUP_DIR=${OPTARG};;
#   d) OUTPUT="/dev/stdout";;
#   esac
# done

declare -A flags
declare -A booleans
args=()

while [ "$1" ];
do
    arg=$1
    #if the next opt starts with a '-'
    if [ "${1:0:1}" == "-" ]
    then
      # move to the next opt
      shift
      rev=$(echo "$arg" | rev) #reverse the string

      #if the next opt is empty, or begins with a '-', or this opt ends in a ':'
      if [ -z "$1" ] || [ "${1:0:1}" == "-" ] || [ "${rev:0:1}" == ":" ]
      then
        # it is a boolean flag
        bool=$(echo ${arg:1} | sed s/://g)
        booleans[$bool]=true
        #echo \"$bool\" is boolean
      else
        # it is a flag with a value
        value=$1
        flags[${arg:1}]=$value
        shift
      fi
    else
      args+=("$arg")
      shift
      #echo \"$arg\" is an arg
    fi
done

if [ ! -z "${flags['a']}" ]; then
  ACCOUNT="${flags['a']}"
fi

if [ ! -z "${flags['r']}" ]; then
  REPO="${flags['r']}"
fi

if [ ! -z "${flags['s']}" ]; then
  SETUP_DIR="${flags['s']}"
fi

if [ "${booleans['V']}" = true ]; then
  OUTPUT="/dev/stdout"
fi


echo "Logging to ${OUTPUT}" >> $OUTPUT

echo "Using $ACCOUNT as the github account" >> $OUTPUT
echo "and $REPO as the github repo" >> $OUTPUT

#clear the log file
cat /dev/null > stele_install.log

# function to hold the program until network connections are available
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

# start the working indicator and store the process number
startWorking()
{
  workingText 2> /dev/null &
  FEEDBACK_PID=$!
}

# kill the process of the working indicator
doneWorking()
{
  kill -1 $FEEDBACK_PID > /dev/null 2>/dev/null
  sleep .5 &
  wait $!
}

# function to print a working indicator
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

# function to handle error output, and give a line number.
handleError ()
{
  echo -e "\n**********************************************************"
  echo -e "Error at line $1"
  echo -e "\nCheck network connections and restart the install script."
  echo -e "Also check stele_install.log for error information."
  doneWorking
}

# function called on script end.
onExit()
{
  doneWorking
}

# set handler for error messages
trap 'handleError $LINENO' ERR

# set exit handler.
trap 'onExit' EXIT

################################################
################################################
# beginning of install script

echo -e "\n* Starting stele-lite installation"

# if the password hasn't yet been changed, prompt the user to change it.
if [ ! -f "${DIR}/passwordChanged" ] && [[ $USER = 'pi' ]]; then
  echo -e "\n** Set new password for user 'pi':"
  passwd
  sudo touch "${DIR}/passwordChanged"
fi

# if there is a wpa_supplicant.conf file in the setup directory, install it,
# and restart networking.
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

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - >> ${OUTPUT} 2>&1

[ $(uname --m) != "x86_64" ] && sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install xserver-xorg-video-fbturbo >> ${OUTPUT} 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install libgtk-3-0 >> ${OUTPUT} 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install git libudev-dev >> ${OUTPUT} 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install build-essential hostapd dnsmasq network-manager xserver-xorg xinit xserver-xorg-video-fbdev libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6  >> ${OUTPUT} 2>&1

sudo apt-get -qq -o=Dpkg::Use-Pty=0 --assume-yes install libasound2 >> ${OUTPUT} 2>&1

doneWorking

echo  -e "\n** Checking directory structure..."

sudo mkdir -p /usr/local/src

sudo chmod 777 /usr/local/src

cd /usr/local/src

# if the stele-lite directory does not exist, clone it from github, and create
# a link in the home directory
if [[ ! -d "stele-lite" ]]; then
  waitForNetwork
  echo  -e "\n** Cloning the repository..."
  git clone --recurse-submodules https://github.com/scimusmn/stele-lite.git
  ln -s /usr/local/src/stele-lite ~/application
fi

cd stele-lite

mkdir -p /usr/local/src/stele-lite/current

echo  -e "\n** Installing node dependencies for stele-lite:"

startWorking

# Try installing the node dependencies via npm.
## sometimes this call fails because it fails to dns registry.nodejs.org, retrying usually works
while [[ $(npm i 2> >( tee -a ${OUTPUT} | grep -o -i -m 1 'ERR!')) = 'ERR!' ]]; do
  doneWorking
  echo -e "\033[0;33m"
  echo -e "\nErrors while trying to install packages, retrying..."
  waitForNetwork
  echo -e "\033[0m"
  startWorking
done

doneWorking

echo  -e "\n** Checking if ${REPO} is installed..."


if [ -d "app" ] && [[ ! $(cd app; git remote -v) =~ "https://github.com/${ACCOUNT}/${REPO}" ]]; then
  sudo rm -rf app
fi

if [[ ! -d "app" ]]; then
  echo  -e "\n** Installing ${REPO}..."

  startWorking

  waitForNetwork

  git clone  --recurse-submodules "https://github.com/${ACCOUNT}/${REPO}" app > /dev/null 2>&1

  doneWorking

  if [[ -f "app/config/install.sh" ]]; then
    bash app/config/install.sh $OPTS -o $OUTPUT
  fi
  cd app

  echo  -e "\n** Installing node dependencies for ${REPO}:"

  startWorking
  while [[ $(npm i 2> >( tee -a ${OUTPUT} | grep -o -i -m 1 'ERR!')) = 'ERR!' ]]; do
    doneWorking
    echo -e "\033[0;33m"
    echo -e "\nErrors while trying to install packages, retrying..."
    waitForNetwork
    echo -e "\033[0m"
    startWorking
  done
  doneWorking

  cd ../

  touch current/appReady
fi

echo  -e "\n** Configuring machine..."

cd configurator

# Run the configurator in config-only mode, so that it exits once it completes.

sudo node install.js --config-only --setup-dir "${SETUP_DIR}" --user "$USER"

# Restart the computer after the script finishes.
echo -e "\n**********************************************************"
echo -e 'Going for system reboot in 10 seconds.'
sleep 10

sudo reboot
