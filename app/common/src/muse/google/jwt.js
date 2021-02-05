var {google} = require('googleapis');

exports.Client = (scopes, credLoc)=>{
  keys = require(credLoc);
  return new google.auth.JWT({
    email:keys.client_email,
    key:keys.private_key,
    scopes: scopes
  })
}
