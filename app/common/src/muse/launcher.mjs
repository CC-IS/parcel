var started = false;

obtain([window.appScript], (imports)=> {
  if (!started) {
    started = true;
    console.log(imports[0].app.start);
    if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') imports[0].app.start();
    else document.addEventListener('DOMContentLoaded', function (event) {
      imports[0].app.start();
    });

  }
});
