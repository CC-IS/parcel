'use strict';

var remote = require('electron').remote;

var process = remote.process;

//remote.getCurrentWindow().closeDevTools();

var obtains = [
  './src/NewArduino.js',
  'µ/google/',
  'µ/color.js',
  './src/server/express.js',
];

obtain(obtains, ({ Arduino }, { sheets, drive, gmail }, { rainbow }, { fileServer })=> {

  var hardware = new Arduino({ name: 'usb' });

  exports.app = {};

  var sent = false;

  // var createOrGetFile = (name, parentFolderId, cb)=> {
  //   drive.listFiles({
  //     parentId: parentFolderId,
  //     queryString: `name = '${name}'`,
  //   }, (files)=> {
  //     //console.log(files);
  //     if (files && files.length) cb(files[0]);
  //     else {
  //       sheets.createSheet({
  //         title: name,
  //       }, (file)=> {
  //           console.log(file);
  //           drive.moveFile({
  //             fileId: file.spreadsheetId,
  //             parentId: parentFolderId,
  //           }, ()=> {
  //             cb(file);
  //           });
  //         });
  //     }
  //   });
  // };

  var data = [];

  // hardware.analogReport(0, 10, (val)=> {
  //   //data.push({ count: data.length, force: val });
  //   if (data.length == 100) {
  //     console.log('saving file');
  //     hardware.analogReport(0, 0, ()=> {});
  //     createOrGetFile(
  //       `DynamicTest ${new Date(Date.now()).toLocaleString('en-US')}`,
  //       '18YZXzXFi1fkjhyYAcd_4GhH49vT1nL6_',
  //       (file)=> {
  //         // have spreadsheetId here
  //         var cellData = data.map(cell=>[cell.count, cell.force]);
  //         sheets.putData(file.spreadsheetId, 'Sheet1!A1:E', cellData, ()=> {
  //           //console.log(file);
  //           gmail.sendMessage({
  //             from: 'instron.control@gmail.com',
  //             to: 'heidgera@gmail.com',
  //             subject: 'New Instron DynamicTest Data',
  //             body: `New data has been created: ${file.spreadsheetUrl}`,
  //           });
  //         });
  //       }
  //     );
  //   }
  // });

  // hardware.digitalWatch(10, (val)=> {
  //   if (!sent) {
  //     sent = true;
  //     // gmail.sendMessage({
  //     //   from: 'instron.control@gmail.com',
  //     //   to: 'heidgera@gmail.com',
  //     //   subject: 'instron test',
  //     //   body: 'This is the first test of the new system.',
  //     // });
  //
  //   }
  //
  //   hardware.digitalWrite(13, !val);
  // });

  var fadeInt;
  var dir = 1;
  var val = 0;

  hardware.whenReady(()=> {
    hardware.lightStrip.begin(10, 2);
    // fadeInt = setInterval(()=> {
    //   hardware.analogWrite(3, val += dir);
    //   if (val >= 255) dir = -1;
    //   else if (val <= 0) dir = 1;
    // }, 1);

    // document.onmousemove = (e)=> {
    //   var val = (e.pageX / window.innerWidth) * 100;
    //   var bright = e.pageY / window.innerHeight;
    //   var col = rainbow(val, 101).scale(bright);
    //   hardware.lightStrip.setPixelColor(0, col[0], col[1], col[2]);
    //   hardware.lightStrip.setPixelColor(1, col[0], col[1], col[2]);
    //   hardware.lightStrip.show();
    // };
  });

  exports.app.start = ()=> {
    fileServer.start();

    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == '1') hardware.lightStrip.setPixelColor(1, 0, 0, 255);
      else if (e.key == '2') hardware.lightStrip.setPixelColor(1, 0, 255, 255);
      else if (e.key == '3') hardware.lightStrip.setPixelColor(1, 0, 255, 0);
      else if (e.key == '4') hardware.lightStrip.setPixelColor(1, 255, 255, 255);
      else if (e.key == '5') hardware.lightStrip.setPixelColor(1, 0, 0, 0);
      hardware.lightStrip.show();
      //if (e.key == ' ') console.log('Space pressed'), hardware.digitalWrite(13, 1);
    };

    document.onkeyup = (e)=> {
      if (e.which == 27) {
        var electron = require('electron');
        process.kill(process.pid, 'SIGINT');
      } else if (e.which == 73 && e.getModifierState('Control') &&  e.getModifierState('Shift')) {
        remote.getCurrentWindow().toggleDevTools();
      }
    };

    process.on('SIGINT', ()=> {
      process.nextTick(function () { process.exit(0); });
    });
  };

  provide(exports);
});
