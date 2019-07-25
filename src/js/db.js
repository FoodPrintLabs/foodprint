 var mysql=require('mysql');
 var connection=mysql.createConnection({
   host:'localhost',
   user:'your username',
   password:'your password',
   database:'your database name'
 });
connection.connect(function(error){
   if(!!error){
     console.log(error);
   }else{
     console.log('Connected!:)');
   }
 });  
module.exports = connection; 