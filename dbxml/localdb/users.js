/* TODO import users from a gitignored json file */
var records = [
    { id: 1, username: 'adminjack', password: 'birthday', displayName: 'Admin Jack', prefs: [ { value: 'adminjack@example.com' } ], email: 'adminjack@example.com', role: 'Admin'  }
  , { id: 2, username: 'marketjenny', password: 'birthday', displayName: 'Market Jenny', prefs: [ { value: 'marketjenny@example.com' } ], email: 'marketjenny@example.com', role: 'Market'  }
  , { id: 3, username: 'farmerbrown', password: 'birthday', displayName: 'Farmer Brown ', prefs: [ { value: 'farmerbrown@example.com' } ], email: 'farmerbrown@example.com', role: 'Farmer'  }
  , { id: 4, username: 'consumerjill', password: 'birthday', displayName: 'Consumer Jill', prefs: [ { value: 'consumerjill@example.com' } ], email: 'consumerjill@example.com', role: 'Consumer'  }
  , { id: 5, username: 'superuserjulz', password: 'birthday', displayName: 'Super User Julz', prefs: [ { value: 'superuserjulz@example.com' } ], email: 'superuserjulz@example.com', role: 'Superuser'  }
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