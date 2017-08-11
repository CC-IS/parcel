
/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function(launchData) {
  chrome.app.window.create(
    'index.html',
    {
      //id: 'mainWindow',
      state: 'fullscreen',
      //innerBounds: {width: 1920, height: 1080},
    },
    function(win) {win.contentWindow.isApp = true;}
  );

});
