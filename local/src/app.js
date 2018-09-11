'use strict';

var remote = require('electron').remote;

var process = remote.process;

//remote.getCurrentWindow().closeDevTools();

var obtains = [
  'drivelist',
  'usb-detection',
];

obtain(obtains, (drivelist, monitor)=> {

  exports.app = {};

  var sent = false;

  var data = [];

  var fadeInt;
  var dir = 1;
  var val = 0;

  exports.app.start = ()=> {

    console.log('started');

    document.onkeypress = (e)=> {
      //if (e.key == ' ') console.log('Space pressed'), hardware.digitalWrite(13, 1);
    };

    document.onkeyup = (e)=> {
      if (e.which == 27) {
        var electron = require('electron');
        process.kill(process.pid, 'SIGINT');
      } else if (e.which == 73 && e.getModifierState('Control') &&  e.getModifierState('Shift')) {
        remote.getCurrentWindow().toggleDevTools();
      }
    };

    process.on('SIGINT', ()=> {
      process.nextTick(function () { process.exit(0); });
    });
  };

  provide(exports);
});
