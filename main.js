'use strict';

const electron = require('electron');

var fs = require('fs');

global.obtain = (addr, func)=> func.apply(null, addr.map(adr=>require(adr)));

var ipcMain = electron.ipcMain;

if (!window) var window = global;

global.config = require(`${__dirname}/app/config/app.js`);

if (process.platform == 'linux' && fs.existsSync('/boot/SAFEMODE')) process.exit(0);

obtain(['path', 'url', 'child_process', 'os'], (path, url, { execSync }, os)=> {

  // Module to control application life.
  const app = electron.app;
  app.commandLine.appendSwitch('--enable-viewport-meta', 'true');
  app.allowRendererProcessReuse = false;

  // Module to create native browser window.
  const BrowserWindow = electron.BrowserWindow;

  global.appRoot = path.resolve(__dirname);

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let windows = {};

  var createWindow = (info)=> {
    var size = info.size;

    var temp = new BrowserWindow({
      fullscreen: info.fullscreen,
      simpleFullscreen: true,
      alwaysOnTop: info.alwaysOnTop,
      width: size.width,
      height: size.height,
      x: info.location.x,
      y: info.location.y,
      frame: true,

      //kiosk: true,
      scrollBounce: false,
      title: info.title,
      offscreen: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    });

    temp.webContents.label = info.title;

    if (info.devTools) temp.webContents.openDevTools();

    temp.setMenu(null);

    if (info.file) {
      temp.loadURL(url.format({
        pathname: path.join(__dirname, info.file),
        protocol: 'file:',
        slashes: true,
      }));
    } else {
      temp.loadURL(info.url);
    }

    temp.webContents.session.clearCache(function () {
      //some callback.
    });

    temp.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      //booth = null;
      //playback = null;
    });

    temp.webContents.on('crashed', ()=> {
      temp.reload();
    });

    return temp;
  };

  var createWindowForDisplay = (display, wind)=> {
    if (!windows[wind.label]) windows[wind.label] = createWindow({
      fullscreen: wind.fullscreen,
      alwaysOnTop: wind.alwaysOnTop,
      devTools: config.showDevTools,
      size: wind.size || display.size,
      location: (wind.position) ? {
        x: display.bounds.x + wind.position.x,
        y: display.bounds.y + wind.position.y,
      } : display.bounds,
      title: wind.label,
      file: wind.file,
      url: wind.url,
    });
  };

  var DISPLAY_BINDING_PATH = appRoot + '/current/windowBindings.json';

  function makeWindows() {

    // if we have multiple windows specified in the config, try to pair them
    // with a display
    if (config.windows) {
      var binds = {};
      if (fs.existsSync(DISPLAY_BINDING_PATH)) {
        binds = JSON.parse(fs.readFileSync(DISPLAY_BINDING_PATH));

        for (var winLabel in binds) {
          if (binds.hasOwnProperty(winLabel)) {
            var wind = config.windows.find(wind=>wind.label == winLabel);
            if (wind) {
              wind.displayId = binds[winLabel];
            }
          }
        }
      }

      var displays = electron.screen.getAllDisplays();

      // call this to relocate windows to their proper positions.
      var refixWindows = ()=> {
        config.windows.forEach(win=> {
          if (windows[win.label]) {
            var disp = displays.find(disp=>disp.id == win.displayId);
            if (disp) {
              var size = win.size || disp.size;
              var pos = (win.position) ? {
                x: disp.bounds.x + win.position.x,
                y: disp.bounds.y + win.position.y,
              } : disp.bounds;
              windows[win.label].setBounds({
                x: pos.x,
                y: pos.y,
                width: size.width,
                height: size.height,
              });
            }
          }
        });
      };

      // for each attached display,
      displays.forEach(display=> {
        if (config.windows.find(wind=>wind.displayId !== undefined && display.id == wind.displayId)) {
          // find a window with a matching display id, and create a window for it.
          config.windows.forEach(wind=> {
            if (display.id == wind.displayId) createWindowForDisplay(display, wind);
          });
        } else {
          //otherwise create a window asking to make a window for that display
          windows[display.id] = createWindow({
            fullscreen: false,
            devTools: false,
            size: {
              width: display.size.width / 2,
              height: display.size.height / 2,
            },
            location: {
              x: display.bounds.x + Math.floor(display.size.width / 4),
              y: display.bounds.y + Math.floor(display.size.height / 4),
            },
            title: display.id,
            file: './newMonitor.html',
          });
        }
      });

      // if we receive a message from one of the windows asking to talk to another
      // forward the message on
      ipcMain.on('interwindow', (evt, arg)=> {
        arg.data.from = evt.sender.label;
        arg.data.self = arg.target;
        if (windows[arg.target]) windows[arg.target].webContents.send(arg.channel, arg.data);
      });

      // if we receive a message from a newMonitor window asking for a specific window,
      // save the window choice for that display id to the bindings file.
      ipcMain.on('window-select', (evt, arg)=> {

        var display = displays.find(disp=> disp.id == evt.sender.label);
        var wind = config.windows.find(wind=>wind.label == arg.window);

        binds[wind.label] = evt.sender.label;

        fs.writeFileSync(DISPLAY_BINDING_PATH, JSON.stringify(binds));

        createWindowForDisplay(display, wind);

        windows[evt.sender.label].close();
      });

      // if we see a monitor added to the computer, check to see if there are any windows for it
      electron.screen.on('display-added', (evt, display)=> {

        config.windows.forEach(wind=> {
          if (display.id == wind.displayId) createWindowForDisplay(display, wind);
        });

        // and fix any display errors we may have had.
        refixWindows();
      });


      // if we remove a monitor, destroy any windows that were meant for it
      electron.screen.on('display-removed', (evt, display)=> {

        var wind = config.windows.find(win => display.id == win.displayId);

        if (windows[wind.label]) windows[wind.label].close();

        windows[wind.label] = null;

        refixWindows();

      });
    } else {
      // if we don't have any windows defined in the config file,
      // make one with the default location (app/local/index.html)

      var display = electron.screen.getPrimaryDisplay();

      var wind = {
        label: 'main',
        fullscreen: false,
        alwaysOnTop: false,
        //displayId: '69733248', //manually specify
        file: 'app/local/index.html',
      };

      createWindowForDisplay(display, wind);
    }

  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', ()=> {
    var launched = false;
    var watcher = null;
    makeWindows();
    launched = true;

    // this delayed starting the app if not everything was installed, unnecessary
    // if (fs.existsSync(appRoot + '/current/appReady')) {
    //   makeWindows();
    //   launched = true;
    // } else watcher = fs.watch(appRoot + '/current', (eventType, fname)=> {
    //   console.log(eventType);
    //   if (!launched && eventType == 'rename' && fname == 'appReady') {
    //     makeWindows();
    //     launched = true;
    //     if (watcher) watcher.close();
    //   }
    // });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (windows === null) {
    //   //createWindow();
    // }
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
});
