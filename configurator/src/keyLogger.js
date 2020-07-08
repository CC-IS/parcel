'use strict';

var fs = require('fs');
var { EventEmitter } = require('events');
//var { execSync } = require('child_process');

var EV_SYN = 0;
var EV_KEY = 1;
var EV_REL = 2;
var EV_ABS = 3;
var EVENT_TYPES = ['keyup', 'keypress', 'keydown'];

var keys = {
  ESC: 1,
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 10,
  0: 11,
  MINUS: 12,
  EQUAL: 13,
  BACKSPACE: 14,
  TAB: 15,
  Q: 16,
  W: 17,
  E: 18,
  R: 19,
  T: 20,
  Y: 21,
  U: 22,
  I: 23,
  O: 24,
  P: 25,
  LEFTBRACE: 26,
  RIGHTBRACE: 27,
  ENTER: 28,
  LEFTCTRL: 29,
  A: 30,
  S: 31,
  D: 32,
  F: 33,
  G: 34,
  H: 35,
  J: 36,
  K: 37,
  L: 38,
  SEMICOLON: 39,
  APOSTROPHE: 40,
  GRAVE: 41,
  LEFTSHIFT: 42,
  BACKSLASH: 43,
  Z: 44,
  X: 45,
  C: 46,
  V: 47,
  B: 48,
  N: 49,
  M: 50,
  COMMA: 51,
  DOT: 52,
  SLASH: 53,
  RIGHTSHIFT: 54,
  KPASTERISK: 55,
  LEFTALT: 56,
  SPACE: 57,
  CAPSLOCK: 58,
  F1: 59,
  F2: 60,
  F3: 61,
  F4: 62,
  F5: 63,
  F6: 64,
  F7: 65,
  F8: 66,
  F9: 67,
  F10: 68,
  NUMLOCK: 69,
  SCROLLLOCK: 70,
  KP7: 71,
  KP8: 72,
  KP9: 73,
  KPMINUS: 74,
  KP4: 75,
  KP5: 76,
  KP6: 77,
  KPPLUS: 78,
  KP1: 79,
  KP2: 80,
  KP3: 81,
  KP0: 82,
  KPDOT: 83,
  ZENKAKUHANKAKU: 85,
  ND: 86,
  F11: 87,
  F12: 88,
  RO: 89,
  KATAKANA: 90,
  HIRAGANA: 91,
  HENKAN: 92,
  KATAKANAHIRAGANA: 93,
  MUHENKAN: 94,
  KPJPCOMMA: 95,
  KPENTER: 96,
  RIGHTCTRL: 97,
  KPSLASH: 98,
  SYSRQ: 99,
  RIGHTALT: 100,
  HOME: 102,
  UP: 103,
  PAGEUP: 104,
  LEFT: 105,
  RIGHT: 106,
  END: 107,
  DOWN: 108,
  PAGEDOWN: 109,
  INSERT: 110,
  DELETE: 111,
  MUTE: 113,
  VOLUMEDOWN: 114,
  VOLUMEUP: 115,
  POWER: 116,
  KPEQUAL: 117,
  PAUSE: 119,
  KPCOMMA: 121,
  HANGUEL: 122,
  HANJA: 123,
  YEN: 124,
  LEFTMETA: 125,
  RIGHTMETA: 126,
  COMPOSE: 127,
  STOP: 128,
  AGAIN: 129,
  PROPS: 130,
  UNDO: 131,
  FRONT: 132,
  COPY: 133,
  OPEN: 134,
  PASTE: 135,
  FIND: 136,
  CUT: 137,
  HELP: 138,
  F13: 183,
  F14: 184,
  F15: 185,
  F16: 186,
  F17: 187,
  F18: 188,
  F19: 189,
  F20: 190,
  F21: 191,
  F22: 192,
  F23: 193,
  F24: 194,
  UNKNOWN: 240,
};

var keyIndex = [];

for (var key in keys) {
  if (keys.hasOwnProperty(key)) {
    keyIndex[keys[key]] = key;
  }
}

class Keyboards extends EventEmitter {
  constructor() {
    super();

    var _this = this;
    _this.kbds = [];

    _this.keys = {};

    _this.states = [];

    fs.watchFile('/proc/bus/input/devices', _this.track.bind(_this));

    _this.track();
  }

  active(keyName) {
    return this.states[`${keyName}`];
  }

  track() {
    let _this = this;
    let data = fs.readFileSync('/proc/bus/input/devices').toString().split('\n');

    let device = {};

    data.forEach(line=> {
      if (line.length) {
        let spl = line.substr(3).split('=');
        for (let i = 0; i < Math.ceil(spl.length / 2); i++) {
          device[spl[i]] = (spl[i + 1] ? spl[i + 1] : '');
        }
      } else {
        if (device.EV && (device.EV == '120013' || device.EV == '12001f')) { //'120013'
          let pat = /event\d+/g;
          let which = pat.exec(device.Handlers);
          device.path = `/dev/input/${which}`;
          if (!_this.kbds.find((kbd)=>kbd.Sysfs == device.Sysfs)) {
            console.log(`${device.Name} was found.`);
            var fd = fs.openSync(device.path, 'r');
            device.file = fs.createReadStream(undefined, { fd: fd });
            device.file.on('error', (err)=> {
              console.log(err);
              console.log(`${device.Name} was removed from the system.`);
              _this.kbds.splice(_this.kbds.indexOf(device), 1);
            });
            device.file.on('end', ()=> { console.log('file closed');});
            device.file.on('data', function (data) {
              let count = 0;
              let packSize = (process.arch === 'x64') ? 24 : 16;
              while (count < data.length) {
                let slc = data.slice(count, count + packSize);
                let event = {};
                if (process.arch === 'x64') {
                  event = {
                      timeS: slc.readUInt32LE(0, 8),
                      timeMS: slc.readUIntLE(8, 8),
                      type: slc.readUInt16LE(16),
                      code: slc.readUInt16LE(18),
                      value: slc.readInt32LE(20),
                    };
                } else { // arm or ia32
                  event = {
                      timeS: slc.readUInt32LE(0),
                      timeMS: slc.readUInt32LE(4),
                      type: slc.readUInt16LE(8),
                      code: slc.readUInt16LE(10),
                      value: slc.readInt32LE(12),
                    };
                }

                if (event.type == EV_KEY) {
                  _this.states[event.code] = event.value;
                  _this.keys[keyIndex[event.code]] = event.value;
                  _this.emit((event.value == 1) ? 'keydown' : 'keyup', event.code, _this.states);
                }

                count += packSize;
              }
            });

            _this.kbds.push(device);

          }

        }

        device = {};
      }
    });
  }

}

if (!global.keyboards) global.keyboards = new Keyboards();

exports.keyboards = global.keyboards;
