if (!window) var window = global;

window.bundleRoot = __dirname.substring(0, __dirname.indexOf('/configurator/src'));

if (!window.setupDir) window.setupDir = `${window.bundleRoot}/app/config/`;

var opts = process.argv;

if (~opts.indexOf('--setup-dir')) {
  var ind = opts.indexOf('--setup-dir');
  window.setupDir = opts[ind + 1];
  console.log(`setup dir is ${window.setupDir}`);
}

var userInd = opts.indexOf('--user') + 1;

var user = userInd ? opts[userInd] : 'pi';

var firstRun = false;

var obs = [
  `${__dirname}/hotspot.js`,
  `${__dirname}/wiredRouter.js`,
  `${__dirname}/wifi.js`,
  `${__dirname}/staticIP.js`,
  `${__dirname}/preventSleep.js`,
  `${__dirname}/softShutdown.js`,
  `${window.setupDir}/machine.js`,
  `${__dirname}/createService.js`,
  'fs',
  `${__dirname}/keyLogger.js`,
  `${__dirname}/usbDriveMonitor.js`,
  'child_process',
  'os',
];

obtain(obs, (hotspot, wiredRouter, wifi, staticIP, preventSleep, soft, { config }, services, fs, { keyboards: kbds }, usbDrive, { exec, execSync }, os)=> {

  if (process.platform == 'linux' && fs.existsSync('/boot/SAFEMODE')) {
    console.log('Starting in safemode; exiting application.');
    process.exit(0);
  }

  console.log(`Current user is ${user}`);

  var pfg = config.machine;
  if (pfg) {
    var confDir = window.bundleRoot + '/current/machine.json';
    let curCfg = {};
    if (fs.existsSync(confDir)) {
      let data = fs.readFileSync(confDir); //file exists, get the contents
      try {
        curCfg = JSON.parse(data);
      } catch (e) {
        console.log(e);
        firstRun = true;
        curCfg = {};
      }

    } else {
      firstRun = true;
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
      app: bundleRoot + '/app/',
    });

    // var acInd = opts.indexOf('--account') + 1;
    // var rInd = opts.indexOf('--repo') + 1;
    //
    // var repoAddr = curCfg.appRepo;
    //
    // if (acInd || rInd || !repoAddr) {
    //   var account = acInd ? opts[acInd] : 'scimusmn';
    //   var repo = rInd ? opts[rInd] : 'SteleLite-AppTemplate';
    //
    //   repoAddr = `https://github.com/${account}/${repo}`;
    // } else repoAddr = curCfg.appRepo;
    //
    // if (!fs.existsSync(bundleRoot + '/app') || (curCfg.appRepo != repoAddr)) {
    //   console.log(`Installing application ${repo}...`);
    //   if (fs.existsSync(bundleRoot + '/app')) execSync(`rm -rf ${bundleRoot + '/app'}`);
    //   if (fs.existsSync(bundleRoot + '/current/appReady')) execSync(`rm -f ${bundleRoot + '/current/appReady'}`);
    //   execSync(`runuser -l ${user} -c 'git clone  --recurse-submodules ${repoAddr} ${bundleRoot}/app'`);
    //   console.log('Done!');
    //
    //   console.log(`Running npm install for ${repo}...`);
    //   execSync(`runuser -l ${user} -c 'cd ${bundleRoot}/app; npm install > /dev/null 2>>~/stele_install.log'`);
    //   console.log('Done!');
    //
    //   fs.closeSync(fs.openSync(bundleRoot + '/current/appReady', 'w'));
    //
    //   curCfg.appRepo = repoAddr;
    // }

    if (pfg.wifiHotspot && !configsMatch(curCfg.wifiHotspot, pfg.wifiHotspot)) {
      console.log('Configuring wifi hotspot...');
      hotspot.configure(pfg.wifiHotspot);
      curCfg.wifiHotspot = pfg.wifiHotspot;
    }

    if (pfg.wiredRouter && !configsMatch(curCfg.wiredRouter, pfg.wiredRouter)) {
      console.log('Configuring wired router...');
      wiredRouter.configure(pfg.wiredRouter);
      curCfg.wiredRouter = pfg.wiredRouter;
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
      console.log('Configuring electron autostart...');

      if (pfg.autostart) {
        var env = ((pfg.autostart.env) ? pfg.autostart.env + ' ' : '');
        services.configure(
          'electron',
          'Autostart main application',
          `${env}/usr/bin/startx ${bundleRoot}/node_modules/.bin/electron ${bundleRoot}`
        );
      } else if (curCfg.autostart) services.disable('electron');
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
      console.log('Configuring soft shutdown...');
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
      console.log('Configuring git repo autowatch...');
      if (pfg.gitWatch) services.configure(
        'gitTrack',
        'Autotrack git repo',
        `/usr/bin/node ${serviceFolder}/gitCheck.js ${bundleRoot}/app`
      );
      else services.disable('gitTrack');

      curCfg.gitWatch = pfg.gitWatch;
    }

    if (!curCfg.monitorConfig) {
      console.log('Setting up config auto launch...');
      if (pfg.autostart) services.configure(
        'configurator',
        'Monitor machine config file on startup',
        `/usr/bin/node ${bundleRoot}/configurator/install.js`
      );

      curCfg.monitorConfig = true;
    }

    fs.writeFileSync(confDir, JSON.stringify(curCfg));
  }

  var combos = null;

  if (fs.existsSync(`${bundleRoot}/app/config/keystroke.js`)) {
    var combos = require(`${bundleRoot}/app/config/keystroke.js`).key_functions;
  }

  kbds.on('keydown', (code, states)=> {
    if (combos) {
      combos.forEach((cmb)=>cmb(code, states, kbds.keys));
    } else if (kbds.keys.ESC && kbds.keys.LEFTCTRL) services.stop('electron');

  });

  console.log('* System configuration complete.');

  if (~process.argv.indexOf('--config-only')) {
    process.exit();
  }

});
