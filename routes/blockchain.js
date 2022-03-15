var express = require('express');
var router = express.Router();
const algosdk = require('algosdk');
var moment = require('moment'); //datetime
var crypto = require('crypto');
var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

//------Import account mnemonics------\\
var account1_mnemonic = process.env.ACCOUNT1_MNEMONIC;
var account2_mnemonic = process.env.ACCOUNT2_MNEMONIC; // account against which supply chain data is logged from web
// var account3_mnemonic = process.env.ACCOUNT3_MNEMONIC; // account against which supply chain data is logged from whatsapp

console.log('Account Mnemonic 1 from user = ' + account1_mnemonic);
console.log('Account Mnemonic 2 from user = ' + account2_mnemonic);

//------/Import account mnemonics------\\

//------Recover algorand accounts from mnemonic/secret phrase------\\

console.log('Now attempting to recover accounts using user supplied secret phrases...');

var recoveredAccount1 = algosdk.mnemonicToSecretKey(account1_mnemonic);
var isValid = algosdk.isValidAddress(recoveredAccount1.addr);
console.log('Account recovered: ' + isValid);
var account1 = recoveredAccount1.addr;
console.log('Account 1 = ' + account1);

var recoveredAccount2 = algosdk.mnemonicToSecretKey(account2_mnemonic);
var isValid = algosdk.isValidAddress(recoveredAccount2.addr);
console.log('Account recovered: ' + isValid);
var account2 = recoveredAccount2.addr;
console.log('Account 2 = ' + account2);

console.log('');

//------/Recover algorand accounts from mnemonic/secret phrase------\\

//------Helper to Wait for Confirmation of transaction------\\

/**
 * Wait until the transaction is confirmed or rejected, or until 'timeout'
 * number of rounds have passed.
 * @param {algosdk.Algodv2} algodClient the Algod V2 client
 * @param {string} txId the transaction ID to wait for
 * @param {number} timeout maximum number of rounds to wait
 * @return {Promise<*>} pending transaction information
 * @throws Throws an error if the transaction is not confirmed or rejected in the next timeout rounds
 */
const waitForConfirmation = async function (algodClient, txId, timeout) {
  if (algodClient == null || txId == null || timeout < 0) {
    throw new Error('Bad arguments');
  }

  const status = await algodClient.status().do();
  if (status === undefined) {
    throw new Error('Unable to get node status');
  }

  const startround = status['last-round'] + 1;
  let currentround = startround;

  while (currentround < startround + timeout) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingInfo !== undefined) {
      if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
        //Got the completed Transaction
        return pendingInfo;
      } else {
        if (pendingInfo['pool-error'] != null && pendingInfo['pool-error'].length > 0) {
          // If there was a pool error, then the transaction has been rejected!
          throw new Error(
            'Transaction ' + txId + ' rejected - pool error: ' + pendingInfo['pool-error']
          );
        }
      }
    }
    await algodClient.statusAfterBlock(currentround).do();
    currentround++;
  }

  throw new Error('Transaction ' + txId + ' not confirmed after ' + timeout + ' rounds!');
};

//------/Helper to Wait for Confirmation of transaction------\\

//------Setup algod connection------\\

console.log('Now setting up algod connection...');

// configure  algod client connection parameters i.e. connection to algo network (this can either be to sandbox or via a 3rd party service)

// this token is not the same as a digital asset, rather it is API Key (token): which is defined as an object. The token is used to
// identify the source of a connection / give you permission to access an algorand node. In the sandbox, the default token is aaa...
// Example use of token is when querying KMD for list of wallets, the first will work but the second has invalid key and fails
// $curl localhost:4002/v1/wallets -H "X-KMD-API-Token: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
// $curl localhost:4002/v1/wallets -H "X-KMD-API-Token: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaB"

// This is especially useful if you are connecting to the Algorand TestNet/BetaNet/MainNet via a 3rd party service i.e. a 3rd party node
// e.g. https://developer.purestake.io/ (in the Ethereum space, this would be infura.io)
// $curl -X GET "https://testnet-algorand.api.purestake.io/ps2/v2/status" -H "x-api-key: REPLACE_WITH_PURESTAKE_KEY"

