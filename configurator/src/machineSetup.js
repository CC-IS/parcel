if (!window) var window = global;

if (!window.setupDir)
  window.setupDir = (process.platform != 'linux') ?  `${__dirname}/../app/config/setup/` :
                      (process.arch == 'x64') ? `${__dirname}/../app/config/setup/` :
                      '/boot/setup/';

if (!window.appDataDir)
  window.appDataDir = (process.platform != 'linux') ?  `${__dirname}/../config/appData/` :
                      (process.arch == 'x64') ? `${__dirname}/../app/config/appData/` :
                      '/boot/appData/';

window.bundleRoot = __dirname.substring(0, __dirname.indexOf('/configurator/src'));

var obs = [
  `${__dirname}/hotspot.js`,
  `${__dirname}/wifi.js`,
  `${__dirname}/staticIP.js`,
  `${__dirname}/preventSleep.js`,
  `${__dirname}/softShutdown.js`,
  `${window.setupDir}/machineConfig.js`,
  `${__dirname}/createService.js`,
  'fs',
  `${__dirname}/keyLogger.js`,
  `${__dirname}/usbDriveMonitor.js`,
  'child_process',
  'os',
];

obtain(obs, (hotspot, wifi, staticIP, preventSleep, soft, { config }, services, fs, { keyboards }, usbDrive, { exec, execSync }, os)=> {
  var pfg = config.piFig;
  if (pfg) {
    var confDir = window.setupDir + '/.currentConfig.json';
    let curCfg = {};
    if (fs.existsSync(confDir)) {
      let data = fs.readFileSync(confDir); //file exists, get the contents
      try {
        curCfg = JSON.parse(data);
      } catch (e) {
        console.log(e);
        curCfg = {};
      }

    }

    function configsMatch(cur, cfg) {
      if (!cur) return false;
      else {
        let ret = true;
        for (key in cfg) {
          if (cfg.hasOwnProperty(key)) {
            if (!cur[key] || cur[key] != cfg[key]) ret = false;
          }
        }

        return ret;
      }
    }

    var serviceFolder = bundleRoot + '/configurator/services';

    if (!curCfg.serviceFolder) {
      curCfg.serviceFolder = serviceFolder;
      curCfg.bundleRoot = bundleRoot;
    } else {
      serviceFolder = curCfg.serviceFolder;
      bundleRoot = curCfg.bundleRoot;
    }

    usbDrive.startWatch({
      appData: appDataDir,
      app: bundleRoot + '/app/',
      setup: setupDir,
    });

    if (!fs.existsSync(bundleRoot + '/app') && pfg.appRepo && !configsMatch(curCfg.appRepo, pfg.appRepo)) {
      console.log('installing application.');
      if (fs.existsSync(bundleRoot + '/app')) execSync(`rm -rf ${bundleRoot + '/app'}`);
      execSync(`runuser -l pi -c 'git clone  --recurse-submodules ${pfg.appRepo} ${bundleRoot}/app'`);
      execSync(`runuser -l pi -c 'cd ${bundleRoot}/app; npm install'`);

      if (process.platform == 'linux') {
        execSync(`ln -s ${window.setupDir} SetupFiles`, { cwd: os.homedir() });
        execSync(`ln -s ${window.appDataDir} AppDataFiles`, { cwd: os.homedir() });
      }

      fs.closeSync(fs.openSync(bundleRoot + '/appReady', 'w'));
    }

    if (pfg.wifiHotspot && !configsMatch(curCfg.wifiHotspot, pfg.wifiHotspot)) {
      console.log('Configuring wifi hotspot...');
      hotspot.configure(pfg.wifiHotspot);
      curCfg.wifiHotspot = pfg.wifiHotspot;
    }

    if (pfg.wifi && !configsMatch(curCfg.wifi, pfg.wifi)) {
      console.log('Configuring wifi...');
      wifi.configure(pfg.wifi);
      curCfg.wifi = pfg.wifi;
    }

    if (pfg.preventSleep && !configsMatch(curCfg.preventSleep, pfg.preventSleep)) {
      console.log('Prevent display sleep...');
      preventSleep.configure(pfg.preventSleep);
      curCfg.preventSleep = pfg.preventSleep;
    }

    if (pfg.staticIP && !configsMatch(curCfg.staticIP, pfg.staticIP)) {
      console.log('Configuring staticIP...');
      staticIP.configure(pfg.staticIP);
      curCfg.staticIP = pfg.staticIP;
    }

    if (pfg.wifiUser && !configsMatch(curCfg.wifiUser, pfg.wifiUser)) {
      console.log('Configuring wifi with user credentials...');
      wifi.configure(pfg.wifiUser);
      curCfg.wifiUser = pfg.wifiUser;
    }

    if (!configsMatch(curCfg.autostart, pfg.autostart)) {
      console.log('Configuring autostart...');
      if (pfg.autostart) services.configure(
        'electron',
        'Autostart main application',
        `/usr/bin/startx ${bundleRoot}/node_modules/.bin/electron ${bundleRoot}`
      );
      else if (curCfg.autostart) services.disable('electron');
      curCfg.autostart = pfg.autostart;
    }

    if (!configsMatch(curCfg.autostartNode, pfg.autostartNode)) {
      console.log('Configuring node autostart...');
      if (pfg.autostartNode) services.configure(
        'node',
        'Autostart main application',
        `/usr/bin/node ${bundleRoot}`
      );
      else if (curCfg.autostartNode) services.disable('node');
      curCfg.autostartNode = pfg.autostartNode;
    }

    if (!configsMatch(curCfg.softShutdown, pfg.softShutdown)) {
      if (pfg.softShutdown) {
        var shtd = pfg.softShutdown;
        soft.configure(shtd.controlPin);
        services.configure('powerCheck',
          'Control soft shutdown',
          `/usr/bin/node ${serviceFolder}/powerCheck.js ${shtd.monitorPin} ${shtd.delayTime}`
        );
      } else {
        services.disable('powerCheck');
      }

      curCfg.softShutdown = pfg.softShutdown;
    }

    if (!configsMatch(curCfg.gitWatch, pfg.gitWatch)) {
      if (pfg.gitWatch) services.configure(
        'gitTrack',
        'Autotrack git repo',
        `/usr/bin/node ${serviceFolder}/gitCheck.js ${bundleRoot}`
      );
      else services.disable('gitTrack');

      curCfg.gitWatch = pfg.gitWatch;
    }

    if (!curCfg.watchPiFig) {
      console.log('Setting up autowatch...');
      if (pfg.autostart) services.configure(
        'configurator',
        'Monitor machine config file on startup',
        `/usr/bin/node ${bundleRoot}/configurator/install.js`
      );

      curCfg.watchPiFig = true;
    }

    fs.writeFileSync(confDir, JSON.stringify(curCfg));
  }

  keyboards.on('keydown', (code, states)=> {
    if (states[1] && states[29]) services.stop('electron');
  });

});
