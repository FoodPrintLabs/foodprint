var mysql=require('mysql');
var config  = require("../../dbconfig");
var connection=mysql.createConnection(config.db);
connection.connect(function(error){
    if(error){
         console.log(error);
        }else{
         console.log('Connected!:)');
        }
    });
module.exports = connection; 