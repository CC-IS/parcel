var obtains = [
  `${__dirname}/express.js`,
  `${__dirname}/wsServer.js`,
  'path',
  'request',
];

obtain(obtains, ({ fileServer, router }, { wss }, path, request)=> {
  exports.requestConnection = (from, to, extra)=> {
    wss.send(to, 'cnxn:request', {
      content: extra,
      fromId: from,
      toId: to,
    });
  };

  wss.addListener('cnxn:candidate', (data)=> {
    if (wss.getClient(data.to)) {
      wss.send(data.to, 'cnxn:candidate', data);
    } else {
      wss.send(data.from, 'cnxn:error', { error: 'ERR_NO_CLIENT' });
    }
  });

  wss.addListener('cnxn:relay', (data)=> {
    wss.send(data.to, 'cnxn:relay', data);
  });

  wss.addListener('cnxn:description', (data)=> {
    if (wss.getClient(data.to)) {
      wss.send(data.to, 'cnxn:description', data);
    } else {
      wss.send(data.from, 'cnxn:error', { error: 'ERR_NO_CLIENT' });
    }
  });
});
