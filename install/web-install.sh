#!/bin/bash

echo -e "\033[0;33m
                   ██████╗  █████╗ ██████╗  ██████╗███████╗██╗
                   ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██║
                   ██████╔╝███████║██████╔╝██║     █████╗  ██║
                   ██╔═══╝ ██╔══██║██╔══██╗██║     ██╔══╝  ██║
                   ██║     ██║  ██║██║  ██║╚██████╗███████╗███████╗
                   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝
\033[0m";

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ACCOUNT="heidgera"
REPO="parcelTemplate"

# special thanks to jozsef morrissey: https://stackoverflow.com/questions/14447406/
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

sudo mkdir -p /usr/local/src/setup

# Permissions are wonky somewhere.  aybe because this directory is owned by root. -Charles
#sudo chown pi /usr/local/src/setup

sudo chmod 777 /usr/local/src/setup

cd /usr/local/src/setup

curl -sL "https://raw.githubusercontent.com/${ACCOUNT}/${REPO}/master/config/machine.js" -o machine.js

curl -sL "https://raw.githubusercontent.com/heidgera/parcel/master/install/main.sh" -o install.sh

chmod 777 ./install.sh

./install.sh "$@" -s "/usr/local/src/setup"
#-u "$ACCOUNT" -r "$REPO" $DEBUG
