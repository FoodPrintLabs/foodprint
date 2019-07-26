const product = artifacts.require('product');

contract('product', function (accounts) {

  // predefine parameters for harvest
  const ID = 'AA001';
  const supplierID = 'OZF';
  const supplierAddress = '0x4657892df';  //should the account address be used here instead of hardcoded?
  const productID = 'APP';
  const photoHash = '456xf87909';
  const harvestTimeStamp = '20190625 14:00';
  const harvestCaptureTime = '20190725 15:00';

  it('should contain zero harvests in the beginning', async function () {
    // fetch instance of harvest contract
    let harvestInstance = await product.deployed();
    // get the number of harvests
    let harvestCounter = await harvestInstance.noHarvests();
    // check that there are no harvests initially
    assert.equal(harvestCounter, 0, 'initial number not equal to zero')
  });

  it('should add a harvest to the registry', async function () {
    let harvestInstance = await product.deployed();
    // register a harvest from account 0
    await harvestInstance.registerHarvest(
        ID,
        supplierID,
        supplierAddress,
        productID,
        photoHash,
        harvestTimeStamp,
        harvestCaptureTime
      //{ from: accounts[0] }
    );
    // get the number of harvests
    let harvestCounter = await harvestInstance.noHarvests();
    // check that there is one harvest available now
    assert.equal(harvestCounter, 1, 'harvest was not successfully registered');
    // retrieve the harvest details
    let harvest = await harvestInstance.harvestProduceArray(0);
    // check that they match the original harvest details
    assert.equal(harvest['ID'], ID, 'ID does not match');
    assert.equal(harvest['supplierID'], supplierID, 'supplier ID does not match');
    assert.equal(harvest['supplierAddress'], supplierAddress, 'supplier address does not match');
    assert.equal(harvest['productID'], productID, 'product ID does not match');
    assert.equal(harvest['photoHash'], photoHash, 'photo hash does not match');
    assert.equal(harvest['harvestTimeStamp'], harvestTimeStamp, 'product ID does not match');
    assert.equal(harvest['harvestCaptureTime'], harvestCaptureTime, 'product ID does not match')
    });

});
