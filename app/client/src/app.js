'use strict';

obtain(['µ/commandClient.js'], ({ MuseControl })=> {
  exports.app = {};

  var control = new MuseControl(window.location.hostname);

  var config = {};

  exports.app.start = ()=> {
    lights = µ('#lightHolder');
    shows = µ('#showHolder');

    µ('.catHolder h2').forEach(el=>el.onclick=()=>{
      µ('.accordian',el.parentElement)[0].classList.toggle('open');
    });

    control.connect();

    control.onConnect = ()=> {
      console.log('Connecting to server...');
      control.send('getConfig',{});
    };

    µ('#ballSpeed').onchange=()=>{
      config.motor.speed = µ('#ballSpeed').value;
      control.send('motorControl',{
        speed: µ('#ballSpeed').value
      });
    }

    µ('#rotDir').onchange=()=>{
      config.motor.direction = µ('#rotDir').checked;
      control.send('motorControl',{
        direction: µ('#rotDir').checked
      });
    }

    µ('#save').onclick = ()=>{
      shows.list.forEach((show, i) => {
        var spectrum = µ('.swatch',show.swatches).map(el=>[el.r, el.g, el.b]);

        config.shows[i].spectrum = spectrum;
      });

      control.send('writeConfig',config);
      setTimeout(()=>{
        location.reload();
      },1000)
    }

    µ('#setTime').onclick = ()=>{
      control.send('setTime', {
        time: Date.now()
      })
    }

    µ('#play').onclick = ()=>{
      console.log("start show");
      control.send('startShow',{});
    }

    var makeRange = (root,min,max,step)=>{
      var ret = µ("+input", root);
      ret.type = 'range';
      ret.min = min;
      ret.max = max;
      ret.step = step;
      return ret;
    }

    var makeChannelSelect = (name, root, cb)=>{
      var ret = µ('+span',root);
      var label = µ('+label',ret).textContent = name;
      ret.text = µ('+input',ret);
      ret.text.type = 'number';
      ret.text.min = 0;
      ret.text.max = 255;
      ret.range = makeRange(ret,0,255,1);
      ret.text.onchange = ()=>{
        ret.range.value = ret.text.value;
        cb();
      }
      ret.range.oninput = ()=>{
        ret.text.value = ret.range.value;
        cb();
      }
      ret.text.value = 128;
      ret.range.value = 128;
      return ret;
    }

    var colorSelector = (root, cb)=>{
      var ret = µ('+span',root);
      ret.className = 'colorSelect';
      ret.swatch = µ('+span',ret);
      ret.swatch.className = 'swatch';
      var sel = µ('+span',ret);
      sel.className = 'selectArea'
      var colChange = ()=>{
        var red = ret.red.text.value;
        var green = ret.green.text.value;
        var blue = ret.blue.text.value;
        ret.swatch.style.backgroundColor = `rgb(${red},${green},${blue})`;
        cb(red,green,blue);
      }
      ret.red = makeChannelSelect('R:',sel, colChange);
      µ('+br',sel);
      ret.green = makeChannelSelect('G:',sel, colChange);
      µ('+br',sel);
      ret.blue = makeChannelSelect('B:',sel, colChange);

      return ret;
    }

    var picker = colorSelector(µ('#colorPicker'),(r,g,b)=>{
      var ret = {
        r: r,
        g: g,
        b: b
      };
      console.log(ret);
      control.send('colorPicker',ret);
    });

    var addSwatch = (root, r,g,b)=>{
      let col = µ('+div',root);
      col.className = 'swatch';
      col.style.backgroundColor = `rgb(${r},${g},${b})`;
      col.onclick = ()=>{
        col.parentElement.removeChild(col);
      }
      col.r = r;
      col.g = g;
      col.b = b;

      return col;
    }

    control.addListener('config',(data)=>{
      config = data;
      lights.innerHTML = '';
      lights.devices = [];
      shows.list = [];
      µ('#rotDir').checked = data.motor.direction;
      µ('#ballSpeed').value = data.motor.speed;

      var devs = lights.devices;
      config.lights.forEach((light, i) => {
        let next = µ('+div',lights);
        µ('+h3',next).textContent = `Light ${i+1}`;
        let zL = µ('+label', next);
        zL.textContent = 'Zoom';
        zL.for = 'zoom';
        next.zoom = makeRange(next, 0,1,.01);
        next.zoom.value = light.zoom;
        next.zoom.oninput = ()=>{
          config.lights[i].zoom = next.zoom.value;
          control.send('lightControl',{
            lights:lights.devices.map(el=>{
              return {
                zoom: el.zoom.value
              }
            })
          });
        };
        µ('+br',next);
        let chL = µ('+label', next);
        chL.textContent = 'Channel';
        next.channel = µ('+input',next);
        next.channel.type = 'number';
        next.channel.value = light.channel;
        next.channel.onchange = ()=>{
          config.lights[i].channel = next.channel.value;
        }
        devs.push(next);
      });
      shows.innerHTML = '';
      config.shows.forEach((show, i) => {
        let next = µ('+div',shows);
        µ('+h3',next).textContent = `Show ${i+1}`;
        var durLab = µ('+label',next);
        durLab.textContent = 'Duration:';
        next.duration = µ('+input',next);
        next.duration.type = "number";
        next.duration.min = 0;
        next.duration.value = show.duration;
        next.duration.onchange = ()=>show.duration = next.duration.value;
        µ('+br',next);
        var statLab = µ('+label',next);
        statLab.textContent = 'Static?:';
        next.static = µ('+input',next);
        next.static.type = "checkbox";
        next.static.checked = show.static;
        next.static.onchange = ()=>show.static = next.duration.checked;
        µ('+br',next);
        var fileLab = µ('+label',next);
        fileLab.textContent = 'File:';
        next.file = µ('+input',next);
        next.file.type = "text";
        if(show.file) next.file.value = show.file;
        next.file.onchange = ()=>show.file = next.file.value;
        µ('+br',next);
        var sel = µ('+div',next);
        sel.className = 'colorChoose';
        next.swatches = µ('+div',sel);
        show.spectrum.forEach((color, i) => {
          addSwatch(next.swatches,color[0],color[1],color[2]);
        });

        next.select = colorSelector(sel);
        µ('+br',sel);
        next.add = µ('+input',sel);
        next.add.type = 'button';
        next.add.value = 'Add Color';
        next.add.onclick = ()=>{
          var r = next.select.red.text.value;
          var g = next.select.green.text.value;
          var b = next.select.blue.text.value;
          addSwatch(next.swatches,r,g,b);
        }
        shows.list.push(next);
      });
    })

    console.log('started');

    document.onkeypress = (e)=> {
      if (e.key == ' '){
        console.log('Space pressed');
        control.send('lightControl',{
          lights:[
            {zoom: 1}, {zoom:1}
          ]
        })
      }
    };

  };

  provide(exports);
});
