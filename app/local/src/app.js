'use strict';

var remote = require('electron').remote;
var appRoot = remote.getGlobal('appRoot');
var config = remote.getGlobal('config');

var obtains = [
  'µ/google/jwt.js',
  'µ/google/sheets_2.js',
  './src/sheetInfo.js',
  './src/keypad.js',
  './src/items.js',
  'uuid',
  'greg',
  'qrcode'
]

obtain(obtains, ({Client}, {SpreadSheet}, {SheetInfo}, {Keypad}, {Item}, { v4: uuidv4 }, greg, qr)=>{
  exports.app = {};

  console.log(config);

  var scopes = [
    'https://www.googleapis.com/auth/spreadsheets'
  ];

  var auth = Client(scopes, appRoot + '/.credentials/trackerJWT_2.json');

  var materials = new SpreadSheet({
    auth: auth,
    ssid: '13-zoYnlLD6gpz5fb8yHF1NNAMhxse7jFm5_eMpyLGaw'
  });

  var users = new SpreadSheet({
    auth: auth,
    ssid: '1k3eZkkqm1bWA3lk8gUgfoR6Xpb2vVaX4iaqnizi5iDc'
  });

  var inventory = new SheetInfo(materials, 'Inventory');
  var transactions = new SheetInfo(materials, 'Transactions');
  var balances = new SheetInfo(materials, 'UserBalances');

  var profile = new SheetInfo(users, 'Users');
  var activity = new SheetInfo(users, 'Activity');

////////////////////////////////////////////////////////

  var newUserDialog = (userID)=>{
    userInfoOL.data = { userID: userID };
    overlays.mode = 'acct';
    µ('input', userInfoOL).forEach(inp => {
      inp.classList.remove('warn');
      if(inp.id != 'mailList') inp.value = '';
    });
  }

  var accountDialog = acct=>{
    userInfoOL.data = acct;
    overlays.mode = 'acct';
    for (var key in acct) {
      if (acct.hasOwnProperty(key) && key != 'userID') {
        if(key != 'mailList') µ(`#${key}`, userInfoOL).value = acct[key];
      }
    }
  }

  var startOrder = ()=>{

  }

  var recordTransaction = profile => {
    console.log(profile);
    var cart = µ('ms-item');
    var list = cart.map(item=>item.listify())
    console.log(list);
    var newTA = {
      uuid: uuidv4(),
      userID: profile.userID,
      userEmail: profile.email,
      jsonCart: JSON.stringify(list),
      cartTotal: cart.reduce((acc,item)=>acc + item.getSubtotal(), 0)
    }

    console.log(newTA);

    overlays.mode = 'rcpt';
    qr.toCanvas(qrcodeCV,newTA.uuid);
    //uuidSpan.textContent = newTA.uuid;
    return transactions.amendOrAddFromObject(newTA, 'uuid');
  }

  var openQuantOL = data =>{
    overlays.mode = 'quant';
    if(!data.unit) data.unit = 'ea';
    quantOL.data = data;
    var conv = {
      'ea': 'each',
      'in': 'inches',
      'oz': 'ounces',
      'g': 'grams'
    };
    quantUnit.textContent = conv[data.unit];
    if(data.quantity) quantKey.input.value = data.quantity;
    else quantKey.input.value = '';
  }

////////////////////////////////////////////////////////

  var items = {};

  var calculateTotal = ()=>{
    var tot = µ('ms-item').reduce((acc,el)=>acc + el.getSubtotal(), 0);
    totalCost.textContent = '$'+tot.toFixed(2);
  }

  var handleItem = (data)=>{
    var it = µ('ms-item').find(it=>it.code == data.code);
    console.log('handling');
    if(!it){
      console.log('adding');
      data.quantity = 0;
      it = new Item(data);
      itemList.appendChild(it);
      it.onUpdatePress = openQuantOL;
    }
    console.log(data.unit);
    if(data.unit == 'ea'){
      console.log('here')
      it.setQuantity(it.quantity + 1);
      calculateTotal();
    } else {
      console.log('quant');
      openQuantOL(it);
    }
  }

  var findItem = (sku)=>{
    if(!items[sku]){
      inventory.objectFromKeyValue('code',sku).then((data)=>{
        items[sku] = data;
        handleItem(items[sku]);
      }).catch(err=>{
        if(err == 'VAL_NOT_FOUND') console.log('adding new item');
      })
    } else handleItem(items[sku]);

  }

  var findUser = (userID) => {
    profile.objectFromKeyValue('userID', userID).then(profile=>{
      console.log(profile);
      if(overlays.mode == 'acctScan') accountDialog(profile);
      else if(overlays.mode == 'welcomeScan') signIn(profile);
      else if(overlays.mode == 'coScan') recordTransaction(profile);
    }).catch(err=>{
      if(err == 'VAL_NOT_FOUND'){
        newUserDialog(userID);
      }
    });
  }

  var signIn = data =>{
    data.location = config.location;
    data.checkIn = (new Date()).toLocaleString();
    return activity.addRowFromObject(data).then(()=>{
        signInName.textContent = data.firstName;
        overlays.mode = 'signedIn';
        setTimeout(()=>{
          overlays.mode = 'welcomeScan';
        }, 3000);
    });
  }

  var addUser = data => profile.amendOrAddFromObject(data, 'userID');

  var onScan = (scanResult)=>{
    if(scanResult.startsWith('CM')){
      overlays.mode = 'shopScan';
      findItem(scanResult);
    } else if (scanResult.length == 14){
      findUser(scanResult);
    } else if (scanResult.length == 16){
      findUser(scanResult.substring(1,15));
    }
  }

  exports.app.start = ()=>{

    /////////////////////////////////////////////////////////////////
    // element event handlers

    Object.defineProperty(overlays, 'mode', {
      get: ()=>overlays.getAttribute('mode'),
      set: md=>overlays.setAttribute('mode',md)
    });

    µ('input[required]', userInfoOL).forEach(el=>{
      el.onchange = e=>el.classList.toggle('warn', !el.value.length);
    })

    µ('#manage').onclick = (e)=>{
      e.preventDefault();
      overlays.mode = 'acctScan';
    }

    startScan.onclick = e=>{
      e.preventDefault();
      overlays.mode = 'shopScan';
    }

    cancelScan.onclick = (e)=>{
      overlays.mode = 'welcomeScan';
      e.preventDefault();
    }

    checkout.onclick = e=>{
      overlays.mode = 'coScan';
    }

    cancelCO.onclick = e=>{
      overlays.mode = 'shopScan';
    }

    coCancel.onclick = e=>{
      e.preventDefault();
      overlays.mode = 'welcomeScan';
      while(itemList.firstChild) itemList.removeChild(itemList.firstChild);
    }

    saveSignUp.onclick = (e)=>{
      var data = µ('input', userInfoOL).reduce((acc,val)=>{
        acc[val.id] = val.value;
        return acc;
      }, userInfoOL.data);
      if(data.firstName.length && data.email.length){
        addUser(data).then(()=>signIn(data));
        overlays.mode = 'signedIn';
      } else {
        µ('input[required]', userInfoOL).forEach(el=>el.classList.add('warn'));
      }
    }

    cancelSignUp.onclick = e=>{
      overlays.mode = 'welcomeScan';
    }

    cancelRcpt.onclick = e=>{
      e.preventDefault();
      overlays.mode = 'welcomeScan';
    }

    keyPad.input.value = 'CM';

    keyPad.onSubmit = (text)=>{
      onScan(text);
      keyPad.input.value = 'CM';
    }

    quantAccept.onclick = (e)=>{
      if(e) e.preventDefault();
      var newQuant = parseFloat(quantKey.input.value);
      if(!newQuant){
        quantOL.data.parentElement.removeChild(quantOL.data);
      } else {
        quantOL.data.setQuantity(newQuant);
        calculateTotal();
      }
      overlays.mode = 'shopScan';
    }

    quantCancel.onclick = (e)=>{
      e.preventDefault();
      overlays.mode = 'shopScan';
    }

    quantKey.onchange = (text)=>{
    }

    ///////////////////////////////////////////////////
    //// General startup

    var example = new Item({
      code: 'CM10007',
      description: "Elmer's Glue",
      price: '0.05',
      quantity: 5,
      unit: 'oz'
    });

    example.onUpdatePress = openQuantOL;

    itemList.appendChild(example);

    var scanString = '';
    var scanTO = null;

    document.onkeypress = (e)=> {
      if(overlays.mode.includes('Scan')){
        clearTimeout(scanTO);
        if(e.keyCode > 32 && e.keyCode < 127){
          scanString += e.key;
        } else if(e.key == 'Enter'){
          onScan(scanString);
          scanString = '';
        }

        scanTO = setTimeout(()=> scanString = '', 50);
      } else if(overlays.mode == 'quant'){
        quantKey.input.focus();
        if(e.key == 'Enter'){
          quantAccept.onclick();
        }
      } 
    };
  };

  provide(exports);
});
