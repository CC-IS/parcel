'use strict';

var process = require('electron').remote.process;

obtain([], ()=> {
  exports.app = {};

  exports.app.start = ()=> {
    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' ') console.log('Space pressed');
      else if
    };

    document.onkeyup = (e)=> {
      if (e.which == 27) {
        var electron = require('electron');
        process.kill(process.pid, 'SIGINT');
      }
    };

    process.on('SIGINT',()=>{
      process.nextTick(function () { process.exit(0); });
    });
  };

  provide(exports);
});
