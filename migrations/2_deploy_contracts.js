//var product = artifacts.require("TheProduct");
var product = artifacts.require("TheProductV2");

module.exports = function(deployer) {
    deployer.deploy(product);
};