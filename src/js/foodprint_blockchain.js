$(document).ready(function() {
    const foodPrintProduceContractAddress = '0x02F216543cb0a0ba108dbd90687E9cd99C41dE16';

    // The second is the Application Binary interface or the ABI of the contract code.
    // ABI is just a list of method signatures, return types, members etc of the contract in a defined JSON format.
    // This ABI is needed when you will call your contract from a real javascript client.
    const foodPrintProduceContractABI = [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "harvestLogIDs",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "name": "harvestDetailMap",
        "outputs": [
          {
            "name": "harvestID",
            "type": "string"
          },
          {
            "name": "growingCondtions",
            "type": "string"
          },
          {
            "name": "harvestDescription",
            "type": "string"
          },
          {
            "name": "harvestTableName",
            "type": "string"
          },
          {
            "name": "harvestQuantity",
            "type": "string"
          },
          {
            "name": "harvestUser",
            "type": "string"
          },
          {
            "name": "BlockNumber",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "name": "harvestAddressMap",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "name": "storageMap",
        "outputs": [
          {
            "name": "storageID",
            "type": "string"
          },
          {
            "name": "harvestID",
            "type": "string"
          },
          {
            "name": "otherID",
            "type": "string"
          },
          {
            "name": "storageTimeStamp",
            "type": "string"
          },
          {
            "name": "storageDetail",
            "type": "string"
          },
          {
            "name": "BlockNumber",
            "type": "uint256"
          },
          {
            "name": "IsSet",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "isOwner",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "name": "harvestMap",
        "outputs": [
          {
            "name": "harvestID",
            "type": "string"
          },
          {
            "name": "supplierproduceID",
            "type": "string"
          },
          {
            "name": "photoHash",
            "type": "string"
          },
          {
            "name": "geolocation",
            "type": "string"
          },
          {
            "name": "harvestTimeStamp",
            "type": "string"
          },
          {
            "name": "BlockNumber",
            "type": "uint256"
          },
          {
            "name": "IsSet",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "name": "storageAddressMap",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "storageLogIDs",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_harvestLogIDIndex",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_harvestID",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "_harvestSubmissionBlockNumber",
            "type": "uint256"
          }
        ],
        "name": "registeredHarvestEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_harvestID",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "_harvestSubmissionBlockNumber",
            "type": "uint256"
          }
        ],
        "name": "registeredHarvestDetailEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_storageLogIDIndex",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_storageID",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "_storageSubmissionBlockNumber",
            "type": "uint256"
          }
        ],
        "name": "registeredStorageEvent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "toggleContractActive",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_supplierproduceID",
            "type": "string"
          },
          {
            "name": "_photoHash",
            "type": "string"
          },
          {
            "name": "_geolocation",
            "type": "string"
          },
          {
            "name": "_harvestTimeStamp",
            "type": "string"
          },
          {
            "name": "_harvestID",
            "type": "string"
          }
        ],
        "name": "registerHarvestSubmission",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_growingCondtions",
            "type": "string"
          },
          {
            "name": "_harvestDescription",
            "type": "string"
          },
          {
            "name": "_harvestTableName",
            "type": "string"
          },
          {
            "name": "_harvestQuantity",
            "type": "string"
          },
          {
            "name": "_harvestUser",
            "type": "string"
          },
          {
            "name": "_harvestID",
            "type": "string"
          }
        ],
        "name": "registerHarvestSubmissionDetails",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getHarvestSubmissionsCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "harvest_id",
            "type": "string"
          }
        ],
        "name": "getHarvestSubmitterAddress",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "arrayIndex",
            "type": "uint256"
          }
        ],
        "name": "getHarvestLogIDByIndex",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "harvest_id",
            "type": "string"
          }
        ],
        "name": "getHarvestSubmission",
        "outputs": [
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "harvest_id",
            "type": "string"
          }
        ],
        "name": "getHarvestSubmissionDetail",
        "outputs": [
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "harvest_id",
            "type": "string"
          }
        ],
        "name": "checkHarvestSubmission",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_otherID",
            "type": "string"
          },
          {
            "name": "_storageTimeStamp",
            "type": "string"
          },
          {
            "name": "_storageDetail",
            "type": "string"
          },
          {
            "name": "_storageID",
            "type": "string"
          },
          {
            "name": "_harvestID",
            "type": "string"
          }
        ],
        "name": "registerStorageSubmission",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getStorageSubmissionsCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "storage_id",
            "type": "string"
          }
        ],
        "name": "getStorageSubmitterAddress",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "arrayIndex",
            "type": "uint256"
          }
        ],
        "name": "getStorageLogIDByIndex",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "storage_id",
            "type": "string"
          }
        ],
        "name": "getStorageSubmission",
        "outputs": [
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "storage_id",
            "type": "string"
          }
        ],
        "name": "checkStorageSubmission",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "checkContractIsRunning",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "destroy",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

    var FoodPrintProduceContractV2 = web3.eth.contract(foodPrintProduceContractABI).at(foodPrintProduceContractAddress);

    // call addHarvestToBlockchain() function on button click
    $(".addHarvestToBlockchainBtn").click(addHarvestToBlockchain);

    // call verifyHarvestEntry function on button click
    $("#verifyHarvestEntryBtn").click(verifyHarvestEntry);

    // call retrieveHarvestEntrySubmitAddress function on button click
    $("#retrieveHarvestEntrySubmitAddressBtn").click(retrieveHarvestEntrySubmitAddress);

   // trigger smart contract call to getProduceHarvestCount() function after clicking on Harvest count button
    $("#getProduceHarvestCountBtn").click(function (e) {
      e.preventDefault();
      getProduceHarvestCount();
    });

    // trigger smart contract call to destroyContract() function after clicking on Initiate Self Destruct button
    $("#destroyFoodProduceContractBtn").click(function (e) {
      e.preventDefault();
      destroyContract();
    });

    // trigger smart contract call to toggleContractStatus() function after clicking on toggle contract status button
    $("toggleContractStatusBtn").click(function (e) {
      e.preventDefault();
      toggleContractStatus();
    });

    // trigger smart contract call to getContractStatus() function after clicking on check contract status button
    $("#getContractStatusBtn").click(function (e) {
      e.preventDefault();
      getContractStatus();
    });

    //function to handle error from smart contract call
    function handle_error(err) {
        console.log("function handle_error(err).");
       // var message_type = CONSTANTS.ERROR; //error or success
        var error_data = err.data;
        var message_description = "FoodPrint Produce smart contract call failed: " + err;
        if (typeof error_data !== 'undefined'){
            var error_message = error_data.message;
            if (typeof error_message !== 'undefined')
            {
                message_description = "FoodPrint Produce smart contract call failed: " + error_message;
            }
        }

        // TODO - trigger  notification
        return console.log(message_description);
    };

    //function to dispaly current ethereum account
    async function getCurrentEthereumAccount() {
        if (window.ethereum)
			try {
				await window.ethereum.enable();
			} catch (err) {
               // var message_type = CONSTANTS.ERROR; //error or success
                var message_description = "Access to your Ethereum account rejected.";

                //TODO - trigger notification
                return console.log(message_description);
			}

        if (typeof web3 === 'undefined'){
                return handle_web3_undefined_error();
            }

        var currentAccount = web3.eth.accounts[0];
        console.log("currentAccount " + currentAccount);

       //var currentEthereumAccountHtml = '<p> Current Ethereum Account: ' + currentAccount +'</p>';
        //$(CONSTANTS.CURRENT_ETHEREUM_ACCOUNT_DIV).html(currentEthereumAccountHtml);
    };

    var account = web3.currentProvider.selectedAddress

    //function to handle web 3 undefined error from smart contract call
    function handle_web3_undefined_error() {
        console.log("function handle_web3_undefined_error(err).");
       // var message_type = CONSTANTS.ERROR; //error or success
        var message_description = "Please install MetaMask to access the Ethereum Web3 injected API from your Web browser.";

        //TODO - trigger notification
        return console.log(message_description);
    };

    // function Add to Blockchain
    async function addHarvestToBlockchain() {

        // disable button wont work because it is actually a link
        // $("this").prop("disabled", true);

        //  disable link 
        $(this).addClass('disabled'); 

        // add spinner to button
        $(this).html(
            `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding to Blockchain...`
        );

		if (window.ethereum)
			try {
				await window.ethereum.enable();
			} catch (err) {
                var message_description = "Access to your Ethereum account rejected.";

                //TODO - trigger notification
                return console.log(message_description);
            }

            //harvest entry variables from selected record
            var harvest_logid = $(this).data('harvest_logid');
            var harvest_suppliershortcode = $(this).data('harvest_suppliershortcode'); 
            var harvest_suppliername = $(this).data('harvest_suppliername');
            var harvest_farmername = $(this).data('harvest_farmername');
            var harvest_supplieraddress = $(this).data('harvest_supplieraddress');
            var harvest_producename = $(this).data('harvest_producename');
            var harvest_photohash = $(this).data('harvest_photohash');
            var harvest_photoimage = harvest_photohash;
            var harvest_timestamp = $(this).data('harvest_timestamp');
            var harvest_capturetime = $(this).data('harvest_capturetime');
            var harvest_description = $(this).data('harvest_description');
            var harvest_geolocation = $(this).data('harvest_geolocation');
            var harvest_quantity = $(this).data('harvest_quantity');
            var harvest_unitofmeasure = $(this).data('harvest_unitofmeasure');
            var harvest_description_json = $(this).data('harvest_description_json'); //growing conditions
            var harvest_blockchainhashid = $(this).data('harvest_blockchainhashid');
            var harvest_blockchainhashdata = $(this).data('harvest_blockchainhashdata');
            var supplierproduce = $(this).data('supplierproduce');
            var harvest_bool_added_to_blockchain = $(this).data('harvest_bool_added_to_blockchain');
            var harvest_added_to_blockchain_date = $(this).data('harvest_added_to_blockchain_date');
            var harvest_added_to_blockchain_by = $(this).data('harvest_added_to_blockchain_by');
            var harvest_blockchain_uuid = $(this).data('harvest_blockchain_uuid');
            var harvest_user = $(this).data('harvest_user');
            var year_established = $(this).data('year_established');
            var covid19_response = $(this).data('covid19_response');
            var logdatetime = $(this).data('logdatetime');
            var lastmodifieddatetime = $(this).data('lastmodifieddatetime');

            var harvest_tablename = 'foodprint_harvest';
            var harvest_quantity_combined = harvest_quantity + "(" + harvest_unitofmeasure + ")";
      
            console.log("this harvest_logid - " + harvest_logid);    
            
        //let farmer_details = '{HarvestDescription:"Leafy Veg", HarvestGrowingConditions:"Organic",SupplierID:OZCF}';
       let photoHash = sha256(harvest_photohash);
        console.log("harvest_photohash successfully hashed (hash value " + photoHash + ").");

        if (typeof web3 === 'undefined'){
            return handle_web3_undefined_error();
        }

        // solidityContext required if you use msg object in contract function e.g. msg.sender
        // var solidityContext = {from: web3.eth.accounts[1], gas:3000000}; //add gas to avoid out of gas exception

        // FoodPrint Produce contract 
        // registerHarvestSubmission(string calldata _supplierproduceID, 
        //     string calldata _photoHash,  string calldata _geolocation, 
        //     string calldata _harvestTimeStamp, 
        //     string calldata _harvestID)
       
        // registerHarvestSubmission(
        // supplierproduce,
        // harvest_photohash,
        // harvest_geolocation,
        // harvest_timestamp,
        // harvest_logid);

        console.log("Test before sumbit - supplierproduce: " + supplierproduce + ", photoHash: " +  photoHash +
                ", harvest_geolocation: " + harvest_geolocation  + ",harvest_timestamp: " + harvest_timestamp.toString() + ", harvest_logid:" + harvest_logid);

        //Load the contract schema from the abi and Instantiate the contract by address
        // at(): Create an instance of MyContract that represents your contract at a specific address.
        // deployed(): Create an instance of MyContract that represents the default address managed by FoodPrintProduceContractV2.
        // new(): Deploy a new version of this contract to the network, getting an instance of FoodPrintProduceContractV2 that represents the newly deployed instance.

        FoodPrintProduceContractV2.registerHarvestSubmission(supplierproduce, photoHash, harvest_geolocation, harvest_timestamp.toString(), harvest_logid,
            function(err, result) {
        if (err){
            console.log("Error Adding to Blockchain");
            $(this).html(
                `Error Adding to Blockchain`
            );
            return handle_error(err);
        } else {

          // function registerHarvestSubmissionDetails(string calldata _growingCondtions, string calldata _harvestDescription,
          //   string calldata _harvestTableName, string calldata _harvestQuantity, string calldata _harvestUser, 
          //    string calldata _harvestID)

          console.log("Test before sumbit - harvest_description_json: " + harvest_description_json + ", harvest_description: " +  harvest_description +
                ", harvest_tablename: " + harvest_tablename  + ",harvest_quantity_combined: " + harvest_quantity_combined + ",harvest_user:" + harvest_user + 
                ", harvest_logid:" + harvest_logid);

          FoodPrintProduceContractV2.registerHarvestSubmissionDetails(harvest_description_json, harvest_description, harvest_tablename, 
                                                                      harvest_quantity_combined, harvest_user, harvest_logid,
            function(err2, result) {
              if (err2){
                  console.log("Error Adding to Blockchain");
                  $(this).html(
                      `Error Adding to Blockchain`
                  );
                  return handle_error(err2);
            }
          });
        };

        var message_description = `Transaction submitted to Blockchain for processing (Upload Harvest Entry from ${supplierproduce} with Harvest ID  ${harvest_logid}). Check your Metamask for transaction update.`;

        //TODO - trigger notification
        console.log(message_description);
        });
    };
    

    //Watch for registeredHarvestEvent, returns  _harvestLogIDIndex, _harvestID and _harvestSubmissionBlockNumber
    var registeredHarvestEvent = FoodPrintProduceContractV2.registeredHarvestEvent();
    registeredHarvestEvent.watch(function(error, result){
        if (!error)
            {
                console.log("registeredHarvestEvent");
                // TODO - enable button?
                //$(addHarvestBtn).attr("disabled", true);

                // Remove spinner from button
                //$("spinner_addHarvestBtn").hide();

                //update text
                //$("addHarvestBtn").html(`Added to Blockchain`);

                // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
            } else {
                // Remove spinner from button
               // $("spinner_addHarvestBtn").hide();

                //update text
                //$("addHarvestBtn").html(`Error Adding to Blockchain`);
                console.log(error);

                // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
            }
    });

     //Watch for registeredHarvestDetailEvent, returns _harvestID and _harvestSubmissionBlockNumber
     var registeredHarvestDetailEvent = FoodPrintProduceContractV2.registeredHarvestDetailEvent();
     registeredHarvestEvent.watch(function(error, result){
         if (!error)
             {
                 console.log("registeredHarvestDetailEvent" + result);
                 // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
             } else {
                 console.log("registeredHarvestDetailEvent error" + error);
 
                 // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
             }
     });

    //check on blockchain  
    // function to verify Harvest entry exists 
    function verifyHarvestEntry() {
        if (typeof web3 === 'undefined'){
            return handle_web3_undefined_error();
        }

        FoodPrintProduceContractV2.getHarvestSubmission(harvest_logid, function(err, result) {
            if (err){
                return handle_error(err);
            }

            //result:
            // harvest_id,
            // harvestEntry.supplierproduceID,
            // harvestEntry.harvestTimeStamp,
            // harvestEntry.BlockNumber,
            // harvestMap[harvest_id].IsSet 1,

            // Output from the contract function call
            console.log("result: " + result);

            let contractIsSet = result[4].toNumber();

            console.log("contractIsSet: " + contractIsSet);
            console.log("result[0]: " + result[0]);
            console.log("(contractIsSet > 0): " + (contractIsSet > 0));

            // if the hash is not in the smart contracts harvestMap, then isSet will not be 1
            if (contractIsSet > 0) {
                let contract_harvest_id = result[0];
                let contract_harvestEntry_supplierproduceID = result[1];
                let contract_harvestEntry_harvestTimeStamp = result[2];
                let contract_harvestEntry_BlockNumber= result[3];
                // let displayDate = new Date(contractSubmissionBlocktime * 1000).toLocaleString();

               // var message_type = CONSTANTS.SUCCESS; //error or success
                var message_description =`Harvest Entry for ${contract_harvestEntry_supplierproduceID} with Harvest ID ${contract_harvest_id} is <b>valid</b>. Uploaded to FoodPrint Produce (Blockchain) on: ${contract_harvestEntry_harvestTimeStamp}.` +
                                            `BlockNumber ${contract_harvestEntry_BlockNumber}.`;

                // TODO - trigger notification
                //triggerNotificationOpen(CONSTANTS.NOTIFICATION_BAR_DIV, '"divverifyHarvestEntryAlert"', message_description, message_type);
                return console.log(message_description);
            }
            else
                var message_type = CONSTANTS.ERROR; //error or success
                var message_description =`Harvest Entry with Harvest ID ${harvest_logid} is <b>invalid</b>: not found in the FoodPrint Harvest Logbook (Blockchain).`;

                // TODO - trigger notification
                //triggerNotificationOpen(CONSTANTS.NOTIFICATION_BAR_DIV, '"divverifyHarvestEntryAlert"', message_description, message_type);
                return console.log(message_description);
            });
    };

    // function to retrieve a submitted Harvest Entry submitter address
    function retrieveHarvestEntrySubmitAddress() {
        FoodPrintProduceContractV2.getHarvestSubmitterAddress(harvest_logid, function(err, result) {
            if (err){
                return handle_error(err);
            }

            //result:
            // harvestSubmissionAddress 0x874950B8c006e6D166f015236623fCD0C0a7DC75,

            // Output from the contract function call
            console.log("result: " + result);

            if (result === '0x0000000000000000000000000000000000000000'){
                var message_type = CONSTANTS.ERROR; //error or success
                var message_description =`Harvest Entry with Harvest ID ${harvest_logid} is <b>invalid</b>: no corresponding submitter address found in the FoodPrint Produce (Blockchain).`;

                // TODO - trigger notification
                return console.log(message_description);
            }
            else {
                var message_type = CONSTANTS.SUCCESS; //error or success
                var message_description =`Harvest Entry with Harvest ID ${harvest_logid} is <b>valid</b>. Uploaded to FoodPrint Produce (Blockchain) by address : ${result}.`;

                // TODO - trigger notification
                return console.log(message_description);
            }
        });
    };

    // function to get count of Harvest entries that have been previously uploaded
    function getProduceHarvestCount() {
        if (typeof web3 === 'undefined'){
                return handle_web3_undefined_error();
            }

        FoodPrintProduceContractV2.getHarvestSubmissionsCount(function(err, result) {
            if (err){
                return handle_error(err);
            }

            let harvestSubmissionsCount = result.toNumber(); // Output from the contract function call

            console.log("getHarvestSubmissionsCount: " + harvestSubmissionsCount);
            var message_description = `Number of Harvest Entries: + ${harvestSubmissionsCount}`;

             // TODO - trigger notification
             return console.log(message_description);
        });
    };

  //Watch for registeredStorageEvent, returns uint _storageLogIDIndex,  string _storageID, _storageSubmissionBlockNumber
  var registeredStorageEvent = FoodPrintProduceContractV2.registeredStorageEvent();
  registeredStorageEvent.watch(function(error, result){
      if (!error)
          {
              console.log("registeredStorageEvent");
              // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
          } else {
              console.log("registeredStorageEvent Error" + error);

              // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
          }
  });


    // function to check FoodPrint Produce Contract Status - stopped or not stopped
    function getContractStatus() {
        if (typeof web3 === 'undefined'){
                return handle_web3_undefined_error();
            }

        FoodPrintProduceContractV2.checkContractIsRunning(function(err, result) {
            if (err){
                return handle_error(err);
            }

            console.log("Is FoodPrint Produce Contract currently stopped " + result);
        });
    };

    // function to toggle contract status between stopped and not stopped
    function toggleContractStatus() {
        if (typeof web3 === 'undefined'){
                return handle_web3_undefined_error();
            }

        FoodPrintProduceContractV2.checkContractIsRunning(function(err, result) {
            if (err) {
                return handle_error(err);
            };
            var original_contract_status = result;
            console.log("Is FoodPrint Produce Contract currently stopped before toggle: " + original_contract_status);

            FoodPrintProduceContractV2.toggleContractActive(function(err2, result2) {
                if (err2){
                    return handle_error(err2);
                };
                var new_contract_status = !original_contract_status;

                // TODO - trigger a custom notification 
                console.log("FoodPrint Produce Contract status toggled. Transaction submitted to Blockchain for processing");
            });
        });
    };

    // function to initiate FoodPrint Produce selfdestruct
    function destroyContract() {
        if (typeof web3 === 'undefined'){
                return handle_web3_undefined_error();
            }

        FoodPrintProduceContractV2.destroy(function(err, result) {
            if (err){
                return handle_error(err);
            }
            console.log("result: " + result);
            // TODO - trigger a custom notification 
            if (typeof result !== 'undefined')
            {
                console.log("Contract destroy initiated");
            }
        });
    };
});
