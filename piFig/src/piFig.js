var obs = ['./src/hotspot.js', './src/wifi.js', './src/autostart.js', './config.js', 'fs'];

obtain(obs, (hotspot, wifi, auto, { config }, fs)=> {
  var pfg = config.piFig;
  if (pfg) {
    var confDir = './currentConfig.json';
    let curCfg = {};
    if (fs.existsSync(confDir)) {
      let data = fs.readFileSync(confDir); //file exists, get the contents
      curCfg = JSON.parse(data);
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

    if (pfg.wifiHotspot && !configsMatch(curCfg.wifiHotspot, pfg.wifiHotspot)) {
      console.log('Configuring wifi hotspot...');
      hotspot.configure(pfg.wifiHotspot);
      curCfg.wifiHotspot = pfg.wifiHotspot;
    } else if (pfg.wifi && !configsMatch(curCfg.wifi, pfg.wifi)) {
      console.log('Configuring wifi...');
      wifi.configure(pfg.wifi);
      curCfg.wifi = pfg.wifi;
    } else if (!configsMatch(curCfg.autostart, pfg.autostart)) {
      console.log('Configuring autostart...');
      if (pfg.autostart) auto.configure();
      else auto.remove();
      curCfg.autostart = pfg.autostart;
    } else if (pfg.smoothShutdown) {
      console.log('smooth shutdown');
    }

    fs.writeFileSync(confDir, JSON.stringify(curCfg));
  }
});
