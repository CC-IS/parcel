obtain(['fs', 'child_process'], (fs, { spawn })=> {
  exports.copyConfigFile = (src, dest, fillObj)=> {
    fs.writeFileSync(dest, '');
    fs.readFileSync(src).toString().split('\n').forEach(function(line) {
      if (fillObj) {
        var reg = /\${([^}]*)}/;
        var ln = line.toString();
        if (ln.search(reg) >= 0) {
          let repl = ln.replace(reg, (match, p1, offset, string)=> {
            if (fillObj[p1]) return fillObj[p1];
            else return '';
          });
          fs.appendFileSync(dest, repl + '\n');
        } else {
          fs.appendFileSync(dest, line.toString() + '\n');
        }
      } else fs.appendFileSync(dest, line.toString() + '\n');
    });
  };

  exports.call = function(cmd) {
    var _this = this;
    _this.command = cmd;
    _this.running = false;
    var args = [];

    _this.addArgument = (str) => {
      args.push(str);
      return _this;
    };

    _this.setArguments = (argarray) => {
      args = argarray;
    };

    _this.outHandler = (data)=> {
      console.log(`stdout: ${data}`);
    };

    _this.errHandler = (data)=> {
      console.log(`stderr: ${data}`);
    };

    _this.onClose = ()=> {};

    _this.run = () => {
      _this.running = true;
      let proc = spawn(_this.command, args);
      proc.stdout.on('data', (data)=> {
        _this.outHandler(data);
      });

      proc.stderr.on('data', (data)=> {
        _this.errHandler(data);
      });

      proc.on('exit', (code)=> {
        _this.running = false;
        _this.onClose();
      });
    };
  };
});
