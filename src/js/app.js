App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  //Set up web3.js - library that allows our client-side application to interface with blockchain.
  initWeb3: function() {
    // if (typeof web3 !== 'undefined') {
    //   // If a web3 instance is already provided by Meta Mask.
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // Specify default instance if no web3 instance provided
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    //   web3 = new Web3(App.web3Provider);
    // }
    // Specify default instance if no web3 instance provided
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  //Fetch the deployed instance of the smart contract (JSON), initialise TruffleContract and attach Web3 provider.
  initContract: function() {
    $.getJSON("TheProduct.json", function(TheProductArtifact) {
      // Load JSON artifact and try to use it to initialize a TruffleContract instance
      App.contracts.TheProduct = TruffleContract(TheProductArtifact);
      // Connect provider to interact with contract
      App.contracts.TheProduct.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  //Render function updates web page with data from the smart contract.
  render: function() {
    var theProductInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#coinbaseAddress").html("Coinbase Account Address: " + account);
      }
    });

    // Load contract data
    App.contracts.TheProduct.deployed().then(function(instance) {
      theProductInstance = instance;
      return theProductInstance.noHarvests();
    }).then(function(harvestCount) {
      var tableHarvest = $("#tableHarvest");
      tableHarvest.empty();

      for (var i = 0; i <= harvestCount; i++) {
        theProductInstance.harvestProduceArray(i).then(function(harvest) {
          var harvestSupplier = harvest[2];
          var harvestProduct = harvest[4];
          var harvestPhoto = harvest[5];
          var harvestTime = harvest[6];
          var harvestDataCaptureTime = harvest[7];

          // Render Harvest entries
          var harvestEntry = "<tr><td>" + harvestSupplier + "</td><td>" + harvestProduct + "</td><td>" +
          harvestPhoto + "</td><td>" + harvestTime + "</td><td>" + harvestDataCaptureTime + "</td></tr>"
          tableHarvest.append(harvestEntry);
        });
        var numHarvest = $("#numHarvest");
        numHarvest.html(harvestCount.toString());

      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  registerHarvest: function() {
    var inputSupplier = $('#inputSupplier').val();
    var inputProduct = $('#inputProduct').val();
    var inputPhoto = $('#inputPhoto').val();
    var inputHarvestTime = $('#inputHarvestTime').val();
    var inputDataTime = $('#inputDataTime').val();
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
      return instance.registerHarvest(001, inputSupplier, "0x874950b8c006e6d166f015236623fcd0c0a7dc75", inputProduct, inputPhoto, inputHarvestTime, inputDataTime, solidityContext);
    }).then(function(){
      $("#formRegisterHarvest").get(0).reset() // or $('form')[0].reset()
    }).catch(function(err) {
      console.error(err);
    });
  },

  listenForEvents: function() {
    App.contracts.TheProduct.deployed().then(function(instance) {
      instance.registeredHarvestEvent({}, {
       // fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
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

// app.js is included in index.html
// when index.html is opened in the browser, load function is executed when complete page is fully loaded, including all frames, objects and images
$(window).on('load', function () {
  //alert("Window Loaded");
  App.init();
});