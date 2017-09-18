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
      var electron = require('electron');
      if (e.which == 27) {
        electron.remote.process.exit();
      }
    };

  };

  provide(exports);
});
