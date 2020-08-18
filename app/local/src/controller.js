obtain(['µ/serialParser.js', 'events', 'µ/utilities.js'], ({ serialParser }, EventEmitter, utils)=> {
  const SET_FREQ = 1;
  const SET_AMP = 2;
  const SET_PULSE_LENGTH = 3;
  const SET_PINS = 4;
  const STIMULATE = 5
  const SET_BACKLIGHT = 6;
  const SET_OUTPUTS = 7;
  const STOP = 8;
  const START = 9;
  const ALL_OFF = 10;
  const ERROR = 126;
  const READY = 127;

  class LightControl extends EventEmitter{
    constructor(conf) {
      super();
      var _this = this;
      var parser = new serialParser();

      _this.config = {
      };

      parser.on(SET_BACKLIGHT, (data)=> {
        console.log('set back light');
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

      _this.stimulate = (frequency,amplitude,pulseLength,quadArray)=>{
        var quads = quadArray.reduce((acc,val,ind)=>acc + (val << ind));
        parser.sendPacket([1, STIMULATE, frequency, amplitude, pulseLength, quads]);
      }

      _this.setBacklight = (intensity)=>{
        parser.sendPacket([1, SET_BACKLIGHT, intensity & 127]);
      }

      _this.setOutputs = (outs)=>{
        //var outs = outputArray.reduce((acc,val,ind)=>acc + (val << ind));
        parser.sendPacket([1,SET_OUTPUTS, outs & 127, outs>>7]);
      }

      _this.stop = ()=>{
        parser.sendPacket([1, ALL_OFF]);
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
