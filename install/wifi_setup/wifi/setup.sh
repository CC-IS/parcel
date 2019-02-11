DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

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
