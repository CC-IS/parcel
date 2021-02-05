var muse = {
  debug: false,
  root: '',
  log: (data)=> {
    if (this.debug) console.log(data);
  },
};

if (!window) {
  var window = global;
  muse.Node = true;
  muse.root = __dirname;
  window.document = false;
} else {
  if (typeof require == 'undefined') var require = false;
  var script = document.currentScript;
  muse.root = script.src.substr(0, script.src.lastIndexOf('/') + 1);
  if (muse.root.includes('C:/') || muse.root.includes('C:\\')) {
    muse.root = muse.root.replace('file:///', '');
    muse.root.replace(/\\/g, '/');
  }

  if (require) muse.root = muse.root.replace('file://', '');
}

window.muse = muse;

////////////////// querySelector shortcut /////////////
window.µ = function (id, elem) {
  var ret;
  var root = ((elem) ? elem : document);
  var spl = id.split('>');
  switch (spl[0].charAt(0)) {
    case '|':
      ret = root;
      break;
    case '+':
      ret = document.createElement(spl[0].substring(1));
      if (elem) elem.appendChild(ret);
      break;
    case '#':
      ret = root.querySelector(spl[0]);
      break;
    default:
      ret = Array.from(root.querySelectorAll(spl[0]));

      ret.style = function (mem, val) {
        for (let i = 0; i < ret.length; i++) {
          ret[i].style[mem] = val;
        }
      };

      //}
      break;
  }
  if (spl.length <= 1) return ret;
  else return ret.getAttribute(spl[1]);
};

if (document) window.loadCSS = (filename)=> {
  if (!µ(`[href="${filename}"]`)[0]) {
    var css = µ('+link', µ('head')[0]);
    css.type = 'text/css';
    css.rel = 'stylesheet';
    css.media = 'screen,print';
    css.href = filename;
  }
};

if (document) window.importHTML = (address, cb)=> {
  var targ = µ(`[href="${address}"]`)[0];
  if (!targ) {
    let link = µ('+link');
    link.rel = 'import';
    link.href = address;
    //link.setAttribute('async', ''); // make it async!
    link.addEventListener('load', ()=> { cb(link);});
    //link.onerror = function(e) {...};
    document.head.appendChild(link);
  } else {
    if (targ.import.childNodes.length) cb(targ);
    else targ.addEventListener('load', ()=> { cb(targ);});
  }

};

/*window.updateCSSProperty = (name, val)=> {
  _this.style.removeProperty(name);
  _this.style.setProperty(name, val);
};*/


muse.get = function (url, params) {
  // Return a new promise.
  return new Promise(function (resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    if (params && params.type) req.responseType = params.type;
    if (params && params.credentials) req.open('GET', url, params.credentials);
    else req.open('GET', url);

    req.onload = function () {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req);
      } else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function () {
      reject(Error('Network Error'));
    };

    // Make the request
    req.send();
  });
};

muse.post = function (url, obj) {
  // Return a new promise.
  return new Promise(function (resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('POST', url);
    req.setRequestHeader('Content-type', 'application/json');

    req.onload = function () {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      } else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function () {
      reject(Error('Network Error'));
    };

    // Make the request
    req.send(JSON.stringify(obj));
  });
};

var mainDir = window.location.pathname;

mainDir = mainDir.substr(0,mainDir.lastIndexOf('/') + 1);


window.obtain = function (addr, func) {
  var obs = []
  var loaded = Array.from({length: addr.length}, v => false)
  loaded.fill(false,0,addr.length);
  addr.forEach((adr, i) => {
    if (adr.includes('µ/')) adr = adr.replace('µ/', muse.root);
    else if(adr.startsWith('./')) adr = adr.replace('./', mainDir);
    import(adr).then((imports)=>{
      loaded[i] = true;
      obs[i] = imports;
      console.log(loaded.reduce((acc, cur)=>acc && cur, true));
      if(loaded.reduce((acc, cur)=>acc && cur, true)){
        func.apply(null, obs);
      }
    });
  });
};


window.whenLoaded = (fxn)=>{
  if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') fxn();
  else document.addEventListener('DOMContentLoaded', function (event) {
    fxn();
  });
}

var appScript = document.currentScript.getAttribute('main');
var started = false;

obtain([appScript, 'µ/components/refDiv.js'], (imports)=> {
  if (!started) {
    started = true;
    console.log(imports);
    if (document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive') imports.app.start();
    else document.addEventListener('DOMContentLoaded', function (event) {
      imports.app.start();
    });
  }
});
