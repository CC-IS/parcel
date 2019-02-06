
if ! $(ping -c 1 -W 1 1.1.1.1 > /dev/null 2>&1)
then
  echo -e "\n** Waiting for network..."
  while ! $(ping -c 1 -W 1 1.1.1.1 > /dev/null 2>&1); do
     echo "Still waiting..."
     sleep 1
  done
else
  echo -e 'Peachy!'
fi

handleError ()
{
  echo -e "\n*******************************************************"
  echo -e "Error while installing."
  echo -e "\nRestart the install script and try again."
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

workingText &
FEEDBACK_PID=$!

ping -c 10 -W 1 1.1.1.1 > /dev/null 2>&1

kill $FEEDBACK_PID

trap "handleError" ERR

echo 'this is a test'

return

echo "also a test"
