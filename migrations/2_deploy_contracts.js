var product = artifacts.require("TheProduct");

module.exports = function(deployer) {
    deployer.deploy(product);
};