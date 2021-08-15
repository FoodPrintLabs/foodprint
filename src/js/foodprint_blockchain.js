// this script contains the integration logic for the FoodPrint application to interact with the
// productv2 solidity smart contract

// import MetaMaskOnboarding from '@metamask/onboarding' // TODO this requires prebundling of the foodprint_blockchain.js before including in html templates


const currentUrl = new URL(window.location.href)

// this function will be called when content in the DOM is loaded
const initialize = () => {
  // Basic Actions Section
  const onboardButton = document.querySelector(".enableBlockchainButton");
  const showAccount = document.querySelector(".showAccount");

  // Contract and Account Objects
  let accounts;
  let foodPrintProduceContractABI;
  let foodPrintProduceContractAddress;
  let FoodPrintProduceContractV2;


  //------MetaMask Functions------\\

  // function to check if MetaMask is connected
  const isMetaMaskConnected = () => accounts && accounts.length > 0;

  // function to see if the MetaMask extension is installed
  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window; // old school way was (typeof window.ethereum !== "undefined")
    console.log({ ethereum });
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  // Function when connect to wallet is clicked
  async function onClickConnect(e) {
    e.preventDefault();
    // old school way of checking if metamask is installed
    if (isMetaMaskInstalled()){
      console.log("MetaMask is installed!");
      try {
        /* Ask user permission to access his accounts, this will open the MetaMask UI
          "Connecting" or "logging in" to MetaMask effectively means "to access the user's Ethereum account(s)".
          You should only initiate a connection request in response to direct user action, such as clicking a button.
          You should always disable the "connect" button while the connection request is pending. You should never initiate a
          connection request on page load.*/
        accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        showAccount.innerHTML = account;
        console.log(account || "Not able to get accounts");
        console.log(isMetaMaskConnected());
        if (isMetaMaskConnected()) {
          console.log("Metamask is connected :)");
          onboardButton.innerText = 'Connected to MetaMask!';
          onboardButton.disabled = true;
          onboardButton.classList.add('disabled');
        }
      } catch (err) {
        const message_description = "Access to your Ethereum account rejected.";

        //TODO - trigger pop up notification
        return console.log(message_description);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  const MetaMaskClientCheck = () => {
    //Now we check to see if Metamask is installed
    if (!isMetaMaskInstalled()) {
      //If it isn't installed we ask the user to click to install it
      onboardButton.innerText = 'Click here to install MetaMask!';
      //When the button is clicked we call this function
      onboardButton.onclick =  window.open("https://metamask.io/download");
      //The button is now disabled
      onboardButton.disabled = true;
      onboardButton.classList.add('disabled');
    } else {
      if (isMetaMaskConnected()) {
        console.log("Metamask is connected :)");
        //The button is now disabled
        onboardButton.disabled = true;
        onboardButton.classList.add('disabled');
        onboardButton.innerText = 'Connected to MetaMask!';
        const account = accounts[0];
        showAccount.innerHTML = account;
        console.log(account || "Not able to get accounts");
      } else{
      //If MetaMask is installed we ask the user to connect to their wallet
      onboardButton.innerText = 'Connect to MetaMask Wallet';
      //When the button is clicked we call this function to connect the users MetaMask Wallet
      onboardButton.onclick = onClickConnect;
      //The button is now disabled
      onboardButton.disabled = true;
      }
    }
  };

  MetaMaskClientCheck();

  //------/MetaMask Functions------\\


  //------Contract Setup------\\
  // in order to create a contract instance, we need the contract address and its ABI
  // const foodPrintProduceContractAddress = '0xf12ec65861A8103af5B2F9B07e8F1790D391E832'; // Ethereum Rinkeby
  foodPrintProduceContractAddress = '0x650168110ADa1f089D443904c6759b7349576A0d'; // Matic Mumbai

  // The second is the Application Binary interface or the ABI of the contract code.
  // ABI is just a list of method signatures, return types, members etc of the contract in a defined JSON format.
  // This ABI is needed when you will call your contract from a real javascript client.
  foodPrintProduceContractABI = [
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "_harvestID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
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
          "internalType": "uint256",
          "name": "_harvestLogIDIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "_harvestID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
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
          "internalType": "uint256",
          "name": "_storageLogIDIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "_storageID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_storageSubmissionBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "registeredStorageEvent",
      "type": "event"
    },
    {
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "fallback"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "harvestAddressMap",
      "outputs": [
        {
          "internalType": "address",
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
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "harvestDetailMap",
      "outputs": [
        {
          "internalType": "string",
          "name": "harvestID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "growingCondtions",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "harvestDescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "harvestTableName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "harvestQuantity",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "harvestUser",
          "type": "string"
        },
        {
          "internalType": "uint256",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "harvestLogIDs",
      "outputs": [
        {
          "internalType": "string",
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
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "harvestMap",
      "outputs": [
        {
          "internalType": "string",
          "name": "harvestID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "supplierproduceID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "photoHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "geolocation",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "harvestTimeStamp",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "BlockNumber",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
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
      "inputs": [],
      "name": "isOwner",
      "outputs": [
        {
          "internalType": "bool",
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
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
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
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "storageAddressMap",
      "outputs": [
        {
          "internalType": "address",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "storageLogIDs",
      "outputs": [
        {
          "internalType": "string",
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
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "storageMap",
      "outputs": [
        {
          "internalType": "string",
          "name": "storageID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "harvestID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "otherID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "storageTimeStamp",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "storageDetail",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "BlockNumber",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
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
      "inputs": [
        {
          "internalType": "address",
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
      "constant": false,
      "inputs": [],
      "name": "toggleContractActive",
      "outputs": [
        {
          "internalType": "bool",
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
          "internalType": "string",
          "name": "_supplierproduceID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_photoHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_geolocation",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestTimeStamp",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestID",
          "type": "string"
        }
      ],
      "name": "registerHarvestSubmission",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
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
          "internalType": "string",
          "name": "_growingCondtions",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestDescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestTableName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestQuantity",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestUser",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestID",
          "type": "string"
        }
      ],
      "name": "registerHarvestSubmissionDetails",
      "outputs": [
        {
          "internalType": "uint256",
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
          "internalType": "uint256",
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
          "internalType": "string",
          "name": "harvest_id",
          "type": "string"
        }
      ],
      "name": "getHarvestSubmitterAddress",
      "outputs": [
        {
          "internalType": "address",
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
          "internalType": "uint256",
          "name": "arrayIndex",
          "type": "uint256"
        }
      ],
      "name": "getHarvestLogIDByIndex",
      "outputs": [
        {
          "internalType": "string",
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
          "internalType": "string",
          "name": "harvest_id",
          "type": "string"
        }
      ],
      "name": "getHarvestSubmission",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
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
          "internalType": "string",
          "name": "harvest_id",
          "type": "string"
        }
      ],
      "name": "getHarvestSubmissionDetail",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
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
          "internalType": "string",
          "name": "harvest_id",
          "type": "string"
        }
      ],
      "name": "checkHarvestSubmission",
      "outputs": [
        {
          "internalType": "bool",
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
          "internalType": "string",
          "name": "_otherID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_storageTimeStamp",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_storageDetail",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_storageID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_harvestID",
          "type": "string"
        }
      ],
      "name": "registerStorageSubmission",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
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
          "internalType": "uint256",
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
          "internalType": "string",
          "name": "storage_id",
          "type": "string"
        }
      ],
      "name": "getStorageSubmitterAddress",
      "outputs": [
        {
          "internalType": "address",
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
          "internalType": "uint256",
          "name": "arrayIndex",
          "type": "uint256"
        }
      ],
      "name": "getStorageLogIDByIndex",
      "outputs": [
        {
          "internalType": "string",
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
          "internalType": "string",
          "name": "storage_id",
          "type": "string"
        }
      ],
      "name": "getStorageSubmission",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
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
          "internalType": "string",
          "name": "storage_id",
          "type": "string"
        }
      ],
      "name": "checkStorageSubmission",
      "outputs": [
        {
          "internalType": "bool",
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
          "internalType": "bool",
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

  // The "any" network will allow spontaneous network changes
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

  provider.on("network", (newNetwork, oldNetwork) => {
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    if (oldNetwork) {
      window.location.reload();
    }
  });

  console.log({ provider });

  // The Metamask plugin also allows signing transactions to send ether and
  // pay to change state within the blockchain. For this, we need the account signer
  const signer = provider.getSigner();

  // the contract object
  // FoodPrintProduceContractV2 = web3.eth.contract(foodPrintProduceContractABI).at(foodPrintProduceContractAddress);
  FoodPrintProduceContractV2 = new ethers.Contract(
      foodPrintProduceContractAddress,
      foodPrintProduceContractABI,
      signer
  );

  //------/Contract Setup------\\

  //------UI Click Event Handlers------\\

  // trigger smart contract call to  addHarvestToBlockchain() function on UI button click
  $(".addHarvestToBlockchainBtn").click(addHarvestToBlockchain);

  // trigger smart contract call to addStorageToBlockchain() function on button click
  $(".addStorageToBlockchainBtn").click(addStorageToBlockchain);

  // trigger smart contract call to verifyHarvestEntry function on UI button click
  $("#verifyHarvestEntryBtn").click(function (e) {
    e.preventDefault();
    const data = {};
    data.harvest_logid = $('#search_harvest_id').val();
    verifyHarvestEntry(data);
  });

  // trigger smart contract call to verifyStorageEntry function on UI button click
  $("#verifyStorageEntryBtn").click(function (e) {
    e.preventDefault();
    const data = {};
    data.storage_logid = $('#search_storage_id').val();
    verifyStorageEntry(data);
  });

  // trigger smart contract call to retrieveHarvestEntrySubmitAddress function on UI button click
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
  $("#toggleContractStatusBtn").click(function (e) {
    e.preventDefault();
    toggleContractStatus();
  });

  // trigger smart contract call to getContractStatus() function after clicking on check contract status button
  $("#getContractStatusBtn").click(function (e) {
    e.preventDefault();
    getContractStatus();
  });

  //------/UI Click Event Handlers------\\

  //------Custom Error Handlers------\\

  //function to handle error from smart contract call
  function handle_error(err) {
    console.log("function handle_error(err).");
    const error_data = err.data;
    let message_description = "FoodPrint Produce smart contract call failed: " + err;
    if (typeof error_data !== 'undefined') {
      const error_message = error_data.message;
      if (typeof error_message !== 'undefined') {
        message_description = "FoodPrint Produce smart contract call failed: " + error_message;
      }
    }
    // TODO - trigger  notification
    return console.log(message_description);
  }

  //function to handle web 3 undefined error from smart contract call
  function handle_web3_undefined_error() {
    console.log("function handle_web3_undefined_error(err).");
    let  message_description = "Please install MetaMask to access the Ethereum Web3 injected API from your Web browser.";

    //TODO - trigger notification
    return console.log(message_description);
  }

  //------/Custom Error Handlers------\\

  //------Blockchain and Smart Contract Function Calls------\\

  // function Add to Blockchain
  async function addHarvestToBlockchain() {
    // disable button wont work because it is actually a link
    // $("this").prop("disabled", true);
    //  disable link
    $(this).addClass('disabled');
    // add spinner to button
    $(this).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 
        Adding to Blockchain...`);

    //harvest entry variables from selected record
    const harvest_logid = $(this).data('harvest_logid');
    const harvest_suppliershortcode = $(this).data('harvest_suppliershortcode');
    const harvest_suppliername = $(this).data('harvest_suppliername');
    const harvest_farmername = $(this).data('harvest_farmername');
    const harvest_supplieraddress = $(this).data('harvest_supplieraddress');
    const harvest_producename = $(this).data('harvest_producename');
    const harvest_photohash = $(this).data('harvest_photohash');
    const harvest_photoimage = harvest_photohash;
    const harvest_timestamp = $(this).data('harvest_timestamp');
    const harvest_capturetime = $(this).data('harvest_capturetime');
    const harvest_description = $(this).data('harvest_description');
    const harvest_geolocation = $(this).data('harvest_geolocation');
    const harvest_quantity = $(this).data('harvest_quantity');
    const harvest_unitofmeasure = $(this).data('harvest_unitofmeasure');
    const harvest_description_json = $(this).data('harvest_description_json'); //growing conditions
    const harvest_blockchainhashid = $(this).data('harvest_blockchainhashid');
    const harvest_blockchainhashdata = $(this).data('harvest_blockchainhashdata');
    const supplierproduce = $(this).data('supplierproduce');
    const harvest_bool_added_to_blockchain = $(this).data('harvest_bool_added_to_blockchain');
    const harvest_added_to_blockchain_date = $(this).data('harvest_added_to_blockchain_date');
    const harvest_added_to_blockchain_by = $(this).data('harvest_added_to_blockchain_by');
    const harvest_blockchain_uuid = $(this).data('harvest_blockchain_uuid');
    const harvest_user = $(this).data('harvest_user');
    const year_established = $(this).data('year_established');
    const covid19_response = $(this).data('covid19_response');
    const logdatetime = $(this).data('logdatetime');
    const lastmodifieddatetime = $(this).data('lastmodifieddatetime');
    const harvest_tablename = 'foodprint_harvest';
    const harvest_quantity_combined = harvest_quantity + "(" + harvest_unitofmeasure + ")";

    console.log("this harvest_logid - " + harvest_logid);

    //let farmer_details = '{HarvestDescription:"Leafy Veg", HarvestGrowingConditions:"Organic",SupplierID:OZCF}';
    let photoHash = sha256(harvest_photohash);
    console.log("harvest_photohash successfully hashed (hash value " + photoHash + ").");

    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }

    // solidityContext required if you use msg object in contract function e.g. msg.sender
    // const solidityContext = {from: web3.eth.accounts[1], gas:3000000}; //add gas to avoid out of gas exception

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

    console.log("Test before submit - supplierproduce: " + supplierproduce + ", photoHash: " + photoHash +
        ", harvest_geolocation: " + harvest_geolocation + ",harvest_timestamp: " + harvest_timestamp.toString() + ", harvest_logid:" + harvest_logid);

    try {
      const transaction = await FoodPrintProduceContractV2.registerHarvestSubmission(supplierproduce, photoHash,
          harvest_geolocation, harvest_timestamp.toString(), harvest_logid);
      const data = await transaction.wait();
      console.log("Result from registerHarvestSubmission: ", data);
      try {
        //submit corresponding HarvestSubmissionDetails
        console.log("Test before submit - harvest_description_json: " + harvest_description_json + ", harvest_description: " + harvest_description +
            ", harvest_tablename: " + harvest_tablename + ",harvest_quantity_combined: " + harvest_quantity_combined + ",harvest_user:" + harvest_user +
            ", harvest_logid:" + harvest_logid);
        const transaction2 = await FoodPrintProduceContractV2.registerHarvestSubmissionDetails(harvest_description_json, harvest_description, harvest_tablename,
            harvest_quantity_combined, harvest_user, harvest_logid)
        const data2 = await transaction2.wait();
        console.log("Result from HarvestSubmissionDetails: ", data2);

      } catch (err) {
        console.log("Error: ", err);
        console.log("Error Adding to Blockchain HarvestSubmissionDetails");
        $(this).html(
            `Error Adding to Blockchain`
        );
        return handle_error(err);
      }
      let message_description = `Transaction submitted to Blockchain for processing (Upload Harvest Entry 
      from ${supplierproduce} with Harvest ID  ${harvest_logid}). Check your Metamask for transaction update.`;
      //TODO - trigger notification
      console.log(message_description);
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error Adding to Blockchain HarvestSubmission");
      $(this).html(
          `Error Adding to Blockchain`
      );
      return handle_error(err);
    }
  }

  // function to verify Harvest entry exists on blockchain
  //TODO - Harvest detail
  async function verifyHarvestEntry(data) {
    //  disable link
    $(this).addClass('disabled');
    // add spinner to button
    $(this).html(`<span class="spinner-border spinner-border-sm" id="spinner_verifyHarvestEntryBtn" 
                role="status" aria-hidden="true"></span> Searching on Blockchain...`);

    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }

    const harvest_logid = data.harvest_logid;
    console.log("search_harvest_logid: " + harvest_logid);

    try {
      //getHarvestSubmission
      const result = await FoodPrintProduceContractV2.getHarvestSubmission(harvest_logid)
      console.log("Result from getHarvestSubmission: ", result);
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

      // if the Harvest Entry is not in the smart contracts harvestMap, then isSet will not be 1
      if (contractIsSet > 0) {
        let contract_harvest_id = result[0];
        let contract_harvestEntry_supplierproduceID = result[1];
        let contract_harvestEntry_harvestTimeStamp = result[2];
        let contract_harvestEntry_BlockNumber = result[3];
        // let displayDate = new Date(contractSubmissionBlocktime * 1000).toLocaleString();

        let message_description = `Harvest Entry for ${contract_harvestEntry_supplierproduceID} with Harvest ID ${contract_harvest_id} is <b>valid</b>. Uploaded to FoodPrint Produce (Blockchain) on: ${contract_harvestEntry_harvestTimeStamp}.` +
            `BlockNumber ${contract_harvestEntry_BlockNumber}.`;
        //trigger notification
        $("#search_result_harvest").html(message_description);
        //$("#search_result_harvest").css('display','block'); //display result - not working
        $("#search_result_harvest").removeAttr('style');//display result

        // Remove spinner from button
        $("#spinner_verifyHarvestEntryBtn").hide();
        $(this).html('Verify Harvest ID');
        $(this).removeClass("disabled");
        //$(this).html( `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Search on Blockchain...` );
        return console.log(message_description);
      } else{
        let message_description = `Harvest Entry with Harvest ID ${harvest_logid} is <b>invalid</b>: not found in the FoodPrint Harvest Logbook (Blockchain).`;

        // Remove spinner from button
        $("#spinner_verifyHarvestEntryBtn").hide();
        $(this).html('Verify Harvest ID');
        $(this).removeClass("disabled");

        //trigger notification
        $("#search_result_harvest").html(message_description);
        $("#search_result_harvest").removeAttr('style');//display result

        return console.log(message_description);
      }
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error reading from Blockchain getHarvestSubmission");
      $(this).html(`Error Reading from Blockchain`);
      return handle_error(err);
    }
  }

  // function to retrieve a submitted Harvest Entry submitter address
  async function retrieveHarvestEntrySubmitAddress() {
    try {
      //getHarvestSubmitterAddress
      const result = await FoodPrintProduceContractV2.getHarvestSubmitterAddress(harvest_logid)
      console.log("Result from getHarvestSubmitterAddress: ", result);
      //result:
      // harvestSubmissionAddress 0x874950B8c006e6D166f015236623fCD0C0a7DC75,

      if (result === '0x0000000000000000000000000000000000000000') {
        let message_description = `Harvest Entry with Harvest ID ${harvest_logid} is <b>invalid</b>: no corresponding submitter address found in the FoodPrint Produce (Blockchain).`;

        // TODO - trigger notification
        return console.log(message_description);
      } else {
        let message_description = `Harvest Entry with Harvest ID ${harvest_logid} is <b>valid</b>. Uploaded to FoodPrint Produce (Blockchain) by address : ${result}.`;
        // TODO - trigger notification
        return console.log(message_description);
      }
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error reading from Blockchain getHarvestSubmitterAddress");
      $(this).html(
          `Error reading from Blockchain`
      );
      return handle_error(err);
    }
  }

  // function to get count of Harvest entries that have been previously uploaded
 async function getProduceHarvestCount() {
    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }

   try {
     //getHarvestSubmissionsCount
     const result = await FoodPrintProduceContractV2.getHarvestSubmissionsCount()
     console.log("Result from getHarvestSubmissionsCount: ", result);
     let harvestSubmissionsCount = result.toNumber(); // Output from the contract function call
     console.log("getHarvestSubmissionsCount: " + harvestSubmissionsCount);
     let message_description = `Number of Harvest Entries: + ${harvestSubmissionsCount}`;
     // TODO - trigger notification
     return console.log(message_description);
   } catch (err) {
     console.log("Error: ", err);
     console.log("Error reading from Blockchain getHarvestSubmissionsCount");
     $(this).html(
         `Error reading fromBlockchain`
     );
     return handle_error(err);
   }
  }

  // function Add Storage Entry to Blockchain
  //TODO - should only be able to add Storage to Blockchain if there is a corresponding Harvest ID already on Blockchain
 async function addStorageToBlockchain() {
    // disable button wont work because it is actually a link
    // $("this").prop("disabled", true);
    //  disable link
    $(this).addClass('disabled');
    // add spinner to button
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding to Blockchain...`
    );
    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }

    //storage entry variables from selected record
    const harvest_logid = $(this).data('harvest_logid');
    const storage_logid = $(this).data('storage_logid');
    const harvest_suppliershortcode = $(this).data('harvest_suppliershortcode');
    const supplierproduce = $(this).data('supplierproduce');
    const market_Shortcode = $(this).data('market_shortcode');
    const market_Name = $(this).data('market_name');
    const market_Address = $(this).data('market_address');
    const market_quantity = $(this).data('market_quantity');
    const market_unitOfMeasure = $(this).data('market_unitofmeasure');
    const market_storageTimeStamp = $(this).data('market_storagetimestamp');
    const market_storageCaptureTime = $(this).data('market_storagecapturetime');
    const market_URL = $(this).data('market_url');
    const storage_BlockchainHashID = $(this).data('storage_blockchainhashid');
    const storage_BlockchainHashData = $(this).data('storage_blockchainhashdata');
    const storage_Description = $(this).data('storage_description');
    const storage_bool_added_to_blockchain = $(this).data('storage_bool_added_to_blockchain');
    const storage_added_to_blockchain_date = $(this).data('storage_added_to_blockchain_date');
    const storage_added_to_blockchain_by = $(this).data('storage_added_to_blockchain_by');
    const storage_blockchain_uuid = $(this).data('storage_blockchain_uuid');
    const storage_user = $(this).data('storage_user');
    const logdatetime = $(this).data('logdatetime');
    const lastmodifieddatetime = $(this).data('lastmodifieddatetime');
    const storage_tablename = 'foodprint_storage';
    const storage_quantity_combined = market_quantity + "(" + market_unitOfMeasure + ")";

    console.log("this harvest_logid - " + harvest_logid);
    console.log("this storage_logid - " + storage_logid);

    let storageDetail = `{storageDescription:${storage_Description}, storageTableName:${storage_tablename}, 
    storageUser:${storage_user}, storageQuantity:${storage_quantity_combined}}`;
    let otherID = `{supplierproduceID:${supplierproduce}, marketID:${market_Shortcode}}`;

    //TODO - similar implementation for timestamps

    console.log("this storageDetail - " + storageDetail);
    console.log("this otherID - " + otherID);

    // solidityContext required if you use msg object in contract function e.g. msg.sender
    // const solidityContext = {from: web3.eth.accounts[1], gas:3000000}; //add gas to avoid out of gas exception

    // FoodPrint Produce contract
    // registerStorageSubmission (string calldata _otherID, string calldata _storageTimeStamp,  string calldata _storageDetail, string calldata _storageID, string calldata _harvestID)

    // registerStorageSubmission(
    // otherID,
    // market_storageTimeStamp,
    // storageDetail,
    // storage_logid,
    // harvest_logid);

    console.log("Test before submit - otherID: " + otherID + ", market_storageTimeStamp: " + market_storageTimeStamp +
        ", storageDetail: " + storageDetail + ",storage_logid: " + storage_logid + ", harvest_logid:" + harvest_logid);

    try {
      //submit registerStorageSubmission
      const transaction = await FoodPrintProduceContractV2.registerStorageSubmission(otherID, market_storageTimeStamp,
          storageDetail, storage_logid, harvest_logid);
      const result = await transaction.wait();
      console.log("Result from registerStorageSubmission: ", result);
      let message_description = `Transaction submitted to Blockchain for processing (Upload Storage Entry from ${supplierproduce} with Harvest ID ${harvest_logid} and Storage ID ${storage_logid}). Check your Metamask for transaction update.`;
      //TODO - trigger notification
      console.log(message_description);
      return;
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error Adding Storage to Blockchain registerStorageSubmission");
      $(this).html(
          `Error Adding Storage to Blockchain`
      );
      return handle_error(err);
    }
  }

  // function to verify Harvest entry exists on blockchain
 async function verifyStorageEntry(data) {
    //  disable link 
    $(this).addClass('disabled');
    // add spinner to button
    $(this).html(`<span class="spinner-border spinner-border-sm" id="spinner_verifyStorageEntryBtn" role="status" 
                aria-hidden="true"></span> Searching on Blockchain...`);
    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }
    const storage_logid = data.storage_logid;
    console.log("search_storage_logid: " + storage_logid);
    try {
      //getStorageSubmission
      const result = await FoodPrintProduceContractV2.getStorageSubmission(storage_logid)
      console.log("Result from getStorageSubmission: ", result);

      //result:
      //storageEntry.storageID,
      //storageEntry.harvestID,
      //storageEntry.otherID,
      //storageEntry.storageDetail,
      //storageEntry.BlockNumber,
      //storageEntry.IsSet

      // Output from the contract function call
      console.log("result: " + result);
      let contractIsSet = result[5].toNumber();
      console.log("contractIsSet: " + contractIsSet);
      console.log("result[0]: " + result[0]);
      console.log("(contractIsSet > 0): " + (contractIsSet > 0));

      // if the Storage Entry is not in the smart contracts storageMap, then isSet will not be 1
      if (contractIsSet > 0) {
        let contract_storage_id = result[0];
        let contract_harvest_id = result[1];
        let contract_otherID = result[2];
        let contract_storageDetail = result[3];
        let contract_storageEntry_BlockNumber = result[4];

        let message_description = `Storage Entry with Storage ID ${contract_storage_id} and Harvest ID ${contract_harvest_id} is <b>valid</b>. This corresponds to ${contract_otherID}. Additional details from 
                                      FoodPrint Produce (Blockchain) include: ${contract_storageDetail}.` +
            `BlockNumber ${contract_storageEntry_BlockNumber}.`;
        //trigger notification
        $("#search_result_storage").html(message_description);
        $("#search_result_storage").removeAttr('style');//display result
        // $('#search_result_storage').css('display','none'); //hide result

        // Remove spinner from button
        $("#spinner_verifyStorageEntryBtn").hide();
        $(this).html('Verify Storage ID');
        $(this).removeClass("disabled");
        //$(this).html( `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Search on Blockchain...` );
        return console.log(message_description);
      } else{
        let message_description = `Storage Entry with Storage ID ${contract_storage_id} is <b>invalid</b>: not found in the FoodPrint Storage Logbook (Blockchain).`;

        // Remove spinner from button
        $("#spinner_verifyStorageEntryBtn").hide();
        $(this).html('Verify Storage ID');
        $(this).removeClass("disabled");

        //trigger notification
        $("#search_result_storage").html(message_description);
        $("#search_result_storage").removeAttr('style');//display result

        return console.log(message_description);
      }
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error reading from Blockchain getStorageSubmission");
      $(this).html("Error Reading from Blockchain");
      return handle_error(err);
    }
  }

  // function to check FoodPrint Produce Contract Status - stopped or not stopped
 async function getContractStatus() {
    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }

    try {
      //checkContractIsRunning
      const result = await FoodPrintProduceContractV2.checkContractIsRunning()
      console.log("Result from checkContractIsRunning: ", result);
      console.log("Is FoodPrint Produce Contract currently stopped " + result);
      return
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error reading from Blockchain checkContractIsRunning");
      $(this).html(`Error Reading from Blockchain`);
      return handle_error(err);
    }
  }

  // function to toggle contract status between stopped and not stopped
 async function toggleContractStatus() {
    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }
    try {
      //checkContractIsRunning
      const result = await FoodPrintProduceContractV2.checkContractIsRunning()
      console.log("Result from checkContractIsRunning: ", result);
      const original_contract_status = result;
      console.log("Is FoodPrint Produce Contract currently stopped before toggle: " + original_contract_status);

      try {
        //toggleContractActive
        const transaction2 = await FoodPrintProduceContractV2.toggleContractActive()
        const result2 = await transaction2.wait();
        console.log("Result from toggleContractActive: ", result2);
        const new_contract_status = !original_contract_status;

        // TODO - trigger a custom notification
        console.log("FoodPrint Produce Contract status toggled. Transaction submitted to Blockchain for processing");

      } catch (err) {
        console.log("Error: ", err);
        console.log("Error writing to Blockchain toggleContractActive");
        $(this).html(
            `Error writing to Blockchain`
        );
        return handle_error(err);
      }
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error reading from Blockchain checkContractIsRunning");
      $(this).html(
          `Error Reading from Blockchain`
      );
      return handle_error(err);
    }
  }

  // function to initiate FoodPrint Produce selfdestruct
 async function destroyContract() {
    if (typeof web3 === 'undefined') {
      return handle_web3_undefined_error();
    }

    try {
      //destroy
      const transaction = await FoodPrintProduceContractV2.destroy()
      const result = await transaction.wait();
      console.log("Result from destroy: ", result);
      if (typeof result !== 'undefined') {
        console.log("Contract destroy initiated");
      }
    } catch (err) {
      console.log("Error: ", err);
      console.log("Error writing to Blockchain destroy");
      $(this).html(
          `Error writing Blockchain`
      );
      return handle_error(err);
    }
  }

  //------/Blockchain and Smart Contract Function Calls------\\

  //------Watch for Blockchain and Smart Contract Events------\\

  //Watch for registeredHarvestEvent, returns  _harvestLogIDIndex, _harvestID and _harvestSubmissionBlockNumber
  FoodPrintProduceContractV2.on('registeredHarvestEvent', (harvestLogIDIndex, harvestID, harvestSubmissionBlockNumber, event) => {
    console.log("registeredHarvestEvent");
    console.log('First parameter harvestLogIDIndex:', harvestLogIDIndex);
    console.log('Second parameter harvestID:', harvestID);
    console.log('Third parameter harvestSubmissionBlockNumber:', harvestSubmissionBlockNumber);
    console.log('Event : ', event);  //Event object
    updateHarvestAddBlockchainBtn(harvestID) //Update UI Button to stop spinning
    // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
  });

  //Watch for registeredHarvestDetailEvent, returns  _harvestID and _harvestSubmissionBlockNumber
  FoodPrintProduceContractV2.on('registeredHarvestDetailEvent', (harvestID, harvestSubmissionBlockNumber, event) => {
    console.log("registeredHarvestDetailEvent");
    console.log('First parameter harvestID:', harvestID);
    console.log('Second parameter harvestSubmissionBlockNumber:', harvestSubmissionBlockNumber);
    console.log('Event : ', event);  //Event object
    // TODO - if not error
    // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
  });

  //Watch for registeredStorageEvent, returns  returns uint _storageLogIDIndex,  string _storageID, _storageSubmissionBlockNumber
  FoodPrintProduceContractV2.on('registeredStorageEvent', (storageLogIDIndex, storageID, storageSubmissionBlockNumber, event) => {
    console.log("registeredStorageEvent");
    console.log('First parameter storageLogIDIndex:', storageLogIDIndex);
    console.log('Second parameter storageID:', storageID);
    console.log('Third parameter storageSubmissionBlockNumber:', storageSubmissionBlockNumber);
    console.log('Event : ', event);  //Event object
    updateStorageAddBlockchainBtn(storageID) //Update UI Button to stop spinning
    // TODO - Update status in DB via ajax post then update UI button, maybe ID button should include harvestid in its ID
  });

  //------/Watch for Blockchain and Smart Contract Events------\\

  //------AJAX Calls------\\
  function updateHarvestAddBlockchainBtn(harvest_logid) {
    const addToBlockchainBtnID = "#harvest_add_blockchain_" + harvest_logid
    const addToBlockchainBtn = $(addToBlockchainBtnID)
    console.log(addToBlockchainBtn)

    // remove spinner from button
    addToBlockchainBtn.removeClass("spinner-border");
    addToBlockchainBtn.removeClass("spinner-spinner-border-sm");
    addToBlockchainBtn.html('Added to Blockchain...');
    console.log("updateHarvestAddBlockchainBtn updated for Harvest " + harvest_logid);
  }

  function updateStorageAddBlockchainBtn(storage_logid) {
    const addToBlockchainBtnID = "#storage_add_blockchain_" + storage_logid
    // let btn = $('[data-storage_logid="21596a22-03be-4a56-8aec-0e370b6236eb"]') // returns all 4 buttons

    //let btn = $('#storage_add_blockchain_cab9949a-cb4b-4173-9ac8-d9336991acfa')
    const addToBlockchainBtn = $(addToBlockchainBtnID)
    console.log(addToBlockchainBtn)

    // remove spinner from button
    addToBlockchainBtn.removeClass("spinner-border");
    addToBlockchainBtn.removeClass("spinner-spinner-border-sm");
    addToBlockchainBtn.html('Added to Blockchain...');
    console.log("updateStorageAddBlockchainBtn updated for Storage " + storage_logid);
  }

      //TODO updateHarvestDB and updateStorageDB
  function updateHarvestDB(harvest_logid) {
    alert("Insert " + harvest_logid);
    $.ajax({
      url: '/updateharvestblockchain',
      data: JSON.stringify(data),
      processData: false,
      type: 'POST',
      contentType: 'application/json'
    }).done(function(res) {
      if (res.success) {
        //reload page or grey out add to blockchain - button
      } else {
        //console log failed to update harvest db blockchain to true
      }
    });
    alert("Insert done")
  }
  //------/AJAX Calls------\\

};

// As soon as the content in the DOM is loaded we are calling our initialize function
window.addEventListener("DOMContentLoaded", initialize);
