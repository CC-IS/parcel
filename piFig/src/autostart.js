obtain(['./src/utils.js', 'child_process'], ({ copyConfigFile, call: Call }, { execSync })=> {

  var mainDir = __dirname.substring(0, __dirname.indexOf('piFig/src'));
  var startup = 'sudo startx ' + mainDir + 'node_modules/.bin/electron ' + mainDir;

  console.log(startup);

  exports.remove = ()=> {
    var command = 'sed -i".bak" "/node_modules\\/\\.bin\\/electron/d" /home/pi/.bashrc';
    console.log(command);
    if (__dirname.indexOf('/home/pi') >= 0) execSync(command);
    else console.error('System not a pi, preventing uninstall');
  };

  exports.configure = ()=> {
    exports.remove();
    var command = 'echo "' + startup + '" >> /home/pi/.bashrc';
    console.log(command);
    if (__dirname.indexOf('/home/pi') >= 0) execSync(command);
    else console.error('System not a pi, preventing install');
  };
});
