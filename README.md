# Parcel

Electron kiosk application wrapper and machine configuration suite for minimal linux machines.

## Overview

This is a simple wrapper application to manage the complete lifecycle of an electron application on a barebones Debian-based linux machine. It supports multiple monitors using either local or network content. It has a number of different configuration options, ranging from setting up wifi connections, static IP addresses, and creating Wifi Hotspots to managing soft shutdowns of the hardware after power loss using a battery backup. These configuration options are detailed below.

## Features

_<span style="text-decoration:underline;">Single Command Installation</span>_: This package enables any network-connected debian-based machine to be configured with a single command, detailed below. This process installs the electron wrapper, and then installs a specified github repository as the 'app', which contains all of the application specific customizations.

_<span style="text-decoration:underline;">Custom Installation Scripts</span>_: Stele-lite will run a custom shell script, named 'install.sh', if it is found in the config directory of the 'app' repository. This allows for installation of additional system level dependencies, and other configuration options.

_<span style="text-decoration:underline;">Machine Configuration</span>_: The parcel package includes a system service which monitors the config files in the application directory, and configures the computer accordingly. This process runs at each startup, and if it sees any changes to the machine.js file in the app 'config' folder, it makes the changes, and saves the current configuration.

_<span style="text-decoration:underline;">USB updating</span>_: The configurator system service also manages an update system for the app using USB drives. When a USB drive is inserted into the host computer, it is automatically mounted, and the root directory is scanned for a folder called 'update'. If it is found, it loads 'update.js' from that folder, which contains a manafest of directories and files to be updated. The program will recurse through this list of files and copy the specified files from the USB drive to the corresponding location in the app folder. After copying the files, the service automatically ejects the USB drive, and reloads the electron application.

_<span style="text-decoration:underline;">Git Repo Monitoring</span>_: The configurator can also optionally enable a system service which automatically checks for changes on the master branch of the application github repository. When enabled, the service checks the repository for new commits every 30 seconds, and automatically pulls them (and updates any submodules) if found. After the application files are updated, the service automatically restarts the electron service.

_<span style="text-decoration:underline;">Keystroke Logging</span>_: The configurator service also runs a system level keystroke logger, which will monitor the keypresses from any USB keyboard, and executes commands based on that input. By default, the logger will stop the electron service when the 'escape' and 'left control' keys are pressed at the same time. These commands can be customized by adding directives to the 'keystroke.js' file in the 'app/config' folder.

## Setup

Setup of the machine is meant to be a simple, one-command installation. See below for installation instructions for various machine types.

_<span style="text-decoration:underline;">Raspberry Pi:</span>_



