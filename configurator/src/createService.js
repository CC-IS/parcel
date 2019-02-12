obtain([`${__dirname}/utils.js`, 'child_process', 'fs'], ({ copyConfigFile, call: Call }, { execSync }, fs)=> {

  exports.disable = (serviceName)=> {
    if (fs.existsSync(`/etc/systemd/system/${serviceName}.service`))
      execSync(`sudo systemctl disable ${serviceName}.service`);
    else console.error('Service not installed.');
  };

  exports.configure = (serviceName, serviceDescription, startCommand)=> {
    copyConfigFile(`${__dirname}/../templates/serviceTemplate`,
      `/etc/systemd/system/${serviceName}.service`, {
        START_COMMAND: startCommand,
        DESCRIPTION_TEXT: serviceDescription,
      }
    );
    execSync(`sudo systemctl enable ${serviceName}.service`);
  };

  exports.stop = (serviceName)=> {
    execSync(`sudo systemctl stop ${serviceName}.service`);
  };

  exports.start = (serviceName)=> {
    execSync(`sudo systemctl start ${serviceName}.service`);
  };
});
