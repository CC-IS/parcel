class SheetInfo extends Array{
  constructor( sheet, subsheet){
    super();
    var _this = this;
    this.sub = subsheet;
    this.sheet = sheet;

    this.initProm = this.query(`${_this.sub}!1:1`).then((values)=>{
      _this.length = 0;
      values[0].forEach(val => _this.push(val));
    });

  }

  query(range){
    if(this.initProm && this.initProm.pending){
      console.log('pending');
      return this.initProm.then(()=>{
        this.sheet.getData(range, (err, result)=>{
          if(err) throw(err);
          else return(result.data.values);
        });
      });
    } else return new Promise((resolve,reject)=>{
      this.sheet.getData(range, (err, result)=>{
        if(err) reject(err);
        else resolve(result.data.values);
      });
    });
  }

  col(key){
    var _this = this;
    return String.fromCharCode(65 + _this.indexOf(key));
  }

  keyRange(key, rStart = '', rEnd = ''){
    var cl = this.col(key);
    return `${this.sub}!${cl+rStart}:${cl+rEnd}`;
  }

  rangeFromKeyValue(key, value){
    var _this = this;
    return _this.initProm.then(()=>{
      return _this.query(_this.keyRange(key)).then((values)=>{
        var row = values.findIndex(el => el[0] == value) + 1;
        if(row > 0) return(`${_this.sub}!${row}:${row}`);
        else throw('VAL_NOT_FOUND');
      });
    });

  }

  rowFromKeyValue(key, value){
    var _this = this;
    return _this.rangeFromKeyValue(key, value).then((range)=>{
      return _this.query(range);
    });
  }

  objectFromKeyValue(key, value){
    var _this = this;
    return _this.rowFromKeyValue(key, value).then(values=>{
      var ret = {};
      _this.forEach((key, i) => {
        ret[key] = values[0][i];
      });
      return ret;
    })
  }

  amendOrAddFromObject(obj, key){
    var _this = this;
    return this.initProm.then(()=>{
      return _this.rangeFromKeyValue(key, obj[key]).then(range=>{
        return _this.amendRowFromObject(obj, range);
      }).catch(err=>{
        if(err == 'VAL_NOT_FOUND') return _this.addRowFromObject(obj);
      });
    });
  }

  amendRowFromObject(obj, range){
    var data = [];
    data[0] = [];
    var _this = this;
    _this.forEach((item, i) => {
      if(obj[item]) data[0][i] = obj[item];
    });

    return this.initProm.then(()=>{
      _this.sheet.putData(range, data, (err,res)=>{
        if(err) throw error;
        else return res;
      });
    })
  }

  addRowFromObject(obj){
    var data = [];
    data[0] = [];
    var _this = this;
    _this.forEach((item, i) => {
      if(obj[item]) data[0][i] = obj[item];
    });

    return this.initProm.then(()=>{
      this.sheet.appendData(`${_this.sub}!A1:A1`, data, (err,res)=>{
        if(err) throw err;
        else return res;
      });
    });
  }
}

exports.SheetInfo = SheetInfo;
