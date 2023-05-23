const AWS = require('aws-sdk');
require('dotenv').config();

// Digital Ocean imports
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Digital Ocean config. // Set S3 endpoint to DigitalOcean Spaces
const bucketEndpoint = process.env.DO_ENDPOINT;
const bucketKey = process.env.DO_KEY_ID;
const bucketSecret = process.env.DO_SECRET;

const BucketName = process.env.DO_BUCKET_NAME;

const config = {
  //Get the endpoint from the DO website for your space
  endpoint: bucketEndpoint,
  useAccelerateEndpoint: false,
  //Create a credential using DO Spaces API key (https://cloud.digitalocean.com/account/api/tokens)
  credentials: new AWS.Credentials(bucketKey, bucketSecret, null),
};

const space = new AWS.S3(config);

/*
const checkFileExists = async function () {
  // DO Check if file exists by returning metadata

  const uploadParams = {
    Bucket: BucketName,
    Key: 'foodprint_produceprice_2022-07-26.pdf',
  };
  // Using callbacks
  space.headObject(uploadParams, function (err, metadata) {
    if (err && err.name === 'NotFound') {
      // Handle no object on cloud here
    } else if (err) {
      // Handle other errors here....
      console.log(err);
    } else {
      console.log('File Found in Cloud');

      // if you wish to give someone access to a file they do not have permissions to, you can sign the URL for them i.e. space.getSignedUrl('getObject', params, callback);
    }
  });
};
*/

//// node /tests/test_digitaloceanfileexists.js

//or an alternative using async/await
const uploadParams = {
  Bucket: BucketName,
  Key: 'foodprint_produceprice_2022-07-28.pdf',
};

const checkFileExists = async function () {
  // DO Check if file exists by returning metadata
  try {
    await space.headObject(uploadParams).promise();
    console.log('File Found in S3');
  } catch (err) {
    console.log('File not Found ERROR : ' + err);
  }
};

const run = async () => {
  await checkFileExists();
  await process.exit();
};

run();
