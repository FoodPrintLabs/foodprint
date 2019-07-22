
import data from fruitCatalogue.js //import data from the other JS file
const firstFruit= data[0] //pick the first object from the catalogue and assign it to first fruit
document.getElementById("fruitOneName").innerHTML = firstFruit.fruit_name
document.getElementById("fruitOne").src = "fruitOne.jpg" //change image source