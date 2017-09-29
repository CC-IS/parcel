'use strict';

obtain(['./src/server/express.js'], (hw)=> {
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
        electron.remote.process.exit();
      }
    };
  };

  provide(exports);
});
