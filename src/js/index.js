
import data from fruitCatalogue.js; //import data from the other JS file

const firstFruit= data[0]; //pick the first object from the catalogue and assign it to first fruit

document.getElementById("fruitOneName").innerHTML = "Mangoes"; //assign name of fruitOne to first fruit name object value
document.getElementById("fruitOneImg").src = "img/fruitSeven.jpg"; //change image source
document.getElementById("fruitOneCert").innerHTML = "They have succulent sweet flesh and a unique mango flavour";

var fruitbasket = ["fruitOne", "fruitTwo", "fruitThree", "fruitFour", "fruitFour", "fruitFive", "fruitSex"]; //create a basket of fruits


//fruit basket gives us part of the name of the ID of the html objects
//fruit catalogue gives us the json object from where we will extract data pertaining to each fruit
function addFruitInfo (){
    var i; //variable i is used to keep track of the indexing in the fruit basket
    var j; //variable j is used to call up the indexing in the fruit catalogue
    for (i = 0; i < fruitbasket.length ;i++) {
        for (j = 0; i < fruitbasket.length ;j++) {
            document.getElementById(fruitbasket[i]+ "Name").innerHTML = data[j].fruit_name;
            document.getElementById(fruitbasket[i] + "Img").src = data[j].picture;
            document.getElementById(fruitbasket[i] + "Cert").innerHTML = data[j].fruit_cert;
          }
      }
}