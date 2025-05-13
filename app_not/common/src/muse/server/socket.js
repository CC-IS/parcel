if (!window) var window = global;

obtain([`${__dirname}/express.js`, 'ws', 'url', 'µ//events.js'], ({ http, https, sessionParser }, WebSock, url, { Emitter })=> {
  if (!window.muse.server.socket) {
    var manager = new Emitter();

    var wsServer = new WebSock.Server({
      verifyClient: (info, done) => {
        sessionParser(info.req, {}, () => {
          done(true);
        });
      },

      server: (muse.useSSL ? https : http), });
    var webSock = null;

    wsServer.broadcast = function (key, data) {
      wsServer.clients.forEach(function each(client) {
        var obj = { [key]: data };
        client.send(JSON.stringify(obj));
      });
    };

    //wsServer.orderedClients = [];

    wsServer.addListener = (evt, cb)=> {
      manager.on(evt, cb);
    };

    // wsServer.addListener = (evt, cb)=> {
    //   listeners[evt] = cb;
    // };

    //wsServer.getClient = _id=>wsServer.clients.find(client=>client.id == _id && client.readyState === WebSock.OPEN);

    wsServer.getClient = _id=> {
      var ret = null;
      wsServer.clients.forEach(client=> {
        if (client.id == _id) ret = client;
      });
      return ret;
    };

    wsServer.send = (_id, obj, data)=> {
      var client = wsServer.getClient(_id);
      if (client) {
        if (typeof obj == 'string') obj = { [obj]: data };
        client.send(JSON.stringify(obj));
      }

    };

    // var orderedCallbacks = {};
    //
    // wsServer.onOrderedConnect = (_id, cb)=> {
    //   orderedCallbacks[_id] = cb;
    // };

    wsServer.onConnect;

    wsServer.onClientConnect = (cb)=> {
      manager.on('clientConnect', cb);
    };

    wsServer.onClientDisconnect = (cb)=> {
      manager.on('clientDisconnect', cb);
    };

    wsServer.on('connection', function (ws, req) {
      //console.log('client connected');
      if (!req && ws.upgradeReq) req = ws.upgradeReq;

      ws.id = req.session.id;
      req.session.ws = ws;

      ws.eventManager = new Emitter();
      ws.addListener = (evt, cb)=> {
        ws.eventManager.on(evt, cb);
      };

      //wsServer.onClientConnect(ws, req);
      manager.emit('clientConnect', {
        ws: ws,
        req: req,
      });

      ws.sendObject = (obj)=> {
        ws.send(JSON.stringify(obj));
      };

      ws.sendPacket = (key, data)=> {
        var obj = { [key]: data };
        ws.send(JSON.stringify(obj));
      };

      ws.on('message', function (message) {
        var data = JSON.parse(message);
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            var dat = {
              details: { from: ws },
              data: data[key],
            };
            manager.emit(key, dat);
            ws.eventManager.emit(key, dat);
          }
        }
      });

      ws.on('close', function () {
        ws.id = null;
        manager.emit('clientDisconnect', {
          ws: ws,
          req: req,
        });
      });

      ws.on('error', function (error) {
      });
    });

    window.muse.server.socket = wsServer;
  }

  exports.wss = window.muse.server.socket;

  provide(exports);
});
