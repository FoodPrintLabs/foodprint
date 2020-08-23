--  =============================================
-- Author:      Julian Kanjere
-- Create date: 19 August 2020
-- Description: Change columns harvest_photoHash to LONGBLOB


-- HARVEST
UPDATE foodprint_harvest SET harvest_photoHash = NULL;

ALTER TABLE foodprint_harvest 
MODIFY  harvest_photoHash LONGBLOB;