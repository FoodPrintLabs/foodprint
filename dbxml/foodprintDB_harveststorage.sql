--  =============================================
-- Author:      Julian Kanjere
-- Create date: 22 January 2020
-- Description: Script to create new harvest and storage tables


-- Harvest (include hash column, added_to_blockchain, blockchain_date, blockchain_by, verifiable_on_blockchain.
--         write to DB then Add to Blockchain fxn which also stores the contract address and uses latest contract by default),
-- Storage (write to DB then Add to Blockchain fxn), Weekly View (choose market then display),

-- =============CHANGE HISTORY===================
-- Julian Kanjere       20 August 2020          Change columns harvest_TimeStamp, harvest_CaptureTime,  harvest_added_to_blockchain_date in foodprint_harvest to DATETIME
-- Julian Kanjere       20 August 2020          Change columns market_storageTimeStamp, market_storageCaptureTime,  storage_added_to_blockchain_date in foodprint_storage to DATETIME
-- Julian Kanjere       20 August 2020          Change column harvest_photoHash to LONGBLOB
-- =============================================


-- foodprint_harvest
CREATE TABLE foodprint_harvest (
        pk int NOT NULL AUTO_INCREMENT,
        harvest_logid varchar(255),
        harvest_supplierShortcode varchar(255), -- farm shortcode
        harvest_supplierName varchar(255), -- farm name
        harvest_farmerName varchar(255), -- farmer name
        harvest_supplierAddress varchar(255),
        harvest_produceName varchar(255), -- produce name e.g. Baby Marrow, Radish
        harvest_photoHash LONGBLOB,
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
        harvest_bool_added_to_blockchain varchar(255), -- true or false
        harvest_added_to_blockchain_date varchar(255), 
        harvest_added_to_blockchain_by varchar(255), -- user who logged harvest to blockchain
        harvest_blockchain_uuid varchar(255), -- uuid to blockchain config record which has contract and address
        harvest_user varchar(255), -- user who logged harvest
        logdatetime DATETIME,
        lastmodifieddatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_harvest (
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
        harvest_bool_added_to_blockchain, -- true or false
        harvest_added_to_blockchain_date, 
        harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        harvest_user, -- user who logged harvest
        logdatetime,
        lastmodifieddatetime
        )
VALUES ('2e3f2070-5f5c-48bd-a5eb-f4121729bf7d' -- harvest_logid
        ,'WMPN' -- harvest_supplierShortcode 
        ,'White Mountain Natural Produce' -- harvest_supplierName
        ,'François Malan' -- harvest_farmerName
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_supplierAddress,
        ,'Baby Marrow' -- harvest_produceName,
        ,'PLACEHOLDER - Baby Marrow Photo' -- harvest_photoHash,
        ,'2020-01-19 06:00:00' -- harvest_TimeStamp,
        ,'2020-01-20 20:06:00' -- harvest_CaptureTime,
        ,"Baby Marrows with soft skin and buttery flesh. [Organic]" -- harvest_Description,
        ,'Wolseley, Western Cape, South Africa 6830' -- harvest_geolocation,
        ,'PLACEHOLDER - harvest_quantity' -- harvest_quantity,
        ,'units' -- harvest_unitOfMeasure,
        ,"{'greenhouse':'no', 'organic':'yes'}" -- harvest_description_json,
        ,'a5d17f83-d55a-4fdf-a980-b89af095a0c3' -- harvest_BlockchainHashID,
        ,"{'harvest_supplierName':'White Mountain Natural Produce', ...}" -- harvest_BlockchainHashData
        ,'WMNP_BabyMarrow' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'false' -- harvest_bool_added_to_blockchain, -- true or false
        ,'-' -- harvest_added_to_blockchain_date, 
        ,'-' -- harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        ,'-' -- harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - harvest_user' -- harvest_user, -- user who logged harvest
        ,'2020-01-20 22:00:00'
        ,'2020-01-20 22:00:00'
        );

-- select from foodprint_harvest
SELECT 
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
        harvest_bool_added_to_blockchain, -- true or false
        harvest_added_to_blockchain_date, 
        harvest_added_to_blockchain_by, -- user who logged harvest to blockchain
        harvest_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        harvest_user, -- user who logged harvest
        logdatetime,
        lastmodifieddatetime
	FROM 
		foodprint_harvest 
	WHERE 
		supplierproduce = 'WMNP_BabyMarrow' AND 
        logdatetime < (date(curdate() - interval weekday(curdate()) day + interval 1 week)) AND  -- next Monday
        logdatetime > (date(curdate() - interval weekday(curdate()) day)); -- past Monday 





-- foodprint_storage
CREATE TABLE foodprint_storage (
        pk int NOT NULL AUTO_INCREMENT,
        harvest_logid varchar(255),
        harvest_supplierShortcode varchar(255), -- farm shortcode
        supplierproduce varchar(255), -- e.g. WMPN_BabyMarrow
        storage_logid varchar(255),
        market_Shortcode varchar(255),
        market_Name varchar(255),
        market_Address varchar(255),
        market_quantity varchar(255),
        market_unitOfMeasure varchar(255),
        market_storageTimeStamp DATETIME,
        market_storageCaptureTime DATETIME,
        market_URL varchar(255),
        storage_BlockchainHashID varchar(255),
        storage_BlockchainHashData varchar(2000), -- JSON with column value pairs e.g. {'market_Name':'Oranjezicht City Farm', ...}
        storage_Description varchar(255),
        storage_bool_added_to_blockchain varchar(255), -- true or false
        storage_added_to_blockchain_date DATETIME,
        storage_added_to_blockchain_by varchar(255), -- user who logged storage to blockchain
        storage_blockchain_uuid varchar(255), -- uuid to blockchain config record which has contract and address
        storage_user varchar(255), -- user who logged storage
        logdatetime DATETIME,
        lastmodifieddatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_storage (
        harvest_logid,
        harvest_supplierShortcode, -- e.g. WMPN
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
        storage_user, -- user who logged storage
        logdatetime,
        lastmodifieddatetime
        )
VALUES ('2e3f2070-5f5c-48bd-a5eb-f4121729bf7d' -- harvest_logid
        ,'WMPN' -- harvest_supplierShortcode 
        ,'WMNP_BabyMarrow' -- supplierproduce, -- e.g. WMPN_BabyMarrow
        ,'1cc74217-f37d-4a9b-bc50-99952ed05d95' -- storage_logid,
        ,'Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051' -- market_Address,
        ,'PLACEHOLDER - market_quantity' -- market_quantity,
        ,'units' -- market_unitOfMeasure,
        ,'2020-01-20 09:00:00' -- market_storageTimeStamp,
        ,'2020-01-20 20:06:00' -- market_storageCaptureTime,
        ,'PLACEHOLDER - market_URL' -- market_URL,
        ,'24b9ef31-bb7a-4425-ae52-a47aa8719690' -- storage_BlockchainHashID,
        ,"{'market_Name':'Oranjezicht City Farm', ...}" -- storage_BlockchainHashData
        ,'PLACEHOLDER - storage_Description' -- storage_Description,
        ,'false' --  storage_bool_added_to_blockchain, 
        ,'-' -- storage_added_to_blockchain_date,
        ,'-' -- storage_added_to_blockchain_by, -- user who logged storage to blockchain
        ,'-' -- storage_blockchain_uuid, -- uuid to blockchain config record which has contract and address
        ,'PLACEHOLDER - storage_user' -- storage_user, -- user who logged storage
        ,'2020-01-20 22:00:00'
        ,'2020-01-20 22:00:00'
        );

-- select from foodprint_storage
SELECT 
        harvest_logid,
        harvest_supplierShortcode,
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
        storage_user, -- user who logged storage
        logdatetime,
        lastmodifieddatetime
	FROM 
		foodprint_storage 
	WHERE 
		supplierproduce = 'WMNP_BabyMarrow' AND 
        logdatetime < (date(curdate() - interval weekday(curdate()) day + interval 1 week)) AND  -- next Monday
        logdatetime > (date(curdate() - interval weekday(curdate()) day)); -- past Monday 