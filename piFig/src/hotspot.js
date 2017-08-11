obtain(['fs', './src/utils.js'], (fs, { copyConfigFile, call: Call })=> {
  var writeInterfaceFile = ()=> {
    copyConfigFile('./configFiles/interfaces', '/etc/network/interfaces');
  };

  var writeHostsFile = (domainName)=> {
    copyConfigFile('./configFiles/hosts', '/etc/hosts', { DOMAIN_NAME: domainName });
  };

  var writeApdConfFile = (ssid, pass)=> {
    copyConfigFile('./configFiles/hostapd.conf', '/etc/hostapd/hostapd.conf', { SSID: ssid, PASSWORD: pass });
  };

  var writeApdDefaultsFile = ()=> {
    copyConfigFile('./configFiles/hostapd_defaults', '/etc/default/hostapd');
  };

  var writeDhcpcdConfFile = ()=> {
    copyConfigFile('./configFiles/dhcpcd.conf', '/etc/dhcpcd.conf');
  };

  var writeDnsmasqConfFile = (domainName)=> {
    copyConfigFile('./configFiles/dnsmasq.conf', '/etc/dnsmasq.conf', { DOMAIN_NAME: domainName });
  };

  exports.configure = (cfgObj)=> {
    if (cfgObj.password.length > 7) {
      writeInterfaceFile();
      writeHostsFile(cfgObj.domainName);
      writeApdConfFile(cfgObj.ssid, cfgObj.password);
      writeApdDefaultsFile();
      writeDhcpcdConfFile();
      writeDnsmasqConfFile(cfgObj.domainName);
      var restart = new Call('./src/restartHotspot.sh');
      restart.run();
    } else console.error('Error: Password must be 8 or more characters');
  };
});
