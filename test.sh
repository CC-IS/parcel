
#!/bin/bash

handleError ()
{
  echo -e "\n*******************************************************"
  echo -e "Error while installing."
  echo -e "\nRestart the install script and try again."
}

startWorking()
{
  workingText 2> /dev/null&
  FEEDBACK_PID=$!
}

doneWorking()
{
  kill -1 $FEEDBACK_PID
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


trap "doneWorking" EXIT

startWorking

#ping -c 3 -W 1 1.1.1.1 > /dev/null 2>&1
while [ $(npm i 2> >( tee -a ~/stele_install.log | grep -o -i EJSONPARSE) = 'EJSONPARSE') ]; do
  echo -e "\nDNS error while trying to install packages, retrying..."
done

doneWorking

trap "handleError" ERR


echo 'this is a test'

#return

echo "also a test"
