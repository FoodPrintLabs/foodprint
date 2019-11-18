/* TODO import users from a gitignored json file */
var records = [
    { id: 1, username: 'admin', password: 'birthday', displayName: 'Admin Jack', emails: [ { value: 'adminjack@example.com' } ], usergroup: 'group.admin'  }
  , { id: 2, username: 'market_user', password: 'birthday', displayName: 'Market Jenny', emails: [ { value: 'marketjenny@example.com' } ], usergroup: 'group.market'  }
  , { id: 3, username: 'farmer', password: 'birthday', displayName: 'Farmer Brown ', emails: [ { value: 'farmerbrown@example.com' } ], usergroup: 'group.farmer'  }
  , { id: 4, username: 'consumer', password: 'birthday', displayName: 'Consumer Jill', emails: [ { value: 'consumerjill@example.com' } ], usergroup: 'group.consumer'  }
  , { id: 5, username: 'superuser', password: 'birthday', displayName: 'Super User Julz', emails: [ { value: 'superuserjulz@example.com' } ], usergroup: 'group.superuser'  }
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}