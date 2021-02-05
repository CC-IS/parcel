obtain([], ()=>{
  if (!customElements.get('key-pad')) {
    class Keypad extends HTMLElement {
      constructor(){
        super();
      }

      connectedCallback(){
        //register events, check contents, etc.
        var _this = this;

        if (!_this.shadowRoot) {
          _this.root = _this.attachShadow({ mode: 'open' });

          _this.root.innerHTML = `<style> @import "./css/keypad.css";</style>`;

          var cont = µ('+div', _this.root);

          cont.className = 'holder'

          _this.input = µ('+input', cont);
          _this.input.type = 'text';
          _this.input.className = 'padText';
          _this.input.placeholder = '0';

          for (let i = 1; i < 11; i++) {
            let next = µ('+div', cont);
            next.textContent = i%10;

            next.onmousedown = (e)=>{
              e.preventDefault();
              _this.input.value += i%10;
              _this.onchange(_this.input.value);
            }
          }

          _this.back = cont.insertBefore(µ('+div'), cont.lastChild);
          _this.back.textContent = '←';
          _this.back.onmousedown = (e)=>{
            e.preventDefault();
            _this.input.value = _this.input.value.substr(0,_this.input.value.length - 1);
            _this.onchange(_this.input.value);
          }

          _this.dot = µ('+div',cont);
          _this.dot.textContent = '.';
          _this.dot.onmousedown = (e)=>{
            e.preventDefault();
            if(!_this.input.value.includes('.')){
              _this.input.value += '.';
              _this.onchange(_this.input.value);
            }
          }

          _this.enter = µ('+div', cont);
          _this.enter.textContent = '↩';
          _this.enter.onmousedown = (e)=>{
            e.preventDefault();
            var out = _this.input.value;
            _this.input.value = '';
            _this.onSubmit(out);
            _this.onchange(_this.input.value);
          }

          µ('div', cont).forEach(el => {
            el.className = 'button';
          });

          _this.enter.classList.add('enter');

        }
      }

      onchange(input){
        console.log(input);
      }

      onSubmit(input){
        console.log(input);
      }
    }

    customElements.define('key-pad', Keypad);
  }

  exports.Keypad = customElements.get('key-pad');

  provide(exports);
});
