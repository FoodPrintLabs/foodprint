var product = artifacts.require("./product.sol");

module.exports = function(deployer) {
    deployer.deploy(product);
};