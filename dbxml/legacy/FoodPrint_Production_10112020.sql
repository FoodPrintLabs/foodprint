-- 10 November 2020
-- Julian K
-- dummy data for test_beetroot qr code 
INSERT INTO foodprint_weeklyview (
        logid,
        harvest_logid,
        harvest_supplierShortcode,
        harvest_supplierName, 
        harvest_farmerName,
        harvest_supplierAddress,
        harvest_produceName,
        harvest_photoHash,
        harvest_TimeStamp,
        harvest_CaptureTime,
        harvest_Description,
        harvest_geolocation,
        harvest_quantity,
        harvest_unitOfMeasure,
        harvest_description_json,
        harvest_BlockchainHashID,
        harvest_BlockchainHashData, 
        supplierproduce, -- e.g. WMPN_BabyMarrow
        storage_logid,
        market_Address,
        market_quantity,
        market_unitOfMeasure,
        market_storageTimeStamp,
        market_storageCaptureTime,
        market_URL,
        storage_BlockchainHashID,
        storage_BlockchainHashData,
        storage_Description,
        storage_bool_added_to_blockchain, -- true or false
        storage_added_to_blockchain_date, 
        storage_added_to_blockchain_by, -- user who logged storage to blockchain
        storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        harvest_bool_added_to_blockchain, -- true or false
        harvest_added_to_blockchain_date, 
        harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        harvest_user, -- user who logged harvest
        storage_user, -- user who logged storage
        logdatetime,
        lastmodifieddatetime,
        year_established,
        covid19_response
        )
VALUES ('test8c7c-9d4e-49dd-8b57-09e08df01234' -- logid
        ,'test51a0-e0e2-4b8f-8468-a00291ee1234' -- harvest_logid
        ,'TEST' -- harvest_supplierShortcode 
        ,'Fresh Produce Farm (TEST)' -- harvest_supplierName
        ,'Thuli Thuli (TEST)' -- harvest_farmerName
        ,'Durbanville, Western Cape, South Africa 7490' -- harvest_supplierAddress,
        ,'Beetroot' -- harvest_produceName,
        ,'PLACEHOLDER - Beetroot Photo' -- harvest_photoHash,
        ,'2020-11-09 06:00:00' -- harvest_TimeStamp,
        ,'2020-11-09 11:06:00' -- harvest_CaptureTime,
        ," Organic & pesticide free. After each harvest, vegetables are washed, prepared & stored in Cold-room at 10 degrees Celsius till delivery to ensure fresh produce to the market. [Organic, Pesticide free, Greenhouse]" -- harvest_Description,
        ,'Durbanville, Western Cape, South Africa 7490' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'units' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'yes', 'organic':'yes'}" -- harvest_description_json,
        ,'testf69a-e218-42d5-8441-3476acf5d5f5' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'Fresh Produce Farm', ...}" -- harvest_BlockchainHashData
        ,'TEST_Beetroot' -- supplierproduce, -- e.g. TEST_Beetroot
        ,'test77bb-8aa1-4a80-a79a-0ff9d3176afc' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' -- market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'units' -- market_unitOfMeasure,
        ,'2020-11-10 09:00:00' -- market_storageTimeStamp,
        ,'2020-11-10 10:06:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'testd1e9-b742-4dda-a491-4e8c74b2c24e' -- storage_BlockchainHashID,
        ,"{'market_Name':'Oranjezicht City Farm', ...}" -- storage_BlockchainHashData
        ,'PLACEHOLDER - storage_Description' -- storage_Description,
        ,'false' --  storage_bool_added_to_blockchain, 
        ,'-' -- storage_added_to_blockchain_date,
        ,'-' -- storage_added_to_blockchain_by, -- user who logged storage to blockchain
        ,'-' -- storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'false' -- harvest_bool_added_to_blockchain, -- true or false
        ,'-' -- harvest_added_to_blockchain_date, 
        ,'-' -- harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        ,'-' -- harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - harvest_user' -- harvest_user, -- user who logged harvest
        ,'PLACEHOLDER - storage_user' -- storage_user, -- user who logged storage
        ,'2020-11-10 11:00:00'
        ,'2020-11-10 11:00:00'
        ,'2020' -- Year established
        ,'Covid-19 protocols observed' -- covid19 response
        )

    --Bump out logdatetime for demo's
    --UPDATE foodprint_weeklyview
    --SET logdatetime = '2020-11-23 11:00:00'
    --WHERE logid = 'test8c7c-9d4e-49dd-8b57-09e08df01234';
