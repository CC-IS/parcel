if (!window) var window = global;

var root = require('electron').remote.getGlobal('appRoot');

var obtains = [
  'express',
  'body-parser',
  'fs',
  'express-fileupload',
  'express-session',
  'https',
  'http',
  'path',
];

if (!window.muse.server) window.muse.server = {
  base: null,
  router: null,
  http: null,
  https: null,
  sessionParser: null,
  express: null,
  staticRoute: ()=> {},
};

var server = window.muse.server;
module.exports = server;

obtain(obtains, (express, bodyParser, fs, fileUpload, session, https, http, path)=> {
  if (!server.base) {
    server.sessionParser = session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: { httpOnly: true, secure: false },
    });

    server.staticRoute = (route, location)=> {
      muse.server.base.use(route, express.static(path.join(location)));
    };

    server.base = express();
    server.router = express.Router();

    server.router.use(bodyParser.json());
    server.router.use(fileUpload());

    server.base.use(server.sessionParser);

    server.base.use('', express.static(path.join(root, 'app/client')));
    server.base.use('/common', express.static(path.join(root, 'app/common')));

    server.base.use(server.router);

    var httpApp = server.base;

    if (muse.useSSL) {
      const options = {
        cert: fs.readFileSync(`${appRoot}/sslcert/fullchain.pem`),
        key: fs.readFileSync(`${appRoot}/sslcert/privkey.pem`),
      };

      server.https = https.createServer(options, server.base).listen(443);

      httpApp = function (req, res) {
        res.writeHead(307, { Location: 'https://' + req.headers['host'] + req.url });
        res.end();
      };

    } else server.https = {};

    server.http = http.createServer(httpApp).listen(80);

    server.express = express;
  };

});
