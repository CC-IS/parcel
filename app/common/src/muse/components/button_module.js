
if (!customElements.get('but-ton')) {
  class Button extends HTMLElement {
    constructor() {
      super();
    }

    get disabled() {
      return (µ('|>disabled', this) == '');
    }

    set disabled(val) {
      if (val) this.setAttribute('disabled', '');
      else this.removeAttribute('disabled');
    }

    connectedCallback() {
      //register events, check contents, etc.
      var _this = this;

      if (!_this.shadowRoot) {
        _this.root = _this.attachShadow({ mode: 'open' });

        _this.root.innerHTML = `<style> @import "${µdir}/components/css/button.css";</style>`;

        _this.display = µ('+slot', _this.root);
      }
    };
  }

  customElements.define('but-ton', Button);
}

export let Button = customElements.get('but-ton');
