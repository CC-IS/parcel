'use strict';

obtain(['./src/server/express.js', 'µ/piFig/piFig.js'], (hw, piFig)=> {
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
