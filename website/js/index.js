
import data from fruitCatalogue.js; //import data from the other JS file

const firstFruit= data[0]; //pick the first object from the catalogue and assign it to first fruit

document.getElementById("fruitOneName").innerHTML = "Mangoes"; //assign name of fruitOne to first fruit name object value
document.getElementById("fruitOneImg").src = "img/fruitSeven.jpg"; //change image source
document.getElementById("fruitOneCert").innerHTML = "They have succulent sweet flesh and a unique mango flavour"