const environment = process.env.BLOCKCHAINENV; // DEV, TESTNET or MAINNET
console.log('ENV currently set to ' + environment);

let token, server, port;

if (environment == 'TESTNET') {
  token = {
    'X-API-Key': process.env.TESTNET_ALGOD_API_KEY,
  };
  server = process.env.TESTNET_ALGOD_SERVER; // PureStake "https://testnet-algorand.api.purestake.io/ps2" or AlgoExplorer "https://api.testnet.algoexplorer.io",
  port = process.env.TESTNET_ALGOD_PORT;
} else if (environment == 'MAINNET') {
  //if MAINNET
  token = {
    'X-API-Key': process.env.MAINNET_ALGOD_API_KEY,
  };
  server = process.env.MAINNET_ALGOD_SERVER; // PureStake "https://testnet-algorand.api.purestake.io/ps2" or AlgoExplorer "https://api.testnet.algoexplorer.io",
  port = process.env.MAINNET_ALGOD_PORT;
} else {
  //if DEV
  token = process.env.DEV_ALGOD_API_KEY; // "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  server = process.env.DEV_ALGOD_SERVER; // "http://localhost";
  port = process.env.DEV_ALGOD_PORT;
}

// Instantiate the algod wrapper
let algodclient = new algosdk.Algodv2(token, server, port);

//------/Setup algod connection------\\

// Function to check algod status
router.get('/app/test/blockchain/algod', async function (req, res) {
  console.log('Now checking algod status...');
  (async () => {
    // call the status method from the algod client to check the details of your connection.
    let status = await algodclient.status().do();
    console.log('Algorand network status: %o', status);
    res.send({ 'Algorand network status': status });
  })().catch(e => {
    console.log(e);
    res.send({ 'Algorand network status check error': e });
  });
});

// route add harvest to Algorand Blockchain
router.post('/app/harvest/save/blockchain', async function (req, res) {
  console.log(
    'Now logging supply chain harvest data from %s to %s... ' +
      'Assumes source account has funds to pay fees',
    recoveredAccount1.addr,
    recoveredAccount2.addr
  );
  //If you use the async keyword before a function definition, you can then use await within the function.
  // When you await a promise, the function is paused in a non-blocking way until the promise settles.
  (async () => {
    let params = await algodclient.getTransactionParams().do();
    // see https://mumbai.polygonscan.com/tx/0xffbd57ca02f12666561b7789a09e29868f564b4344b8b319e74e0181658af40e vs
    // https://goalseeker.purestake.io/algorand/testnet/transaction/X2V5FXDKXOEOSI3JD7XJVZFSETFMG5KPK3KANIXAFRQJ2D3QDCZA

    console.log(req.body);
    // {
    //     logID: '48544b9e-4795-49f5-bb01-b2a1edb0ecfd',
    //         previouslogID: '',
    //     otherIdentifiers: '{sourceID:BGSM, buyerID:}',
    //     logDetail: '{description:FoodPrint Test, actionTimeStamp:Sun Aug 15 2021 02:43:00 GMT+0200 (South Africa Standard Time), logQuantity:123(bunch)}',
    //     logExtendedDetail: '{growingConditions:Pesticide Free,Certified Organic,Non-Certified Organic}',
    //     logMetadata: '{logUser:superuserjulz@example.comlogType:harvestlogTableName:foodprint_harvestharvestPhotoHash:34567}'
    //     }

    let supplyChainData = JSON.stringify(req.body);

    const enc = new TextEncoder();
    const note = enc.encode(supplyChainData);
    let txn = {
      from: recoveredAccount1.addr,
      to: recoveredAccount2.addr,
      // comment out the next line to use suggested fee
      fee: 1000, // transactions only cost 1/1000th of an Algo (0.001).
      amount: 0, // 0 algos
      firstRound: params.firstRound,
      lastRound: params.lastRound,
      genesisID: params.genesisID,
      genesisHash: params.genesisHash,
      note: note,
    };

    // sign transaction using private key
    let signedTxn = algosdk.signTransaction(txn, recoveredAccount1.sk);

    // submit the signed transaction to the network
    let sendTx = await algodclient.sendRawTransaction(signedTxn.blob).do();

    console.log('Transaction: ' + sendTx.txId);

    // Wait for confirmation
    let confirmedTxn = await waitForConfirmation(algodclient, sendTx.txId, 4);

    // get the completed transaction
    console.log(
      'Transaction ' + sendTx.txId + ' confirmed in round ' + confirmedTxn['confirmed-round']
    );

    var txnNote = new TextDecoder().decode(confirmedTxn.txn.txn.note);
    console.log('Note field: ', txnNote);

    console.log('Transaction Amount: %d microAlgos', confirmedTxn.txn.txn.amt);
    console.log('Transaction Fee: %d microAlgos', confirmedTxn.txn.txn.fee);

    // update database with blockchain transaction details etc
    updateHarvestBlockchainHash(req.body.logID, supplyChainData, req.user, sendTx.txId);

    res.status(201).send({
      success: true,
      message: 'Harvest entry added to Algorand blockchain',
      harvestLogid: req.body.logID,
      transactionId: sendTx.txId,
    });
  })().catch(e => {
    console.log(e);
    //throw err;
    res.status(400).send({ success: false, message: e.message });
  });
});

