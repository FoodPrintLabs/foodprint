const AWS = require('aws-sdk');

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

const checkFileExists = async function () {
  // DO Check if file exists by returning metadata

  const input = {
    Bucket: BucketName,
    Key: 'foodprint_produceprice_2022-07-26.pdf',
  };
  const client = new S3Client(config);
  const command = new AWS.HeadObjectCommand(input);
  const response = await client.send(command);
  console.log(response);
};

const run = async () => {
  await checkFileExists();
  await process.exit();
};

run();

//// node ./tests/test_digitaloceanfileexists.js
