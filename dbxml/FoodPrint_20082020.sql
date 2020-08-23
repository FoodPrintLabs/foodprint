--  =============================================
-- Author:      Julian Kanjere
-- Create date: 20 August 2020
-- Description: Change columns harvest_TimeStamp, harvest_CaptureTime,  harvest_added_to_blockchain_date in foodprint_harvest to DATETIME
--				Change columns market_storageTimeStamp, market_storageCaptureTime,  storage_added_to_blockchain_date in foodprint_storage to DATETIME


-- HARVEST
UPDATE foodprint_harvest SET harvest_added_to_blockchain_date = NULL WHERE harvest_added_to_blockchain_date = '-';

ALTER TABLE foodprint_harvest 
MODIFY  harvest_TimeStamp datetime, 
MODIFY  harvest_CaptureTime datetime,  
MODIFY  harvest_added_to_blockchain_date datetime;



-- STORAGE

UPDATE foodprint_storage SET storage_added_to_blockchain_date = NULL WHERE storage_added_to_blockchain_date = '-';

ALTER TABLE foodprint_storage 
MODIFY  market_storageTimeStamp datetime, 
MODIFY  market_storageCaptureTime datetime,  
MODIFY  storage_added_to_blockchain_date datetime;

