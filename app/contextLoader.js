exports.load = (contextBridge)=>{
  contextBridge.exposeInMainWorld('config', require('electron').getGlobal('config'));
}
