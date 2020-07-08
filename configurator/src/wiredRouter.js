obtain(['fs', `${__dirname}/utils.js`, 'child_process'], (fs, { copyConfigFile }, { exec })=> {
  var writeInterfaceFile = ()=> {
    copyConfigFile(`${__dirname}/../templates/interfaces_wired`, '/etc/network/interfaces');
  };

  var writeHostsFile = (domainName)=> {
    copyConfigFile(`${__dirname}/../templates/hosts_wired`, '/etc/hosts', { DOMAIN_NAME: domainName });
  };

  var writeDhcpcdConfFile = ()=> {
    copyConfigFile(`${__dirname}/../templates/dhcpcd_wired.conf`, '/etc/dhcpcd.conf');
  };

  var writeDnsmasqConfFile = (domainName)=> {
    copyConfigFile(`${__dirname}/../templates/dnsmasq_wired.conf`, '/etc/dnsmasq.conf', { DOMAIN_NAME: domainName });
  };

  exports.configure = (cfgObj)=> {
    if (cfgObj.domainName) {
      writeInterfaceFile();
      writeHostsFile(cfgObj.domainName);
      writeDhcpcdConfFile();
      writeDnsmasqConfFile(cfgObj.domainName);
    } else console.error('Error: Must include domain name.');
  };
});
