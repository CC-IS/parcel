'use strict';

obtain(['./src/server/express.js'], (hw)=> {
  exports.app = {};

  piFig.setupAutostart();

  exports.app.start = ()=> {
    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' ') console.log('Space pressed');
    };

  };

  provide(exports);
});
