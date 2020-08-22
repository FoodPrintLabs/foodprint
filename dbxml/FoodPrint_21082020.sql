--  =============================================
-- Author:      Julian Kanjere
-- Create date: 21 August 2020
-- Description: Add columns year_established and covid19_response to harvest logbook and weekly view. Make photoHash BLOB in weekly_view


ALTER TABLE foodprint_harvest 
ADD year_established varchar(255),
ADD covid19_response varchar(255);

ALTER TABLE foodprint_weeklyview 
ADD year_established varchar(255),
ADD covid19_response varchar(255);

-- WEEKLY VIEW
UPDATE foodprint_weeklyview SET harvest_photoHash = NULL;

ALTER TABLE foodprint_weeklyview 
MODIFY  harvest_photoHash LONGBLOB;