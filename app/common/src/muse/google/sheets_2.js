const {google} = require('googleapis');
var sheets = google.sheets('v4');

class SpreadSheet {
  constructor(opts){
    var _this = this;
    if(!opts.ssid){
      sheets.spreadsheets.create({
        auth: opts.auth,
        resource: {
          properties: {
            title: opts.title,
          },
        },
      }, function (err, response) {
        if (err) {
          console.error(err);
          return;
        }

        console.log(response.data);
      });
    } else {
      _this.ssid = opts.ssid;
    }

    _this.auth = opts.auth;
  }

  putData(dataRange, dataArray, cb){
    var _this = this;
    sheets.spreadsheets.values.update({
      auth: _this.auth,
      spreadsheetId: _this.ssid,
      range: dataRange,
      valueInputOption: 'USER_ENTERED',
      resource: { range: dataRange,
          majorDimension: 'ROWS',
          values: dataArray, },
    }, cb);
  }

  appendData(dataRange,dataArray,cb){
    var _this = this;
    sheets.spreadsheets.values.append({
      auth: _this.auth,
      spreadsheetId: _this.ssid,
      range: dataRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { range: dataRange,
          majorDimension: 'ROWS',
          values: dataArray, },
    }, cb);
  }

  getData(dataRange, cb){
    var _this = this;
    sheets.spreadsheets.values.get({
      auth: _this.auth,
      spreadsheetId: _this.ssid,
      range: dataRange,
    }, cb);
  }
}

exports.SpreadSheet = SpreadSheet;
