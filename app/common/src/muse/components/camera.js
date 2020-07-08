obtain(['µ/RecordRTC.min.js'], ()=> {
  if (!customElements.get('cam-era')) {

    class Camera extends HTMLElement {
      constructor() {
        super();
      }

      clear() {
        this.recorder.clearRecordedData();
      }

      record() {
        this.isRecording = true;
        this.recorder.startRecording();
      }

      stopRecord() {
        var _this = this;
        _this.isRecording = false;
        _this.recorder.stopRecording(function (url) {
          _this.recorder.getDataURL(_this.onRecordEnd);
        });
      }

      play() {
        this.video.play();
      }

      stop() {
        this.video.stop();
      }

      init(cb) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        //window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

        // If browser supports user media
        if (navigator.getUserMedia) {
          navigator.getUserMedia({
            audio: false,
            video: {
              mandatory: { },
              //optional: [{sourceId: cameraSource}]
            },
          }, cb, (error)=>console.log(error.code));
        }
      }

      connectedCallback() {
        //register events, check contents, etc.
        var _this = this;

        _this.onRecordEnd = (blob)=> {};

        if (!_this.shadowRoot) {
          _this.root = _this.attachShadow({ mode: 'open' });

          _this.root.innerHTML = `<style> @import "${µdir}/components/css/camera.css";</style>`;

          _this.video = µ('+video', _this.root);

          _this.init((stream)=> {
            _this.stream = stream;

            _this.video.srcObject = _this.stream;

            _this.video.onloadedmetadata = ()=> {

              _this.play();

              _this.recorder = window.RecordRTC(stream, {
                type: 'video',
                video: _this.video,
                canvas: {
                  width: _this.video.videoWidth,
                  height: _this.video.videoHeight,
                },
              });
            };

          });
        }
      };
    };

    customElements.define('cam-era', Camera);
  }

  exports.Camera = customElements.get('cam-era');

  provide(exports);
});
