obtain(['fs', `${__dirname}/utils.js`], (fs, utils)=> {
  var writeStaticConfFiles = (ip)=> {
    utils.copyConfigFile(`${__dirname}/../templates/dhcpcd_staticIP.conf`,
                          '/etc/dhcpcd.conf',
                          { STATIC_IP: ip });
    utils.copyConfigFile(`${__dirname}/../templates/interfaces_staticIp`,
                          '/etc/network/interfaces');
  };

  exports.configure = (ip)=> {
    writeStaticConfFiles(ip);
  };

});
