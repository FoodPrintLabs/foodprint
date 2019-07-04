const product = artifacts.require('product')

contract('product', function (accounts) {

  // predefine parameters for harvest
  const ID = 'AA001'
  const supplierID = 'OZF'
  const supplierAddress = '0x4657892df'  //should the account address be used here instead of hardcoded?
  const productID = 'APP'
  const photoHash = '456xf87909'
  const harvestTimeStamp = '20190625 14:00'
  const harvestCaptureTime = '20190725 15:00'

  it('should contain zero harvests in the beginning', async function () {
    // fetch instance of harvest contract
    let harvestInstance = await product.deployed()
    // get the number of harvests
    let harvestCounter = await harvestInstance.noHarvests()
    // check that there are no songs initially
    assert.equal(harvestCounter, 0, 'initial number not equal to zero')
  })

  it('should add a harvest to the registry', async function () {
    let harvestInstance = await product.deployed()
    // register a song from account 0
    await harvestInstance.registerHarvest(
        ID,
        supplierID,
        supplierAddress,
        productID,
        photoHash,
        harvestTimeStamp,
        harvestCaptureTime
      //{ from: accounts[0] }
    )
    // get the number of harvests
    let songCounter = await harvestInstance.noHarvests()
    // check that there is one harvest available now
    assert.equal(harvestCounter, 1, 'harvest was not successfully registered')
    // retrieve the harvest details
    let harvest = await harvestInstance.harvestProduceArray(0)
    // check that they match the original song details
    assert.equal(harvest['ID'], ID, 'ID does not match')
    assert.equal(song['supplierID'], supplierID, 'supplier ID does not match')
    assert.equal(song['supplierAddress'], supplierAddress, 'supplier address does not match')
    assert.equal(song['productID'], productID, 'product ID does not match')
    assert.equal(song['photoHash'], photoHash, 'photo hash does not match')
    assert.equal(song['harvestTimeStamp'], harvestTimeStamp, 'product ID does not match')
    assert.equal(song['harvestCaptureTime'], harvestCaptureTime, 'product ID does not match')
    })

//   it('should only return true for buyers', async function () {
//     let SongRegistryInstance = await SongRegistry.deployed()
//     // call the checkBuyer function from account 0
//     let checkBuyer = await SongRegistryInstance.checkBuyer(0, { from: accounts[0] })
//     // check that it returns true
//     assert.equal(checkBuyer, true, 'Owner is not buyer')
//     // call the checkBuyer function from account 1
//     checkBuyer = await SongRegistryInstance.checkBuyer(0, { from: accounts[1] })
//     // check that it returns false
//     assert.equal(checkBuyer, false, 'Account 1 should not be a buyer')
//   })

//   it('should allow account 1 to buy the song', async function () {
//     let SongRegistryInstance = await SongRegistry.deployed()
//     // get the initial balance of account 0
//     let account0InitialBalance = await web3.eth.getBalance(accounts[0])
//     // buy the song from account 1
//     await SongRegistryInstance.buySong(0, { from: accounts[1], value: songPrice })
//     // call checkBuyer from account 1
//     let checkBuyer = await SongRegistryInstance.checkBuyer(0, { from: accounts[1] })
//     // check that it returns true
//     assert.equal(checkBuyer, true, 'Account 1 should be a buyer')
//     // get the new balance of account 0
//     let account0NewBalance = await web3.eth.getBalance(accounts[0])
//     // check that it has increased by the song price
//     assert.equal(account0NewBalance, Number(account0InitialBalance) + Number(songPrice), 'Account 0 was paid by account 1')
//   })
})
