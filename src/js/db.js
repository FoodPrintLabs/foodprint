var mysql = require('mysql2');
var config = require("../../dbconfig");
var pool = mysql.createPool(config.db_pool);
module.exports = pool;

/* Connection pools help reduce the time spent connecting to the MySQL server by reusing a previous connection,
leaving them open instead of closing when you are done with them. This improves the latency of queries as you avoid all
of the overhead that comes with establishing a new connection. */