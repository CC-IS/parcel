var obs = [
  'child_process',
  'os',
];

obtain(obs, ({ exec, execSync }, os)=> {
  exports.key_functions = [
    (code, states)=> {
      if (states[1] && states[29]) execSync('sudo systemctl stop electron.service');
    },
  ];
});
