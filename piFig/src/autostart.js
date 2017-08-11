obtain(['./src/utils.js', 'child_process'], ({ copyConfigFile, call: Call }, { exec })=> {

  var mainDir = __dirname.substring(0, __dirname.indexOf('piFig/src'));
  var startup = '@reboot startx ' + mainDir + 'node_modules/electron/dist/electron ' + mainDir;

  console.log(startup);

  exports.configure = ()=> {
    console.log(startup);
    var command = '(crontab -u pi -l ; echo "' + startup + '") | crontab -u pi -';
    if (__dirname.indexOf('/home/pi') >= 0) exec(command);
    else console.error('System not a pi, preventing install');
  };

  exports.remove = ()=> {
    var command = 'crontab -u pi -l | grep -v "' + startup + '"  | crontab -u pi -';
    if (__dirname.indexOf('/home/pi') >= 0) exec(command);
    else console.error('System not a pi, preventing uninstall');
  };
});
