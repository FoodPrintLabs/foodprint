require('dotenv').config();
var records = [
  {
    id: 1,
    username: 'adminjack',
    password: process.env.USER1_PASSWORD,
    displayName: 'Admin Jack',
    prefs: [{ value: 'adminjack@example.com' }],
    email: 'adminjack@example.com',
    role: 'Admin',
  },
  {
    id: 2,
    username: 'marketjenny',
    password: process.env.USER2_PASSWORD,
    displayName: 'Market Jenny',
    prefs: [{ value: 'marketjenny@example.com' }],
    email: 'marketjenny@example.com',
    role: 'Market',
  },
  {
    id: 3,
    username: 'farmerbrown',
    password: process.env.USER3_PASSWORD,
    displayName: 'Farmer Brown ',
    prefs: [{ value: 'farmerbrown@example.com' }],
    email: 'farmerbrown@example.com',
    role: 'Farmer',
  },
  {
    id: 4,
    username: 'consumerjill',
    password: process.env.USER4_PASSWORD,
    displayName: 'Consumer Jill',
    prefs: [{ value: 'consumerjill@example.com' }],
    email: 'consumerjill@example.com',
    role: 'Consumer',
  },
  {
    id: 5,
    username: 'superuserjulz',
    password: process.env.USER5_PASSWORD,
    displayName: 'Super User Julz',
    prefs: [{ value: 'superuserjulz@example.com' }],
    email: 'superuserjulz@example.com',
    role: 'Superuser',
  },
  {
    id: 6,
    username: 'buyerman',
    password: process.env.USER6_PASSWORD,
    displayName: 'Buyer Man',
    prefs: [{ value: 'buyerman@example.com' }],
    email: 'buyerman@example.com',
    role: 'Buyer',
  },
  {
    id: 7,
    username: 'sellerman',
    password: process.env.USER7_PASSWORD,
    displayName: 'Seller Man',
    prefs: [{ value: 'sellerman@example.com' }],
    email: 'sellerman@example.com',
    role: 'Seller',
  },
];

exports.findById = function (id, cb) {
  process.nextTick(function () {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
};

exports.findByUsername = function (username, cb) {
  process.nextTick(function () {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
};
