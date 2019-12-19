const QRCode = require('qrcode');
const fs = require('fs');

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',




  init: function() {
    return App.initWeb3();
  },

  //Set up web3.js - library that allows our client-side application to interface with blockchain.
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    // // Specify default instance if no web3 instance provided
    // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    // web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  //Fetch the deployed instance of the smart contract (JSON), initialise TruffleContract and attach Web3 provider.
  initContract: function() {
    $.getJSON("contracts/TheProduct.json", function(TheProductArtifact) {
      // Load JSON artifact and try to use it to initialize a TruffleContract instance
      App.contracts.TheProduct = TruffleContract(TheProductArtifact);
      // Connect provider to interact with contract
      App.contracts.TheProduct.setProvider(App.web3Provider);

      if (window.location.href.match('weekly') != null) {
       return App.displayWeeklyView();
      }
      else{
       App.listenForEvents();
       return App.render();
      }
    });
  },

  //Render function updates web page with data from the smart contract.
  render: function() {
    var theProductInstance;
    var loader = $("#loader");
    var content = $("#content");

    var loaderStorage = $("#loaderStorage");
    var contentStorage = $("#contentStorage");

    loader.show();
    content.hide();

    loaderStorage.show();
    contentStorage.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#coinbaseAddress").html("Coinbase Account Address: " + account);
      }
    });

    // Load contract data for Harvest
    App.contracts.TheProduct.deployed().then(function(instance) {
      theProductInstance = instance;
      return theProductInstance.noHarvests();
    }).then(function(harvestCount) {
      var tableHarvest = $("#tableHarvest");
      tableHarvest.empty();

      var inputSupplierStorageSelect = $('#inputSupplierStorage');
      inputSupplierStorageSelect.empty();

      var optionValue = "Choose harvest entry...";
      var optionId = "Choose harvest entry...";
      //inputSupplierStorageSelect.attr('placeholder','Choose harvest entry...');
      var inputSupplierStorageOption = "<option value='" + optionId + "' selected disabled >" + optionValue + "</ option>";
      inputSupplierStorageSelect.append(inputSupplierStorageOption);

      for (var i = 0; i <= harvestCount; i++) {
        theProductInstance.harvestProduceArray(i).then(function(harvest) {
          console.log(harvest);
          var harvestSupplier = harvest[1];
          var harvestProduct = harvest[3];
          var harvestPhoto = harvest[4];
          var harvestTime = harvest[5];
          var harvestDataCaptureTime = harvest[6];

          // Render Harvest entries
          var harvestEntry = "<tr><td>" + harvestSupplier + "</td><td>" + harvestProduct + "</td><td>" +
          harvestPhoto + "</td><td>" + harvestTime + "</td><td>" + harvestDataCaptureTime + "</td></tr>"
          tableHarvest.append(harvestEntry);

          //<option>Oranjezicht City Farm - Apples - 8 July 2019</option>
          optionValue = harvestSupplier + " " + harvestProduct + " " + harvestTime;
          optionId = harvestSupplier + "_" + harvestProduct + "_" + harvestTime;
          inputSupplierStorageOption = "<option value='" + optionId + "' >" + optionValue + "</ option>";
          inputSupplierStorageSelect.append(inputSupplierStorageOption);
          console.log("inputSupplierStorageOption " + inputSupplierStorageOption);
        });
        var numHarvest = $("#numHarvest");
        numHarvest.html(harvestCount.toString());

      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });

    // Load contract data for Storage
    App.contracts.TheProduct.deployed().then(function(instance) {
      theProductInstance = instance;
      return theProductInstance.noStorage();
    }).then(function(storageCount) {

      var tableStorage = $("#tableStorage");
      tableStorage.empty();

      for (var i = 0; i <= storageCount; i++) {
        theProductInstance.storageProduceArray(i).then(function(storage) {
          console.log(storage);
          var storageSupplierProductDate = storage[1];
          var storageQuantity = storage[3];
          var storageUoM = storage[4];
          var storageTime = storage[5];
          var storageDataCaptureTime = storage[6];

          // Render Storage entries
          var storageEntry = "<tr><td>" + storageSupplierProductDate + "</td><td>" + storageQuantity + "</td><td>" +
          storageUoM + "</td><td>" + storageTime + "</td><td>" + storageDataCaptureTime + "</td></tr>"
          tableStorage.append(storageEntry);
        });
        var numStorage = $("#numStorage");
        numStorage.html(storageCount.toString());

      };
        //testQRCode - add to page that imports app.js
        //<div id="testQRCode"></div>
        //createQRCode("testQRCode", "OranjezichtCityFarm_Apples", "http://localhost:3000/scanresult/OranjezichtCityFarm_Apples");

      loaderStorage.hide();
      contentStorage.show();
    }).catch(function(error) {
      console.warn(error);
    });

  },

  displayWeeklyView: function(){
    console.log(" Entered displayWeeklyView function");
    var theProductInstance;
    var loaderWeekly = $("#loaderWeekly");
    var contentWeekly = $("#contentWeekly");

    loaderWeekly.show();
    contentWeekly.hide();

    // Load contract data for Weekly view
    App.contracts.TheProduct.deployed().then(function(instance) {
      theProductInstance = instance;
      return theProductInstance.noStorage();
    }).then(function(storageCount) {
      var cardDeckWeekly = $("#cardDeckWeekly");
     cardDeckWeekly.empty();

      for (var i = 0; i <= storageCount; i++) {
          (function(j){
                theProductInstance.storageProduceArray(j).then(function(storage) {
                  //console.log(storage);
                  var storageSupplierProductDate = storage[1];
                  // var storageQuantity = storage[3];
                  // var storageUoM = storage[4];
                  // var storageTime = storage[5];
                  var storageDataCaptureTime = storage[6];
                  //e.g. storageSupplierProductDate Oranjezicht City Farm_Apples_2019-07-05 09:25
                  var supplierProductDateArray = storageSupplierProductDate.split("_");
                  var cardTitle =   supplierProductDateArray[1]; //produce
                  var cardText =   supplierProductDateArray[0]; //supplier
                  if (typeof cardTitle !== "undefined"){
                      var cardUpdateTime = storageDataCaptureTime;
                      var QRCodeSupplierProduce = (cardText + "_" + cardTitle).replace(/\s/g,'');
                      var QRCodeID = "QRCode_" + j + "_" + QRCodeSupplierProduce;

                      var weeklyEntry = '<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12 ">\n' +
                            '          <div class="service">\n' +
                            '            <div class="icon"><i class="icon-tree"></i></div>\n' +
                            '            <h2 class="heading">'+cardTitle+'</h2>\n' +
                            '            <p>' + cardText + '</p>\n' +
                            '            <p><small class="text-muted">Last Updated on ' +  cardUpdateTime + '</small></p>\n' +
                            "            <div id='"+QRCodeID+"' align='center'></div>\
                                         <p class='modal-text' align='center'><small class='text-muted'>Scan QR Code to Visualise the Food Journey (using your camera app)</small></p>\n"+
                            '          </div>\n' +
                            '        <div class="clearfix visible-lg-block visible-md-block"></div>\n' +
                            '      </div>';
                      cardDeckWeekly.append(weeklyEntry);
                      var baseURL = window.location.origin; //"http://localhost:3000"
                      var QRCodeURL = baseURL + "/scan/" + QRCodeSupplierProduce; //http://localhost:3000/scanresult/OranjezichtCityFarm_Apples
                      //console.log('QRCodeURL ' + QRCodeURL);
                      createQRCode(QRCodeID, QRCodeSupplierProduce, QRCodeURL);
                   }
                });
        })(i);
      };

      loaderWeekly.hide();
      contentWeekly.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  registerHarvest: function() {
    var inputSupplier = $('#inputSupplier').val();
    var inputProduct = $('#inputProduct').val();
    var inputPhoto = $('#inputPhoto').val();
    //var inputHarvestTime = $('#inputHarvestTime').data("datetimepicker").date();
    var inputHarvestTime = new Date($('#inputHarvestTime').val());
   // var inputDataTime = $('#inputDataTime').data("datetimepicker").date();
    var inputDataTime =  new Date($('#inputDataTime').val());

    var momentHarvestTime =  moment(inputHarvestTime).format('YYYY-MM-DD HH:mm');
    var momentInputDataTime =  moment(inputDataTime).format('YYYY-MM-DD HH:mm')

    //solidityContext required if you use msg object in contract function e.g. msg.sender
    var solidityContext = {from: web3.eth.accounts[1], gas:3000000}; //add gas to avoid out of gas exception

    App.contracts.TheProduct.deployed().then(function(instance) {
      // const ID = 'AA001'
      // const supplierID = 'OZF'
      // const supplierAddress = '0x4657892df'  //should the account address be used here instead of hardcoded?
      // const productID = 'APP'
      // const photoHash = '456xf87909'
      // const harvestTimeStamp = '20190625 14:00'
      // const harvestCaptureTime = '20190725 15:00'
      // registerHarvest(ID,supplierID,supplierAddress,productID,photoHash, harvestTimeStamp,harvestCaptureTime,
      //     { from: accounts[0] })
      console.log("registerHarvest Click");
      console.log("inputHarvestTime -" + momentHarvestTime);
      console.log("inputDataTime -" + momentInputDataTime);
      console.log("solidityContext -" + solidityContext);
      return instance.registerHarvest("2", inputSupplier, "0x874950b8c006e6d166f015236623fcd0c0a7dc75", inputProduct, inputPhoto, momentHarvestTime, momentInputDataTime, solidityContext);
    }).then(function() {
        $("#formRegisterHarvest").get(0).reset() // or $('form')[0].reset()
    }).then(function(){
        const addHarvestRequest = new XMLHttpRequest();
        addHarvestRequest.open('post', '/app/addHarvest');
        addHarvestRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        // ID ,
        // supplierID,
        // supplierAddress,
        // productID,
        // photoHash,
        // harvestTimeStamp,
        // harvestCaptureTime,
        // harvestDescription,
        // geolocation,
        // supplierproduce

        var harvestSupplierProduce = (inputSupplier + "_" + inputProduct).replace(/\s/g,'');
        addHarvestRequest.send(JSON.stringify({
            'ID':"2",
            'supplierID': inputSupplier,
            'supplierAddress': "0x874950b8c006e6d166f015236623fcd0c0a7dc75",
            'productID': inputProduct,
            'photoHash': inputPhoto,
            'harvestTimeStamp': momentHarvestTime,
            'harvestCaptureTime': momentInputDataTime,
            'harvestDescription': "harvestDescription",
            'geolocation': "-33.9180, 25.5701",
            'supplierproduce': harvestSupplierProduce
        }));
    }).catch(function(err) {
      console.error(err);
    });
  },

  registerStorage: function() {
    var inputSupplierStorage = $('#inputSupplierStorage').val();
    var inputQuantityStorage = $('#inputQuantityStorage').val();
    var inputUoMStorage = $('#inputUoMStorage').val();
   // var inputStorageTime = $('#inputStorageTime').data("datetimepicker").date();
    var inputStorageTime = new Date($('#inputStorageTime').val());
    //var inputDataTimeStorage = $('#inputDataTimeStorage').data("datetimepicker").date();
    var inputDataTimeStorage = new Date($('#inputDataTimeStorage').val());

    var momentInputStorageTime =  moment(inputStorageTime).format('YYYY-MM-DD HH:mm');
    var momentInputDataTimeStorage =  moment(inputDataTimeStorage).format('YYYY-MM-DD HH:mm')

    //solidityContext required if you use msg object in contract function e.g. msg.sender
    var solidityContext = {from: web3.eth.accounts[1], gas:3000000}; //add gas to avoid out of gas exception

    App.contracts.TheProduct.deployed().then(function(instance) {
      console.log("registerStorage Click");
      console.log("inputSupplierStorage -" + inputSupplierStorage);
      console.log("inputQuantityStorage -" + inputQuantityStorage);
      console.log("inputUoMStorage -" + inputUoMStorage);
      console.log("inputStorageTime -" + momentInputStorageTime);
      console.log("inputDataTimeStorage -" + momentInputDataTimeStorage);
      console.log("solidityContext -" + solidityContext);
      return instance.registerStorage("2", inputSupplierStorage, "0x874950b8c006e6d166f015236623fcd0c0a7dc75", inputQuantityStorage, inputUoMStorage, momentInputStorageTime,  momentInputDataTimeStorage, "www.uct.ac.za", "test hash 1234", solidityContext);
    }).then(function(){
      $("#formRegisterStorage").get(0).reset() // or $('form')[0].reset()
    }).then(function(){
        const addStorageRequest = new XMLHttpRequest();
        addStorageRequest.open('post', '/app/addStorage');
        addStorageRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        // ID,
        // marketID,
        // marketAddress,
        // quantity,
        // unitOfMeasure,
        // storageTimeStamp,
        // storageCaptureTime,
        // URL,
        // hashID,
        // storageDescription,
        // geolocation,
        // supplierproduce

        // //e.g. storageSupplierProductDate Oranjezicht City Farm_Apples_2019-07-05 09:25 inputSupplierStorage
        var supplierProductDateArray = inputSupplierStorage.split("_");
        var supplierName =   supplierProductDateArray[0]; //supplier
        var supplierProduce =   supplierProductDateArray[1]; //produce
        var storageSupplierProduce = (supplierName + "_" + supplierProduce).replace(/\s/g,'');

        addStorageRequest.send(JSON.stringify({
            'ID':"2",
            'marketID': inputSupplierStorage,
            'marketAddress': "0x874950b8c006e6d166f015236623fcd0c0a7dc75",
            'quantity': inputQuantityStorage,
            'unitOfMeasure': inputUoMStorage,
            'storageTimeStamp': momentInputStorageTime,
            'storageCaptureTime': momentInputDataTimeStorage,
            'URL': "www.uct.ac.za",
            'hashID': "test hash 1234",
            'storageDescription': "storageDescription",
            'geolocation': "-33.9180, 25.5701",
            'supplierproduce': storageSupplierProduce
        }));
    }).catch(function(err) {
      console.error(err);
    });
  },



  listenForEvents: function() {
    App.contracts.TheProduct.deployed().then(function(instance) {
      instance.registeredHarvestEvent({}, {
       //fromBlock: 0,
       toBlock: 'latest'
      }).watch(function(error, event) {
          if (error) {
            return error(error);
          }
        console.log("event triggered", event);
        TriggerAlertOpen("#divNotificationBar", '"divHarvestRegisterAlert"', "Harvest Registered");
        TriggerAlertClose("#divHarvestRegisterAlert");
        // Reload when a new harvest is registered
        App.render();
      });
    });
  }
};

function TriggerAlertOpen(parentDivID, alertDivID, alertMessage) {
  //open  alert box after 1 seconds (1000 milliseconds):
  console.log("TriggerAlertOpen")
  var divNotificationHtml = '<div id='+alertDivID+' class="alert alert-success fade in show"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button><strong>'+alertMessage+'</strong></div>'
  console.log(divNotificationHtml)
  $(parentDivID).html(divNotificationHtml);
};

function TriggerAlertClose(alertDivID) {
  //remove  alert box after 5 seconds (5000 milliseconds):
  window.setTimeout(function () {
      $(alertDivID).fadeTo(1000, 0).slideUp(1000, function () {
          $(this).remove();
      });
  }, 5000);
};

async function createQRCode(QRCodeHtmlID, QRCodeSupplierProduce, produceUrl) {
  const res = await QRCode.toDataURL(produceUrl); //"data:image/png,%89PNG%0D%0A..."
  var divQRCodeHtml = '<img src='+ res + '>';
      $('#'+ QRCodeHtmlID).html(divQRCodeHtml);
  console.log('QRCode created for ' + QRCodeSupplierProduce + ' with ID ' + QRCodeHtmlID);
  };

$('#numHarvestButton').click(function (e) {
  e.preventDefault()
  //alert("Window Loaded");
  App.contracts.TheProduct.deployed().then(function(instance) {
  theProductInstance = instance;
  return theProductInstance.noHarvests();
    }).then(function(harvestsCount) {
      console.log("numHarvestButton Click - " + harvestsCount.toString());
      var divNumHarvestHtml = '<div class="alert alert-success fade in show"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button><strong>Number of Harvest entries </strong>' + harvestsCount.toString() +'</div>'
      $('#divNumHarvest').html(divNumHarvestHtml);
    }).catch(function(error) {
      console.warn(error);
    });
});

$('#numStorageButton').click(function (e) {
  e.preventDefault()
  //alert("Window Loaded");
  App.contracts.TheProduct.deployed().then(function(instance) {
  theProductInstance = instance;
  return theProductInstance.noStorage();
    }).then(function(storageCount) {
      console.log("numStorageButton Click - " + storageCount.toString());
      var divNumStorageHtml = '<div class="alert alert-success fade in show"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button><strong>Number of Storage entries </strong>' + storageCount.toString() +'</div>'
      $('#divNumStorage').html(divNumStorageHtml);
    }).catch(function(error) {
      console.warn(error);
    });
});

// app.js is included in index.html
// when index.html is opened in the browser, load function is executed when complete page is fully loaded, including all frames, objects and images
$(window).on('load', function () {
   App.init();
});
