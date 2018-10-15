'use strict';

var { remote, ipcRenderer: comm } = require('electron');

var config = remote.getGlobal('config');

var process = remote.process;

var µ = query=>document.querySelector(query);

/*if (document) window.µ = function (id, elem) {
  var ret;
  var root = ((elem) ? elem : document);
  var spl = id.split('>');
  switch (spl[0].charAt(0)) {
    case '|':
      ret = root;
      break;
    case '+':
      ret = document.createElement(spl[0].substring(1));
      if (elem) elem.appendChild(ret);
      break;
    case '#':
      ret = root.querySelector(spl[0]);
      break;
    default:
      ret = Array.from(root.querySelectorAll(spl[0]));

      ret.style = function (mem, val) {
        for (let i = 0; i < ret.length; i++) {
          ret[i].style[mem] = val;
        }
      };

      //}
      break;
  }
  if (spl.length <= 1) return ret;
  else return ret.getAttribute(spl[1]);
};*/

document.addEventListener('DOMContentLoaded', function (event) {
  console.log('here');
  var windows = null;

  windows = config.windows;
  config.windows.forEach(wind=> {
    let newOpt = document.createElement('option');
    newOpt.textContent = wind.label;
    newOpt.value = wind.label;
    µ('#windows').appendChild(newOpt);
  });

  µ('#windows').onchange = ()=> {
    var wnd = config.windows.find(wind=>wind.label == µ('#windows').value);
    µ('#demo').src = wnd.file;
  };

  µ('#save').onmousedown = ()=> {
    if (µ('#windows').value) {
      comm.send('window-select', {
        window: µ('#windows').value,
      });
    } else {
      //µ('#growl').message('Please select a window', 'warn');
    }
  };

  process.on('SIGINT', ()=> {
    process.nextTick(function () { process.exit(0); });
  });
});
