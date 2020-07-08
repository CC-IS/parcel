'use strict';

var remote = require('electron').remote;

var process = remote.process;

var config = remote.getGlobal('config');
//remote.getCurrentWindow().closeDevTools();

var obtains = [
  './src/controller.js',
  './src/camera.js',
  'µ/components/progress.js'
];

obtain(obtains, ({ LightControl }, {Camera}, {ProgressRing})=> {

  exports.app = {};

  exports.app.start = ()=> {

    console.log('started');

///////////////////////////////////////////////////
// Create the light controller

    var cam = µ('cam-era')[0];

    var recordTimer = null;
    var progressInt = null;

    cam.getSourceNames(devs=>{
      devs.forEach(dev => {
        if(dev.kind == 'videoinput'){
          var opt = µ('+option', µ('#cameraSource'));
          opt.value = dev.deviceId;
          opt.textContent = dev.label;
        }
      });

    })

    //cam.setSourceFromLabel('USB Camera (05a3:9422)').then(cam.startStream.bind(cam));

    cam.startStream();

    var control = new LightControl(config.io);

    var note = (msg)=>{
      //µ('#notes').textContent = msg;
    }

    // set warning flags for if the device isn't connected.
    control.onPortNotFound = ()=>{
      note('Please connect the apparatus.');
    }

    if(control.portNotFound) note('Please connect the apparatus.');


    var prog = µ('progress-ring')[0];
    prog.progress = 0;

// Once the controller is ready, enable some controls, start the temperature monitoring

    control.onready = ()=>{
      //µ('#notes').textContent = 'Controller Ready';

      control.on('note', msg=>{

      });

      control.setFrequency(µ('#freqSelect').value);
      control.setBrightness(µ('#ampSelect').value);
      control.setPulseLength(µ('#lenSelect').value);

      µ('#lightApply').onclick = ()=>{
        control.setFrequency(µ('#freqSelect').value);
        control.setBrightness(µ('#ampSelect').value);
        control.setPulseLength(µ('#lenSelect').value);
      };

    }

    µ('#camApply').onclick = ()=>{
      if(µ('#cameraSource').value != '0') cam.options.deviceId = µ('#cameraSource').value;
      cam.options.frameRate = {};
      cam.options.frameRate.ideal = µ('#rateSelect').value;
      cam.startStream();
    }

    //var start = performance.now();

    //setInterval(()=>{console.log(performance.now()-start), start = performance.now()},10);

    // var worker = new Worker('src/worker.js');
    //
    // worker.addEventListener('message', e=>{
    //   console.log('Time: ' + e.data);
    // });
    //
    // worker.postMessage('test');

    µ('#record').onclick = ()=>{
      if(!cam.isRecording){
        var time = µ('#durationSelect').value;
        cam.record();
        var startTime = Date.now();
        progressInt = setInterval(()=>{
          prog.progress = (Date.now() - startTime)/(time*1000);
        },250);
        control.start();
        µ('#indicator').style.display = 'inline-block';
        recordTimer = setTimeout(()=>{
          µ('#indicator').style.display = 'none';
          cam.stop();
          control.stop();
          clearInterval(progressInt);
          prog.progress = 0;
        }, 1000 * time);
      }
    }

    µ('#stop').onclick = ()=>{
      if(cam.isRecording){
        cam.stop();
        µ('#indicator').style.display = 'none';
        clearInterval(progressInt);
        clearTimeout(recordTimer);
        prog.progress = 0;
      }
    }

    document.onkeypress = (e)=> {

    };
  };

  provide(exports);
});
