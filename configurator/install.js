global.obtain = (addr, func)=> {
  if (addr.length <= 0) func();
  else func.apply(null, addr.map(adr=>require(adr)));
};

require('./src/machineSetup.js');
