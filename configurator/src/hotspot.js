obtain(['fs', `${__dirname}/utils.js`, 'child_process'], (fs, { copyConfigFile }, { exec })=> {
  var writeInterfaceFile = ()=> {
    copyConfigFile(`${__dirname}/../templates/interfaces`, '/etc/network/interfaces');
  };

  var writeHostsFile = (domainName)=> {
    copyConfigFile(`${__dirname}/../templates/hosts`, '/etc/hosts', { DOMAIN_NAME: domainName });
  };

  var writeApdConfFile = (ssid, pass)=> {
    copyConfigFile(`${__dirname}/../templates/hostapd.conf`, '/etc/hostapd/hostapd.conf', { SSID: ssid, PASSWORD: pass });
  };

  var writeApdDefaultsFile = ()=> {
    copyConfigFile(`${__dirname}/../templates/hostapd_defaults`, '/etc/default/hostapd');
  };

  var writeDhcpcdConfFile = ()=> {
    copyConfigFile(`${__dirname}/../templates/dhcpcd.conf`, '/etc/dhcpcd.conf');
  };

  var writeDnsmasqConfFile = (domainName)=> {
    copyConfigFile(`${__dirname}/../templates/dnsmasq.conf`, '/etc/dnsmasq.conf', { DOMAIN_NAME: domainName });
  };

  exports.configure = (cfgObj)=> {
    if (cfgObj.password.length > 7) {
      writeInterfaceFile();
      writeHostsFile(cfgObj.domainName);
      writeApdConfFile(cfgObj.ssid, cfgObj.password);
      writeApdDefaultsFile();
      writeDhcpcdConfFile();
      writeDnsmasqConfFile(cfgObj.domainName);
      exec(`${__dirname}/../src/restartHotspot.sh`, (err, stdout, stderr)=> {});
    } else console.error('Error: Password must be 8 or more characters');
  };
});
