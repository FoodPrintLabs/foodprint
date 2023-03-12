// node ./tests/test_twilio_media_url.js

// twilio documentation here - https://www.twilio.com/docs/whatsapp/api/media-resource

const CUSTOM_ENUMS = require('../utils/enums');


//only load the .env file if the server isn’t started in production mode
if (process.env.NODE_ENV !== CUSTOM_ENUMS.PRODUCTION) {
    require('dotenv').config();
}
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


console.log('accountSid - ' + accountSid);
console.log('authToken - ' + authToken);

const messageID = 'MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
const mediaID = 'MEXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

//get specific media message metadata
client.messages(messageID)
    .media(mediaID)
    .fetch()
    .then(media => console.log(media));

//get all media messages and their ID's
// client.messages(messageID)
//     .media
//     .list({limit: 20})
//     .then(media => media.forEach(m => console.log(m.sid)));