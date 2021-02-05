obtain([], ()=>{
  if (!customElements.get('ms-item')) {
    class Item extends HTMLElement {
      constructor(details){
        super();
        var _this = this;
        _this.keys = [];
        for (var key in details) {
          if (details.hasOwnProperty(key)) {
            _this.keys.push(key);
            _this[key] = details[key];
          }
        }

        _this.price = parseFloat(_this.price);
        _this.quantity = parseFloat(_this.quantity);
        _this.subtotal = _this.price * _this.quantity;
      }

      connectedCallback(){
        //register events, check contents, etc.
        var _this = this;

        _this.input = '';

        if (!_this.shadowRoot) {
          _this.root = _this.attachShadow({ mode: 'open' });

          _this.root.innerHTML = `\
            <style> @import "./css/item.css";</style>\
            <div class='cell'>\
              <span class='code'>${_this.code}</span>\
              <span class='description'>${_this.description}</span>\
              <br/>\
              <div class='priceDiv'>\
                <span class='quantity'>${_this.quantity}</span>\
                x @\
                <span class='price'>$${_this.price.toFixed(2)}</span>\
                <span class='unit'>/ ${_this.unit}</span>\
                <span class='subtotal'>$${(_this.price * _this.quantity).toFixed(2)}</span>\
              </div>\
              <div class='opts'>
                <span class='button delete'>Remove</span>
                <span class='button update'>Update Quantity</span>
              </div>
            </div>
          `;
        }

        _this.options = µ('.opts', _this.root)[0];
        _this.onclick = (e)=>{
          e.preventDefault();
          e.cancelBubble = true;
          _this.options.classList.add('show');
          var docuClick = (e)=>{
            if(e.target != _this) _this.options.classList.remove('show');
            document.removeEventListener('click', docuClick);
          }
          document.addEventListener('click', docuClick);
        }

        µ('.delete', _this.root)[0].onclick = (e)=>{
          e.preventDefault();
          _this.parentElement.removeChild(_this);
        }

        µ('.update', _this.root)[0].onclick = (e)=>{
          e.preventDefault();
          _this.onUpdatePress(_this);
        }
      }

      listify(){
        var _this = this;
        var list = {};
        _this.keys.forEach(key => list[key] = _this[key]);
        return list;
      }

      setQuantity(update){
        var _this = this;
        _this.quantity = update;
        µ('.quantity', _this.root)[0].textContent = update;
        µ('.subtotal', _this.root)[0].textContent = '$' + (update * _this.price).toFixed(2);
      }

      onUpdatePress(which){}

      getSubtotal(){
        return this.quantity * this.price;
      }
    }

    customElements.define('ms-item', Item);
  }

  exports.Item = customElements.get('ms-item');

  provide(exports);
});
