obtain([], ()=> {
  if (!customElements.get('cam-era')) {

    class Camera extends HTMLElement {
      constructor() {
        super();

        this.options = {

        }

        this.baseName = '';
      }

      clear() {
        //this.recorder.clearRecordedData();
      }

      record() {
        this.isRecording = true;
        this.recorder.start();
      }

      stop() {
        var _this = this;
        _this.isRecording = false;
        _this.recorder.stop();
      }

      play() {
        this.video.play();
      }

      pause() {
        this.video.stop();
      }

      getSourceNames(cb) {
        navigator.mediaDevices.enumerateDevices().then(cb);
      }

      setSourceFromLabel(label) {
        var _this = this;
        return navigator.mediaDevices.enumerateDevices().then(dev=>{
          _this.options.deviceId = dev.find(dev=>dev.label == label).deviceId;
        });

      }

      init(cb) {
        var _this = this;
        if (navigator.getUserMedia) {
          navigator.getUserMedia( _this.options, cb, (error)=>console.log(error.code));
        }
      }

      onDataAvailable (blob){
        this.makeDownload(blob);
      }

      makeDownload(blob){
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = `${this.baseName}_${(new Date()).toUTCString()}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      startStream(cb){
        var _this = this;
        _this.init((stream)=> {
          _this.stream = stream;

          _this.overlayCB = ()=>{};

          _this.video.srcObject = _this.stream;

          _this.video.addEventListener('loadedmetadata', ()=> {

            // _this.canvas.width = _this.video.videoWidth;
            // _this.canvas.height = _this.video.videoHeight;

            _this.play();

            // var frames = 0;
            // var startTime = Date.now();
            //
            // clearInterval(_this.canvInt);
            // _this.canvInt = setInterval(()=>{
            //   frames++;
            //   console.log(1000 * frames/(Date.now() - startTime));
            //   _this.ctx.drawImage(_this.video,0,0,_this.canvas.width, this.canvas.height);
            //
            // },1000/30);

            //var cStream = _this.canvas.captureStream(30);

            this.recordedChunks = [];

            var options = {
              mimeType: "video/webm; codecs=h264", //vp9
              //videoBitsPerSecond: 2 * 1024 * 1024,
            };
            _this.recorder = new MediaRecorder(_this.stream, options);

            this.recorder.ondataavailable = event=>{
              if (event.data.size > 0) {
                  this.recordedChunks.push(event.data);
                  let blob = new Blob(this.recordedChunks, {
                    type: "video/webm"
                  });
                _this.onDataAvailable(blob);
                this.recordedChunks = [];
              }
            };

            if(cb) cb();
          });

        });
      }

      connectedCallback() {
        //register events, check contents, etc.
        var _this = this;

        _this.onRecordEnd = (blob)=> {};

        if (!_this.shadowRoot) {
          _this.root = _this.attachShadow({ mode: 'open' });

          _this.root.innerHTML = `<style> @import "css/camera.css";</style>`;

          _this.video = µ('+video', _this.root);
          _this.canvas = µ('+canvas', _this.root);
          _this.ctx = _this.canvas.getContext('2d');

        }
      };
    };

    customElements.define('cam-era', Camera);
  }

  exports.Camera = customElements.get('cam-era');

  provide(exports);
});
