const { Op, Sequelize } = require('sequelize');

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
var models = initModels(sequelise);
var moment = require('moment'); //datetime

const InsertProduce = async () => {
  const data = models.FoodprintWeeklyview.count({
    where: { logid: 'test8c7c-9d4e-49dd-8b57-09e08df01234' },
  }).then(count => {
    if (count !== 0) {
      console.log('TEST Weekly view already exists');
    } else {
      const insert = models.FoodprintWeeklyview.create({
        logid: 'test8c7c-9d4e-49dd-8b57-09e08df01234',
        harvest_logid: 'test51a0-e0e2-4b8f-8468-a00291ee1234',
        harvest_supplierShortcode: 'TEST',
        harvest_supplierName: 'Fresh Produce Farm (TEST)',
        harvest_farmerName: 'Thuli Thuli (TEST)',
        harvest_supplierAddress: 'Durbanville, Western Cape, South Africa 7490',
        harvest_produceName: 'Beetroot',
        harvest_photoHash: 'PLACEHOLDER - Beetroot Photo',
        harvest_TimeStamp: '2020-11-09 06:00:00',
        harvest_CaptureTime: '2020-11-09 11:06:00',
        harvest_Description:
          'Organic & pesticide free. After each harvest, vegetables are washed, prepared & stored in Cold-room at 10 degrees Celsius till delivery to ensure fresh produce to the market. [Organic, Pesticide free, Greenhouse]',
        harvest_geolocation: 'Durbanville, Western Cape, South Africa 7490',
        harvest_quantity: 'PLACEHOLDER - market_quantity',
        harvest_unitOfMeasure: 'units',
        harvest_description_json: "{'greenhouse':'yes', 'organic':'yes'}",
        harvest_BlockchainHashID: 'testf69a-e218-42d5-8441-3476acf5d5f5',
        harvest_BlockchainHashData: "{'harvest_supplierName':'Fresh Produce Farm', ...}",
        supplierproduce: 'TEST_Beetroot',
        storage_logid: 'test77bb-8aa1-4a80-a79a-0ff9d3176afc',
        market_Address: 'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051',
        market_quantity: 'PLACEHOLDER - market_quantity',
        market_unitOfMeasure: 'units',
        market_storageTimeStamp: '2020-11-10 09:00:00',
        market_storageCaptureTime: '2020-11-10 10:06:00',
        market_URL: 'PLACEHOLDER - market_URL',
        storage_BlockchainHashID: 'testd1e9-b742-4dda-a491-4e8c74b2c24e',
        storage_BlockchainHashData: "{'market_Name':'Oranjezicht City Farm', ...}",
        storage_Description: 'PLACEHOLDER - storage_Description',
        storage_bool_added_to_blockchain: 'false',
        storage_added_to_blockchain_date: '-',
        storage_added_to_blockchain_by: '-',
        storage_blockchain_uuid: '-',
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_date: '-',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: 'PLACEHOLDER - harvest_user',
        storage_user: 'PLACEHOLDER - storage_user',
        logdatetime: '2022-01-01 11:00:00',
        lastmodifieddatetime: '2020-11-10 11:00:00',
        year_established: '2020',
        covid19_response: 'Covid-19 protocols observed',
      }).then(() => console.log('TEST Farm to Fork data added'));
    }
  });
};

const updateLogDateTime = async () => {
  try {
    await sleep(5000);
    const result = await models.FoodprintWeeklyview.update(
      { logdatetime: moment().format('YYYY-MM-DD HH:mm:ss') /*current date and time*/ },
      {
        where: {
          logid: 'test8c7c-9d4e-49dd-8b57-09e08df01234',
        },
      }
    ).then(() => console.log('Updated logdatetime'));
  } catch (err) {
    console.log('Error Finding data');
  }
};

const createTable = async () => {
  models.FoodprintWeeklyview.sync();
};
//------A custom sleep function to call in an async function------\\

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const run = async () => {
  await createTable();
  await InsertProduce();
  await updateLogDateTime();
  await process.exit();
};

run();