1. Obtain a Raspberry Pi 3 B+. The software will work on older models, but to use all of the features, the Raspberry Pi 3 B+ will give you the best results.
2. Using the [raspberry Pi imager](https://www.raspberrypi.com/software/), burn an SD card (minimum 4GB) with Raspberry Pi OS lite.
3. Arrange for Network connection.
    1. **Wifi**:
        1. Once the card is written, re-insert it into your computer, and a drive named 'boot' should appear.
        2. If you wish to configure the Pi wifi connection, drop the contents of the ['pi boot directory' folder](https://github.com/heidgera/parcel/tree/master/install/pi%20boot%20directory) into the '/boot/' folder. The .conf file in the wifi folder is a template for a PEAP secured network. Fill this file in with the relevant network details. For more information about the wpa_supplicant.conf file, see [this link](https://linux.die.net/man/5/wpa_supplicant.conf).
        3. After booting the machine and logging in, run '/boot/wifi/setup.sh'. If the wpa_supplicant file is correct, the Pi should connect to wifi within ~10 seconds.
    2. **Wired** If not using the wifi connection, plug the Raspberry Pi into an active ethernet connection.
4. Eject the SD card from your computer, insert it into the Raspberry Pi, and plug in power.
5. Once the machine has booted, log in using the default credentials.
6. After logging in, run the following command: ```bash <(curl -sL parcel.makerspace.cc) -r REPO -a USER```
, where REPO is the repository name, and USER is the github user name that owns the repository.
7. Let the installer finish running. It will reboot once it has finished, and automatically start the application.

_<span style="text-decoration:underline;">Ubuntu 18.04 Server</span>_



1. Download and [create a bootable installer](https://tutorials.ubuntu.com/tutorial/tutorial-create-a-usb-stick-on-windows#0) for [Ubuntu 18.04 Server](http://releases.ubuntu.com/18.04/ubuntu-18.04.1.0-live-server-amd64.iso).
2. Install the operating system on the target machine.
3. Connect the target machine to an active ethernet connection, or configure wifi manually.
4. After installation, start the machine, and login with the credentials defined in the installation process.
5. Run this command in the terminal prompt: ```bash <(curl -sL parcel.makerspace.cc) -a USERNAME -r REPO```

## Configuration

All of the configuration options for the parcel wrapper are made from the individual application's config folder. This is done so that each app can carry it's particular machine setup instructions. These configuration options are detailed below.

_<span style="text-decoration:underline;">machine.js</span>:_


<table>
  <tr>
   <td>Key
   </td>
   <td>Values
   </td>
   <td>Action
   </td>
  </tr>
  <tr>
   <td>autostart
   </td>
   <td>boolean
   </td>
   <td>Configure the machine to autolaunch the electron application if true, disable autolaunch if false.
   </td>
  </tr>
  <tr>
   <td>wifiHotspot
   </td>
   <td>Javascript Object:
<p>
{<br/>
  ssid: string,<br/>
  password: string,<br/>
  domainName: string<br/>
}
   </td>
   <td>Configures the computer to create a wifi hotspot using 'wlan0', with a SSID of 'ssid', password of 'password',
<p>
and autorouting of traffic to 'domainName' to the ip address of this computer.
   </td>
  </tr>
  <tr>
   <td>wifi
   </td>
   <td>Javascript Object:<br/>
{<br/>
  ssid: string,<br/>
  password: string,<br/>
}
   </td>
   <td>Configure the computer to join 'ssid' using 'password'.
   </td>
  </tr>
  <tr>
   <td>preventSleep
   </td>
   <td>boolean
   </td>
   <td>Configures xserver to prevent screen blanking. This command also sets the mouse to be invisible, which should probably be a separate command.
   </td>
  </tr>
  <tr>
   <td>staticIP
   </td>
   <td>string
   </td>
   <td>String with the desired IPv4 address, formated "XXX.XXX.XXX.XXX"
   </td>
  </tr>
  <tr>
   <td>wifiUser
   </td>
   <td>Javascript Object:
<p>
{<br/>
  ssid: string,<br/>
  user: string,<br/>
  password: string,<br/>
  domainName: string<br/>
}
   </td>
   <td>Connect to a PEAP wifi network, using a username and credentials. Password in this case is the hashed version of the user password, obtained using:
<p>
<em>echo -n 'password_in_plaintext' | iconv -t utf16le | openssl md4 > hash.txt</em>
   </td>
  </tr>
  <tr>
   <td>autostartNode
   </td>
   <td>boolean
   </td>
   <td>Configures automatic startup of a node.js script named 'index.js' in the main app directory.
   </td>
  </tr>
  <tr>
   <td>softShutdown
   </td>
   <td>Javascript Object:<br/>
{<br/>
  monitorPin: number,<br/>
  controlPin: number,<br/>
  delayTime: number,<br/>
}
   </td>
   <td>Configures a battery-backup enabled softshutdown. 'delayTime' milliseconds after the computer sees the voltage on 'monitorPin' go to zero, the computer will shutdown, and cause 'controlPin' to go high. Pin numbers are specified in BCM pin numbers.
   </td>
  </tr>
  <tr>
   <td>gitWatch
   </td>
   <td>boolean
   </td>
   <td>Configures a service to automatically track changes to the app github repository. When changes are detected, pull them, and restart the electron app.
   </td>
  </tr>
</table>


_<span style="text-decoration:underline;">app.js</span>_


<table>
  <tr>
   <td>Key
   </td>
   <td>Values
   </td>
   <td>Action
   </td>
  </tr>
  <tr>
   <td>showDevTools
   </td>
   <td>boolean
   </td>
   <td>Display developer tools within the application.
   </td>
  </tr>
  <tr>
   <td>windows
   </td>
   <td>Array of window config objects
   </td>
   <td>Each of these objects is used to create a window for the application. If this variable is not declared, application will automatically create window pointing to 'app/local/index.html'
   </td>
  </tr>
</table>


_<span style="text-decoration:underline;">Window Config Object for app.js</span>_


<table>
  <tr>
   <td>Key
   </td>
   <td>Values
   </td>
   <td>Action
   </td>
  </tr>
  <tr>
   <td>label
   </td>
   <td>string
   </td>
   <td>Names a given window. Used for storing display bindings and sending inter-window messages.
   </td>
  </tr>
  <tr>
   <td>fullscreen
   </td>
   <td>boolean
   </td>
   <td>Tells the application to open the window full screen.
   </td>
  </tr>
  <tr>
   <td>alwaysOnTop
   </td>
   <td>boolean
   </td>
   <td>Prevent windows from other applications from appearing over this window.
   </td>
  </tr>
  <tr>
   <td>displayId
   </td>
   <td>string
   </td>
   <td>Explicitly tell the program which display to use for the window.
   </td>
  </tr>
  <tr>
   <td>file
   </td>
   <td>string
   </td>
   <td>Relative address of the html file to open in this window.
   </td>
  </tr>
  <tr>
   <td>url
   </td>
   <td>string
   </td>
   <td>If file not declared, application will navigate the window to the web address specified in this variable.
   </td>
  </tr>
  <tr>
   <td>size
   </td>
   <td>Object:<br/>
{<br/>
  height: number,<br/>
  width: number<br/>
}
   </td>
   <td>Size, in pixels to draw the window, if not fullscreen.
   </td>
  </tr>
  <tr>
   <td>position
   </td>
   <td>Object:<br/>
{<br/>
  x: number,<br/>
  y: number<br/>
}
   </td>
   <td>Coordinates, in pixels, to display the window.
   </td>
  </tr>
</table>


_<span style="text-decoration:underline;">keystroke.js:</span>_

This is a javascript file, in which you can define actions to occur on given keypresses. There is a keylogger which launches as a part of the configurator file, which emits events that can be interpreted by this file. The list of available keys can be found in [this file](https://github.com/scimusmn/stele-lite/blob/master/configurator/src/keyLogger.js).


<!-- Docs to Markdown version 1.0β16 -->
=======
# Parcel
>>>>>>> 5ffbc7b069359c789705b9bc7f4bf9c25d5745d5
