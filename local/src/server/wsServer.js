obtain(['ws'], ({ Server })=> {
  var wss = new Server({ port: 8080 });
  var webSock = null;

  wss.broadcast = function(data) {
    wss.clients.forEach(function each(client) {
      client.send(data);
    });
  };

  exports.wsServer = wss;

  /*wss.on('connection', function(ws) {
    if (ws) {

    }

    ws.on('message', function(message) {
      switch (message.split('=')[0]){
        case 'del':

          break;
      }
    });

    ws.on('close', function() {
    });

    ws.on('error', function(error) {
    });
  });*/

  provide(exports);
});