function updateHarvestBlockchainHash(logId, supplyChainData, user, transactionId) {
  let supplyChainDataHash = crypto.createHash('sha256').update(supplyChainData).digest('base64');

  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  // update database with blockchain transaction details etc
  let addToBlockchainUser = 'FoodPrint Service';
  if (user !== undefined) {
    addToBlockchainUser = user.email;
  }

  let data = {
    harvest_logid: logId,
    harvest_BlockchainHashID: supplyChainDataHash,
    harvest_BlockchainHashData: supplyChainData,
    harvest_added_to_blockchain_date: logdatetime,
    harvest_bool_added_to_blockchain: true,
    harvest_added_to_blockchain_by: addToBlockchainUser,
    harvest_blockchain_uuid: transactionId,
    blockchain_explorer_url:
      'https://goalseeker.purestake.io/algorand/testnet/transaction/' + transactionId,
  };
  try {
    models.FoodprintHarvest.update(data, {
      where: {
        harvest_logid: logId,
      },
    })
      .then(_ => {
        console.log(
          'Harvest logbook entry with logid ' +
            logId +
            ' updated with blockchain data for ' +
            'Algorand transaction ' +
            transactionId +
            '!'
        );
      })
      .catch(err => {
        //throw err;
        console.log(
          'Error - Update Harvest logbook entry logid ' +
            logId +
            ' with blockchain data failed ' +
            'for Algorand transaction ' +
            transactionId +
            '!'
        );
        console.log(err);
        return false;
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.log(
      'Harvest logbook entry with logid ' +
        logId +
        ' not updated with blockchain data for Algorand ' +
        'transaction ' +
        transactionId +
        '.'
    );
    console.log(e);
    return false;
  }
}

// route add storage to Algorand Blockchain
router.post('/app/storage/save/blockchain', async function (req, res) {
  console.log(
    'Now logging supply chain storage data from %s to %s... ' +
      'Assumes source account has funds to pay fees',
    recoveredAccount1.addr,
    recoveredAccount2.addr
  );
  (async () => {
    let params = await algodclient.getTransactionParams().do();
    // see https://mumbai.polygonscan.com/tx/0xffbd57ca02f12666561b7789a09e29868f564b4344b8b319e74e0181658af40e vs
    // https://goalseeker.purestake.io/algorand/testnet/transaction/5SEZYSNEARNC4QQXQVPEPUVTP3OI6UQXO3BEGEH2FOKPQ6UDGKPQ

    console.log(req.body);
    // {"logID":"231ac393-264a-4516-9e42-56b5f738deed","previouslogID":"","otherIdentifiers":
    // "{sourceID:OZCF, buyerID:}","logDetail":"{produce:Beetroot, description:Fresh beetroot,
    // actionTimeStamp:Thu Dec 30 2021 10:37:00 GMT+0200 (South Africa Standard Time), logQuantity:10(bunch)}",
    // "logExtendedDetail":"{growingConditions:Pesticide Free,Free Range,Greenhouse Grown}","logMetadata":
    // "{logUser:superuserjulz@example.com, logType:harvest, logTableName:foodprint_harvest,
    // harvestPhotoHash:7f21430912a08ced86bf43fcbcceddcdf74343ba80f72a625bff75fd710ede06}"}

    let supplyChainData = JSON.stringify(req.body);

    const enc = new TextEncoder();
    const note = enc.encode(supplyChainData);
    let txn = {
      from: recoveredAccount1.addr,
      to: recoveredAccount2.addr,
      fee: 1000, // transactions only cost 1/1000th of an Algo (0.001).
      amount: 0, // 0 algos
      firstRound: params.firstRound,
      lastRound: params.lastRound,
      genesisID: params.genesisID,
      genesisHash: params.genesisHash,
      note: note,
    };

    // sign transaction using private key
    let signedTxn = algosdk.signTransaction(txn, recoveredAccount1.sk);

    // submit the signed transaction to the network
    let sendTx = await algodclient.sendRawTransaction(signedTxn.blob).do();

    console.log('Transaction: ' + sendTx.txId);

    // Wait for confirmation
    let confirmedTxn = await waitForConfirmation(algodclient, sendTx.txId, 4);

    // get the completed transaction
    console.log(
      'Transaction ' + sendTx.txId + ' confirmed in round ' + confirmedTxn['confirmed-round']
    );

    var txnNote = new TextDecoder().decode(confirmedTxn.txn.txn.note);
    console.log('Note field: ', txnNote);

    console.log('Transaction Amount: %d microAlgos', confirmedTxn.txn.txn.amt);
    console.log('Transaction Fee: %d microAlgos', confirmedTxn.txn.txn.fee);

    // update database with blockchain transaction details etc
    updateStorageBlockchainHash(req.body.logID, supplyChainData, req.user, sendTx.txId);

    res.status(201).send({
      success: true,
      message: 'Storage entry added to Algorand blockchain',
      storageLogid: req.body.logID,
      transactionId: sendTx.txId,
    });
  })().catch(e => {
    console.log(e);
    //throw err;
    res.status(400).send({ success: false, message: e.message });
  });
});

function updateStorageBlockchainHash(logId, supplyChainData, user, transactionId) {
  let supplyChainDataHash = crypto.createHash('sha256').update(supplyChainData).digest('base64');

  let logdatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  //https://goalseeker.purestake.io/algorand/testnet/transaction/VWBBKI47MQAFYMCIF4BY565KVSFUIUPG23RNOTIKREX4FSXNCFJQ
  //{"logID":"253f65e1-2f39-44c8-a36d-5019c465b84d","previouslogID":"231ac393-264a-4516-9e42-56b5f738deed",
  // "otherIdentifiers":"{sourceID:OZCF, buyerID:OZCFM}","logDetail":
  // "{produce:OZCF_Beetroot, description:Fresh produce,
  // actionTimeStamp:Fri Dec 31 2021 10:42:00 GMT+0200 (South Africa Standard Time), logQuantity:10(bunch)}",
  // "logExtendedDetail":"{}","logMetadata":"{logUser:superuserjulz@example.com, logType:storage,
  // logTableName:foodprint_storage, storagePhotoHash:NaN"}

  let data = {
    storage_logid: logId,
    storage_BlockchainHashID: supplyChainDataHash,
    storage_BlockchainHashData: supplyChainData,
    storage_added_to_blockchain_date: logdatetime,
    storage_bool_added_to_blockchain: true,
    storage_added_to_blockchain_by: user.email,
    storage_blockchain_uuid: transactionId,
    blockchain_explorer_url:
      'https://goalseeker.purestake.io/algorand/testnet/transaction/' + transactionId,
  };
  try {
    models.FoodprintStorage.update(data, {
      where: {
        storage_logid: logId,
      },
    })
      .then(_ => {
        console.log(
          'Storage logbook entry with logid ' +
            logId +
            ' updated with blockchain data for ' +
            'Algorand transaction ' +
            transactionId +
            '!'
        );
      })
      .catch(err => {
        //throw err;
        console.log(
          'Error - Update Storage logbook entry with logid ' +
            logId +
            ' for Algorand transaction ' +
            transactionId +
            'failed!'
        );
        console.log(err);
        return false;
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.log(
      'Storage logbook entry with logid ' +
        logId +
        ' not updated for Algorand transaction ' +
        transactionId +
        '.'
    );
    console.log(e);
    return false;
  }
}

module.exports = router;
