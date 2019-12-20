--  =============================================
-- Author:      Julian Kanjere
-- Create date: 18 November 2019
-- Description: Script to create Config tables


-- Config, Farm, Smart Contract,  TraceProduce, Produce, FarmUser, FarmProduce, Market, MarketUser,
-- Harvest (include hash column, added_to_blockchain, blockchain_date, blockchain_by, verifiable_on_blockchain.
--         write to DB then Add to Blockchain fxn which also stores the contract address and uses latest contract by default),
-- Storage (write to DB then Add to Blockchain fxn), Weekly View (choose market then display),
-- CheckInCount ( when scan check in QR - time, market, device type, unique id),
-- CheckInEmail, ScanQRCount
-- =============================================


-- user groups: superuser, admin, farmer, market, consumer
CREATE TABLE foodprint_usergroups (
        pk int NOT NULL AUTO_INCREMENT,
        logid varchar(255),
        groupname varchar(255),
        grouplabel varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_usergroups (
        logid ,
        groupname,
        grouplabel,
        logdatetime)
VALUES
  ('1', 'group.superuser',	'Super User',	'2019-11-18 09:25'),
  ('2', 'group.admin',	'Administrator',	'2019-11-18 09:25'),
  ('3', 'group.farmer',	'Farmer',	'2019-11-18 09:25'),
  ('4', 'group.market',	'Market',	'2019-11-18 09:25'),
  ('5', 'group.consumer',	'Consumer',	'2019-11-18 09:25');


-- track scans of qr codes
CREATE TABLE foodprint_qrcount (
        pk int NOT NULL AUTO_INCREMENT,
        logid varchar(255),
        qrid varchar(255),
        qrurl varchar(255),
        marketid varchar(255),
        request_host varchar(255), -- req.headers.host;
        request_origin varchar(255), -- req.headers.origin;
        request_useragent varchar(500), -- req.useragent from https://www.npmjs.com/package/express-useragent;
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_qrcount (
        logid ,
        qrid,
        qrurl,
        marketid,
        request_host,
        request_origin,
        request_useragent,
        logdatetime)
VALUES ('1', '1', 'http://www.foodprintapp.com/checkin/ozcf', 'OZCF',	'host',	'origin', 'useragent',	'2019-11-18 09:25');


-- manage qr codes
CREATE TABLE foodprint_qr (
        pk int NOT NULL AUTO_INCREMENT,
        qrid varchar(255),
        marketid varchar(255),
        qrname varchar(255),
        qrlabel varchar(255),
        qrurl varchar(255),
        qrcode varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_qr (
        qrid ,
        marketid,
        qrname,
        qrlabel,
        qrurl,
        qrcode,
        logdatetime)
VALUES ('1', 'OZCF',	'Check-in',	'Your journey starts here', 'http://www.foodprintapp.com/checkin/ozcf','qrcode',	'2019-11-18 09:25');


-- manage markets on platform
CREATE TABLE foodprint_market (
        pk int NOT NULL AUTO_INCREMENT,
        marketid varchar(255),
        marketname varchar(255),
        marketdescription varchar(750),
        marketcode varchar(255),
        marketemail varchar(255),
        marketphone varchar(255),
        marketcell varchar(255),
        marketlongitude varchar(255),
        marketlatitude varchar(255),
        marketaddress varchar(255),
        marketcity varchar(255),
        marketcountry varchar(255),
        markettimes varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_market (
        marketid ,
        marketname,
        marketdescription,
        marketcode,
        marketemail,
        marketphone,
        marketcell,
        marketlongitude,
        marketlatitude,
        marketaddress,
        marketcity,
        marketcountry,
        markettimes,
        logdatetime)
VALUES ('1', 'Oranjezicht City Farm Market',	'Held every Saturday, Sunday and Wednesday at the historic Granger Bay site of the V&A Waterfront, the OZCF Market is a community farmers-style market for independent local farmers and artisanal food producers. At the OZCF Market customers can do weekly food shopping (veg, fruit, bread, organic dairy, free-range eggs, honey, muesli etc), try out some delicious cooked and raw foods and be inspired about helping to build an alternative food system.  Additionally, customers can buy edible plants and seedlings, compost and gardening supplies and equipment.',
'OZCF',	'email', 'phone', 'cell', 'longitude', 'latitude', 'address', 'Cape Town', 'South Africa',
'Saturday 8.15am to 2pm, Sunday 9am to 3pm and Wednesday 4 to 8pm (all weather)', '2019-11-18 09:25');


-- users allocated to market
CREATE TABLE foodprint_marketuser (
        pk int NOT NULL AUTO_INCREMENT,
        marketid varchar(255),
        userid varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_marketuser (
        marketid ,
        userid,
        logdatetime)
VALUES ('OZCF',	'OZCF_User1',	'2019-11-18 09:25');


-- manage farms on platform
CREATE TABLE foodprint_farm (
        pk int NOT NULL AUTO_INCREMENT,
        farmid varchar(255),
        farmname varchar(255),
        farmdescription varchar(750),
        farmcode varchar(255),
        farmemail varchar(255),
        farmphone varchar(255),
        farmcell varchar(255),
        farmlongitude varchar(255),
        farmlatitude varchar(255),
        farmaddress varchar(255),
        farmcity varchar(255),
        farmcountry varchar(255),
        farmtimes varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_farm (
        farmid ,
        farmname,
        farmdescription,
        farmcode,
        farmemail,
        farmphone,
        farmcell,
        farmlongitude,
        farmlatitude,
        farmaddress,
        farmcity,
        farmcountry,
        farmtimes,
        logdatetime)
VALUES ('1', 'Oranjezicht City Farm',	'The Oranjezicht City Farm (OZCF) is a non-profit project celebrating local food, culture and community through urban farming in Cape Town. It is located next to the corner of Sidmouth Avenue and Upper Orange Street, Oranjezicht, adjacent to Homestead Park.',
'OZCF',	'email', 'phone', 'cell', 'longitude', 'latitude', 'address', 'Cape Town', 'South Africa',
'The Farm is open weekdays from 08h00 to 16h00 and Saturdays from 08h00 to 13h00 (closed on Sundays). If you want to wander around on your own, you are very welcome.',
 '2019-11-18 09:25');


-- manage produce
CREATE TABLE foodprint_farmproduce (
        pk int NOT NULL AUTO_INCREMENT,
        produceid varchar(255),
        producename varchar(255),
        producedescription varchar(255),
        producepicture varchar(255),
        farmid varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_farmproduce (
        produceid ,
        producename,
        producedescription,
        producepicture,
        farmid,
        logdatetime)
VALUES ('1', 'Yellow Tomatoes',	'ProduceDescription',	'img/fruitCatalogue/yellowtomatoes.jpg', 'Rosenhof Farm',	'2019-11-18 09:25');


-- users allocated to farms
CREATE TABLE foodprint_farmuser (
        pk int NOT NULL AUTO_INCREMENT,
        farmid varchar(255),
        userid varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_farmuser (
        farmid ,
        userid,
        logdatetime)
VALUES ('OZCF',	'Farm_User1',	'2019-11-18 09:25');


-- produce master data e.g. orange then farmproduce can be cara cara orange
CREATE TABLE foodprint_produce (
        pk int NOT NULL AUTO_INCREMENT,
        produceid varchar(255),
        producename varchar(255),
        producedescription varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_produce (
        produceid ,
        producename,
        producedescription,
        logdatetime)
VALUES ('1',	'orange',	'fruit',	'2019-11-18 09:25');


-- version control of deployed smart contracts
CREATE TABLE foodprint_smartcontract (
        pk int NOT NULL AUTO_INCREMENT,
        contract_name varchar(255),
        contract_description varchar(255),
        contract_address varchar(255),
        dlt_type varchar(255),
        dlt_network varchar(255),
        deploydatetime DATETIME,
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_smartcontract (
        contract_name ,
        contract_description,
        contract_address,
        dlt_type,
        dlt_network,
        deploydatetime,
        logdatetime)
VALUES ('FoodPrint v1', 'Produce and Harvest stored in DB and Blockchain',	'address', 'Blockchain',
	    'kovan', '2019-08-18 09:25',	'2019-11-18 09:25');


-- catch all key:value configuration
CREATE TABLE foodprint_config (
        pk int NOT NULL AUTO_INCREMENT,
        configid varchar(255),
        configname varchar(255),
        configdescription varchar(255),
        configvalue varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_config (
        configid ,
        configname,
        configdescription,
        configvalue,
        logdatetime)
VALUES ('1', 'testemail',	'override email',	'test@afriwebhub.co.za',	'2019-11-18 09:25');


-- manage subscriptions to market after user check-in
CREATE TABLE market_subscription (
        pk int NOT NULL AUTO_INCREMENT,
        market_id varchar(255),
        firstname varchar(255),
        surname varchar(255),
        email varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO market_subscription (
        market_id ,
        firstname,
        surname,
        email,
      logdatetime)
VALUES ('OZCF', '',	'',	'test@afriwebhub.co.za',	'2019-11-16 09:25');


-- subscription to FoodPrint via home page
CREATE TABLE foodprint_subscription (
        pk int NOT NULL AUTO_INCREMENT,
        firstname varchar(255),
        surname varchar(255),
        email varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_subscription (
        firstname,
        surname,
        email,
        logdatetime)
VALUES ('TestName',	'TestSurname',	'test@afriwebhub.co.za',	'2019-11-18 09:25');

-- weeklyview which is a somewhat denomarlized combination of harvest and storage
-- weeklyview should only be created once market has ordered produce or recieved produce from farmer (i.e. harvest)
CREATE TABLE foodprint_weeklyview (
        pk int NOT NULL AUTO_INCREMENT,
        logid varchar(255),
        harvest_logid varchar(255),
        harvest_supplierShortcode varchar(255), -- farm shortcode
        harvest_supplierName varchar(255), -- farm name
        harvest_farmerName varchar(255), -- farmer name
        harvest_supplierAddress varchar(255),
        harvest_produceName varchar(255), -- produce name e.g. Baby Marrow, Radish
        harvest_photoHash varchar(255),
        harvest_TimeStamp varchar(255),
        harvest_CaptureTime varchar(255),
        harvest_Description varchar(1000), -- details about greenhouse etc
        harvest_geolocation varchar(255),
        harvest_quantity varchar(255),
        harvest_unitOfMeasure varchar(255),
        harvest_description_json varchar(1000), -- JSON with description e.g. {'greenhouse':'yes', 'organic':'yes', ...}
        harvest_BlockchainHashID varchar(255),
        harvest_BlockchainHashData varchar(2000), -- JSON with column value pairs e.g. {'harvest_supplierName':'White Mountain Natural Produce', ...}
        supplierproduce varchar(255), -- e.g. WMPN_BabyMarrow
        storage_logid varchar(255),
        market_Shortcode varchar(255),
        market_Name varchar(255),
        market_Address varchar(255),
        market_quantity varchar(255),
        market_unitOfMeasure varchar(255),
        market_storageTimeStamp varchar(255),
        market_storageCaptureTime varchar(255),
        market_URL varchar(255),
        storage_BlockchainHashID varchar(255),
        storage_BlockchainHashData varchar(2000), -- JSON with column value pairs e.g. {'market_Name':'Oranjezicht City Farm', ...}
        storage_Description varchar(255),
        storage_bool_added_to_blockchain varchar(255), -- true or false
        storage_added_to_blockchain_date varchar(255),
        storage_added_to_blockchain_by varchar(255), -- user who logged storage to blockchain
        storage_blockchain_uuid varchar(255), -- uuid to blockchain config record which has contract and address
        harvest_bool_added_to_blockchain varchar(255), -- true or false
        harvest_added_to_blockchain_date varchar(255), 
        harvest_added_to_blockchain_by varchar(255), -- user who logged harvest to blockchain
        harvest_blockchain_uuid varchar(255), -- uuid to blockchain config record which has contract and address
        harvest_user varchar(255), -- user who logged harvest
        storage_user varchar(255), -- user who logged storage
        logdatetime DATETIME,
        lastmodifieddatetime DATETIME,
        PRIMARY KEY (pk)
);

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
        lastmodifieddatetime
        )
VALUES ('486819ac-4b99-457f-bfad-7251a0394535' -- logid
        ,'2e3f2070-5f5c-48bd-a5eb-f4121729bf7d' -- harvest_logid
        ,'WMPN' -- harvest_supplierShortcode 
        ,'White Mountain Natural Produce' -- harvest_supplierName
        ,'François Malan' -- harvest_farmerName
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_supplierAddress,
        ,'Baby Marrow' -- harvest_produceName,
        ,'PLACEHOLDER - Baby Marrow Photo' -- harvest_photoHash,
        ,'2019-12-19 06:00:00' -- harvest_TimeStamp,
        ,'2019-12-20 20:06:00' -- harvest_CaptureTime,
        ,"Baby Marrows with soft skin and buttery flesh. [Organic]" -- harvest_Description,
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'units' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'no', 'organic':'yes'}" -- harvest_description_json,
        ,'a5d17f83-d55a-4fdf-a980-b89af095a0c3' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'White Mountain Natural Produce', ...}" -- harvest_BlockchainHashData
        ,'WMNP_BabyMarrow' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'1cc74217-f37d-4a9b-bc50-99952ed05d95' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' -- market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'units' -- market_unitOfMeasure,
        ,'2019-12-20 09:00:00' -- market_storageTimeStamp,
        ,'2019-12-20 20:06:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'24b9ef31-bb7a-4425-ae52-a47aa8719690' -- storage_BlockchainHashID,
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
        ,'2019-12-20 22:00:00'
        ,'2019-12-20 22:00:00'
        ),

        ('1dd54fe7-37f9-4556-a23e-50a69f7b4b1a' -- logid
        ,'bec4015a-b45d-4018-912a-f7e81daedf23' -- harvest_logid
        ,'WMPN' -- harvest_supplierShortcode 
        ,'White Mountain Natural Produce' --  harvest_supplierName
        ,'François Malan' --  harvest_farmerName
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_supplierAddress,
        ,'Radish' -- harvest_produceName,
        ,'PLACEHOLDER - Radish Photo' -- harvest_photoHash,
        ,'2019-12-19 09:00:00' -- harvest_TimeStamp,
        ,'2019-12-20 20:07:00' -- harvest_CaptureTime,
        ,"Cherry Belle heirloom cultivar. [Organic]" -- harvest_Description,
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'units' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'no', 'organic':'yes'}" -- harvest_description_json,
        ,'a6eb6d80-3de1-464e-b73e-23fdbfdcd721' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'White Mountain Natural Produce', ...}" -- harvest_BlockchainHashData
        ,'WMNP_Radish' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'81b061a0-12aa-4648-a682-c264ef15f9a7' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' --  market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'units' -- market_unitOfMeasure,
        ,'2019-12-20 09:00:00' -- market_storageTimeStamp,
        ,'2019-12-20 20:07:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'9f012536-862d-4ae2-9f1f-4351fda633a1' --  storage_BlockchainHashID,
        ,"{'market_Name':'Oranjezicht City Farm', ...}" -- storage_BlockchainHashData
        ,'PLACEHOLDER - storage_Description' -- storage_Description,
        ,'false' -- storage_bool_added_to_blockchain, 
        ,'-' -- storage_added_to_blockchain_date,
        ,'-' -- storage_added_to_blockchain_by, -- user who logged storage to blockchain
        ,'-' -- storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'false' -- harvest_bool_added_to_blockchain, -- true or false
        ,'-' -- harvest_added_to_blockchain_date, 
        ,'-' -- harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        ,'-' -- harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - harvest_user' -- harvest_user, -- user who logged harvest
        ,'PLACEHOLDER - storage_user' -- storage_user, -- user who logged storage
        ,'2019-12-20 22:00:00'
        ,'2019-12-20 22:00:00'
        ),

        ('f7e14319-7c98-468e-b32a-d17872c4f893' -- logid
        ,'f1259c22-eb1a-4998-8a17-795717c7b0e9' -- harvest_logid
        ,'WMPN' -- harvest_supplierShortcode 
        ,'White Mountain Natural Produce' --  harvest_supplierName
        ,'François Malan' --  harvest_farmerName
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_supplierAddress,
        ,'Green Beans' -- harvest_produceName,
        ,'PLACEHOLDER - Green Beans Photo' -- harvest_photoHash,
        ,'2019-12-19 10:00:00' -- harvest_TimeStamp,
        ,'2019-12-20 20:08:00' -- harvest_CaptureTime,
        ,"Tasty green beans. [Organic]" -- harvest_Description,
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'g' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'no', 'organic':'yes'}" -- harvest_description_json,
        ,'297742be-5854-4e60-999e-0a788cb3b4ae' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'White Mountain Natural Produce', ...}" -- harvest_BlockchainHashData
        ,'WMNP_GreenBeans' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'62bcd288-29a0-46a9-936f-33a256855e65' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' --  market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'g' -- market_unitOfMeasure,
        ,'2019-12-20 09:00:00' -- market_storageTimeStamp,
        ,'2019-12-20 20:08:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'f89a8f18-32a9-47ff-a9de-2a3e9bfea6f5' --  storage_BlockchainHashID,
        ,"{'market_Name':'Oranjezicht City Farm', ...}" -- storage_BlockchainHashData
        ,'PLACEHOLDER - storage_Description' -- storage_Description,
        ,'false' -- storage_bool_added_to_blockchain, 
        ,'-' -- storage_added_to_blockchain_date,
        ,'-' -- storage_added_to_blockchain_by, -- user who logged storage to blockchain
        ,'-' -- storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'false' -- harvest_bool_added_to_blockchain, -- true or false
        ,'-' -- harvest_added_to_blockchain_date, 
        ,'-' -- harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        ,'-' -- harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - harvest_user' -- harvest_user, -- user who logged harvest
        ,'PLACEHOLDER - storage_user' -- storage_user, -- user who logged storage
        ,'2019-12-20 22:00:00'
        ,'2019-12-20 22:00:00'
        ),

        ('80588304-00f0-459f-bcee-779385b96316' -- logid
        ,'d9b8a142-45cc-4b6e-95b8-ff2fd5f6b99c' -- harvest_logid
        ,'WMPN' -- harvest_supplierShortcode 
        ,'White Mountain Natural Produce' --  harvest_supplierName
        ,'François Malan' --  harvest_farmerName
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_supplierAddress,
        ,'Fennel' -- harvest_produceName,
        ,'PLACEHOLDER - Fennel Photo' -- harvest_photoHash,
        ,'2019-12-20 05:30:00' -- harvest_TimeStamp,
        ,'2019-12-20 20:09:00' -- harvest_CaptureTime,
        ,"Big bulb with good flavour. [Organic]" -- harvest_Description,
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'units' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'no', 'organic':'yes'}" -- harvest_description_json,
        ,'2f57d815-e7f9-46c0-912c-49d38e423d16' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'White Mountain Natural Produce', ...}" -- harvest_BlockchainHashData
        ,'WMNP_Fennel' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'81a56030-ef5e-4b77-92be-463bd84cc279' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' --  market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'units' -- market_unitOfMeasure,
        ,'2019-12-20 09:00:00' -- market_storageTimeStamp,
        ,'2019-12-20 20:09:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'b8acc015-1328-45bf-bff9-2a92bf47cc47' --  storage_BlockchainHashID,
        ,"{'market_Name':'Oranjezicht City Farm', ...}" -- storage_BlockchainHashData
        ,'PLACEHOLDER - storage_Description' -- storage_Description,
        ,'false' -- storage_bool_added_to_blockchain, 
        ,'-' -- storage_added_to_blockchain_date,
        ,'-' -- storage_added_to_blockchain_by, -- user who logged storage to blockchain
        ,'-' -- storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'false' -- harvest_bool_added_to_blockchain, -- true or false
        ,'-' -- harvest_added_to_blockchain_date, 
        ,'-' -- harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        ,'-' -- harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - harvest_user' -- harvest_user, -- user who logged harvest
        ,'PLACEHOLDER - storage_user' -- storage_user, -- user who logged storage
        ,'2019-12-20 22:00:00'
        ,'2019-12-20 22:00:00'
        ),

        ('44409f5b-5813-4e36-8e3c-77c7747e8fbc' -- logid
        ,'2d0107ea-dfc4-446c-8805-532327e07eb4' -- harvest_logid
        ,'QCGF' -- harvest_supplierShortcode 
        ,'Quick Crop Growers Farm' --  harvest_supplierName
        ,'Arleen Van Wyk' --  harvest_farmerName
        ,'Klipheuwel, Western Cape, South Africa 7303' -- harvest_supplierAddress,
        ,'Basil' -- harvest_produceName,
        ,'PLACEHOLDER - Basil Photo' -- harvest_photoHash,
        ,'2019-12-19 06:00:00' -- harvest_TimeStamp,
        ,'2019-12-20 20:10:00' -- harvest_CaptureTime,
        ,"Growing medium coco peat, fertiliser Bio- ocean; Pesticide – Organicide Plus;its grown in a Greenhouse. After each harvest vegetables are washed, prepared & stored in Cold-room at 10 degrees Celsius till delivery to ensure fresh produce to the market. [Organic, Greenhouse]" -- harvest_Description,
        ,'Klipheuwel, Western Cape, South Africa 7303' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'g' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'yes', 'organic':'yes'}" -- harvest_description_json,
        ,'408230f4-db1f-4ba5-baa5-0e02289e7624' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'White Mountain Natural Produce', ...}" -- harvest_BlockchainHashData
        ,'QCGF_Basil' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'a5d64341-70f5-44aa-aec4-502c4bd65a9d' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' --  market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'g' -- market_unitOfMeasure,
        ,'2019-12-20 09:30:00' -- market_storageTimeStamp,
        ,'2019-12-20 20:10:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'63ab5f00-0b21-4087-9f39-a795f7c6a5ff' --  storage_BlockchainHashID,
        ,"{'market_Name':'Oranjezicht City Farm', ...}" -- storage_BlockchainHashData
        ,'PLACEHOLDER - storage_Description' -- storage_Description,
        ,'false' -- storage_bool_added_to_blockchain, 
        ,'-' -- storage_added_to_blockchain_date,
        ,'-' -- storage_added_to_blockchain_by, -- user who logged storage to blockchain
        ,'-' -- storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'false' -- harvest_bool_added_to_blockchain, -- true or false
        ,'-' -- harvest_added_to_blockchain_date, 
        ,'-' -- harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        ,'-' -- harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - harvest_user' -- harvest_user, -- user who logged harvest
        ,'PLACEHOLDER - storage_user' -- storage_user, -- user who logged storage
        ,'2019-12-20 22:00:00'
        ,'2019-12-20 22:00:00'
        ),

        ('bea2e318-f858-4d8a-8e21-c466c5665a53' -- logid
        ,'876b1dd3-4432-43f4-9a73-67e55f06faf2' -- harvest_logid
        ,'QCGF' -- harvest_supplierShortcode 
        ,'Quick Crop Growers Farm' --  harvest_supplierName
        ,'Arleen Van Wyk' --  harvest_farmerName
        ,'Klipheuwel, Western Cape, South Africa 7303' -- harvest_supplierAddress,
        ,'Cayene Pepper' -- harvest_produceName,
        ,'PLACEHOLDER -  Cayene Pepper Photo' -- harvest_photoHash,
        ,'2019-12-19 06:00:00' -- harvest_TimeStamp,
        ,'2019-12-20 20:11:00' -- harvest_CaptureTime,
        ,"Growing medium coco peat, fertiliser Bio- ocean; Pesticide – Organicide Plus;its grown in a Greenhouse. After each harvest vegetables are washed, prepared & stored in Cold-room at 10 degrees Celsius till delivery to ensure fresh produce to the market. [Organic, Greenhouse]" -- harvest_Description,
        ,'Klipheuwel, Western Cape, South Africa 7303' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'units' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'yes', 'organic':'yes'}" -- harvest_description_json,
        ,'0745fae7-b370-40e6-955b-07b5ab29f492' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'White Mountain Natural Produce', ...}" -- harvest_BlockchainHashData
        ,'QCGF_CayennePepper' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'776c5910-287f-456d-806a-7f8d86f4bac5' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' --  market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'units' -- market_unitOfMeasure,
        ,'2019-12-20 09:30:00' -- market_storageTimeStamp,
        ,'2019-12-20 20:11:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'4ed4d9e8-8969-4e2e-94dd-1d133790b7cd' --  storage_BlockchainHashID,
        ,"{'market_Name':'Oranjezicht City Farm', ...}" -- storage_BlockchainHashData
        ,'PLACEHOLDER - storage_Description' -- storage_Description,
        ,'false' -- storage_bool_added_to_blockchain, 
        ,'-' -- storage_added_to_blockchain_date,
        ,'-' -- storage_added_to_blockchain_by, -- user who logged storage to blockchain
        ,'-' -- storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'false' -- harvest_bool_added_to_blockchain, -- true or false
        ,'-' -- harvest_added_to_blockchain_date, 
        ,'-' -- harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        ,'-' -- harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - harvest_user' -- harvest_user, -- user who logged harvest
        ,'PLACEHOLDER - storage_user' -- storage_user, -- user who logged storage
        ,'2019-12-20 22:00:00'
        ,'2019-12-20 22:00:00'
        );

-- select from foodprint_weeklyview
SELECT 
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
        lastmodifieddatetime
	FROM 
		foodprint_weeklyview 
	WHERE 
		supplierproduce = 'WMNP_BabyMarrow' AND 
        logdatetime < (date(curdate() - interval weekday(curdate()) day + interval 1 week)) AND  -- next Monday
        logdatetime > (date(curdate() - interval weekday(curdate()) day)); -- past Monday 