obtain(['µ/serialParser.js', 'events', 'µ/utilities.js'], ({ serialParser }, EventEmitter, utils)=> {
  const SET_FREQ = 1;
  const SET_AMP = 2;
  const SET_PULSE_LENGTH = 3;
  const STOP = 4;
  const START = 5;
  const READY = 127;

  class LightControl extends EventEmitter{
    constructor(conf) {
      super();
      var _this = this;
      var parser = new serialParser();

      _this.config = {
      };

      parser.on(SET_FREQ, (data)=> {
        console.log('set Frequency');
      });

      parser.on(SET_AMP, (data)=> {
        console.log('set Brightness');
      });

      parser.on(SET_PULSE_LENGTH, (data)=> {
        console.log('set pulse length');
      });

      parser.on(STOP, (data)=> {
        console.log('stopped pulsing');
      });

      var readyInt;

      parser.on(READY, ()=> {
        if (!_this.ready) {
          console.log('Controller ready');
          clearInterval(readyInt);
          _this.ready = true;
          _this.emit('ready');
        }
      });

      _this.setFrequency = (freq)=> {
        freq = Math.floor(freq);
        if(freq > 0 && freq <= 50){
          parser.sendPacket([1, SET_FREQ, freq & 127]);
          //_this.emit('frequencyChanged', temp);
        }
      };

      _this.setBrightness = (amp)=> {
        amp = Math.floor(amp);
        if(amp >= 0 && amp <= 100){
          parser.sendPacket([1, SET_AMP, amp & 127]);
          //_this.emit('frequencyChanged', temp);
        }
      };

      _this.setPulseLength = (len)=> {
        len = Math.floor(len);
        if(len > 0 && len < 127){
          parser.sendPacket([1, SET_PULSE_LENGTH, len & 127]);
          //_this.emit('frequencyChanged', temp);
        }
      };

      _this.stop = ()=>{
        parser.sendPacket([1, STOP]);
      }

      _this.start = ()=>{
        parser.sendPacket([1, START]);
      }

      _this.whenReady = (cb)=> {
        if (_this.ready) {
          cb();
        } else {
          this.on('ready', cb);
        }
      };

      parser.onOpen = ()=> {
        parser.sendPacket([127, READY]);

      };

      _this.onPortNotFound = ()=>{};

      _this.portNotFound = false;

      parser.serial.onPortNotFound = ()=>{
        _this.portNotFound = true;
        _this.onPortNotFound();
      }

      if (conf.name) parser.setup({ name: conf.name, baud: 115200 });
      else if (conf.manufacturer) parser.setup({ manufacturer: conf.manufacturer, baud: 115200 });

    }

    set onready(cb) {
      //this.on_load = val;
      if (this.ready) {
        cb();
      } else {
        this.on('ready', cb);
      }
    }
  };

  exports.LightControl = LightControl;
});
