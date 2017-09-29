obtain(['express', 'fs'], (express, fs)=> {
  var fileServer = express();

  fileServer.use('', express.static('./client'));
  fileServer.use('/common', express.static('./common'));

  fileServer.listen(80, function () {
    console.log('listening on 80');
  });

  exports.fileServer = fileServer;
});
