const {google} = require('googleapis');

const admin = google.admin({version: 'directory_v1'});

class GroupManager {
  constructor(auth, group){
    var _this = this;
    _this.auth = auth;
    _this.group = group;
  }

  addMember(email){
    var _this = this;
    return admin.members.insert({
      auth: _this.auth,
      groupKey: _this.group,
      requestBody: {
        email: email
      },
    });
  }
}

exports.GroupManager = GroupManager;
