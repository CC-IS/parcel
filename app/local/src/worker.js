self.addEventListener('message', (e)=>{
  var start = Date.now();

  setInterval(()=>{self.postMessage(Date.now()-start), start = Date.now()},1);
});
