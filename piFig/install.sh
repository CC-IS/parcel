#!/bin/bash

echo "Init the submodules:"

git submodule init
git submodule update

echo "Adding Adafruit Declarations and installing node:"

 curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get install node

#echo "Creating Device Tree Blob for halt signal on GPIO25:"

#sudo dtc -I dts -O dtb -o /boot/dt-blob.bin my-blob.dts

echo "Installing dependencies for application:"

npm i
