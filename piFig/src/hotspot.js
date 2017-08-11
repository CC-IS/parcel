obtain(['fs', './src/utils.js'], (fs, { copyConfigFile, call: Call })=> {
  var writeInterfaceFile = ()=> {
    copyConfigFile('./src/configFiles/interfaces', '/etc/network/interfaces');
  };

  var writeHostsFile = (domainName)=> {
    copyConfigFile('./src/configFiles/hosts', '/etc/hosts', { DOMAIN_NAME: domainName });
  };

  var writeApdConfFile = (ssid, pass)=> {
    copyConfigFile('./src/configFiles/hostapd.conf', '/etc/hostapd/hostapd.conf', { SSID: ssid, PASSWORD: pass });
  };

  var writeApdDefaultsFile = ()=> {
    copyConfigFile('./src/configFiles/hostapd_defaults', '/etc/default/hostapd');
  };

  var writeDhcpcdConfFile = ()=> {
    copyConfigFile('./src/configFiles/dhcpcd.conf', '/etc/dhcpcd.conf');
  };

  var writeDnsmasqConfFile = (domainName)=> {
    copyConfigFile('./src/configFiles/dnsmasq.conf', '/etc/dnsmasq.conf', { DOMAIN_NAME: domainName });
  };

  exports.configure = (cfgObj)=> {
    if (cfgObj.password.length > 7) {
      writeInterfaceFile();
      writeHostsFile(cfgObj.domainName);
      writeApdConfFile(cfgObj.ssid, cfgObj.password);
      writeApdDefaultsFile();
      writeDhcpcdConfFile();
      writeDnsmasqConfFile(cfgObj.domainName);
      var restart = new Call(window.µdir + '/piFig/configFiles/restartHotspot.sh');
      restart.run();
    } else console.error('Error: Password must be 8 or more characters');
  };
});
