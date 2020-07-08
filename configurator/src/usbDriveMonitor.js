
var obs = [
  'fs',
  `${__dirname}/driveWatch.js`,
  'child_process',
];

obtain(obs, (fs, { monitor }, { exec, execSync })=> {
  exports.startWatch = (paths)=> {
    monitor.begin();

    monitor.on('connected', (which)=> {
      monitor.mount(which);
    });

    monitor.on('mounted', (which)=> {

      if (fs.existsSync(`${which.mountpoints[0].path}/update/update.js`)) {
        var update = require(`${which.mountpoints[0].path}/update/update.js`).updatePaths;

        console.log('updating app...');

        for (var key in update) {
          if (update.hasOwnProperty(key)) {
            if (key == 'app') {
              if (update[key].length) {
                var base = `${which.mountpoints[0].path}/update/${key}/`;
                update[key].forEach(path=> {
                  if (path[path.length - 1] == '/') path.length--;
                  console.log(`copying "${paths[key] + path}"`);
                  execSync(`cp -rf "${base + path}" "${paths[key] + path}"`);
                });
              }

            }
          }
        }

        console.log('stopping electron');
        exec('sudo systemctl stop electron.service', ()=> {
          console.log('restarting electron');
          exec('sudo systemctl start electron.service');
        });

        monitor.unmount(which);
      } else monitor.unmount(which);
    });
  };
});
