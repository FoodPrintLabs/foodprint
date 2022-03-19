# FoodPrint

FoodPrint is a digital, blockchain-enabled, farm-to-fork (fresh produce) supply chain platform for
smallholder farmers, primarily in developing countries. FoodPrint is designed to:

- Simplify production and harvest data collection for smallholder farmers.
- Directly connect them to market opportunities - including but not limited to intermediaries such
  as markets and retailers, as well as consumers.
- Provide them with access to blockchain-based financial and transactional services.

## Overview

FoodPrint has 5 types of users:

- Super User Admin

The Super User is responsible for setting up the infrastructure and system configuration.

- System Admin

The System Admin is responsible for the day-to-day running of the platform, providing user support
(on-boarding and operations) and basic configuration.

- Farmer

The Farmer is responsible for capturing produce data at harvest time onto FoodPrint. The Farmer also
transports the produce to the Market as per order from Market Admin.

- Intermediary e.g. Wholesaler, Retailers, Farmers Market Admin etc

The Intermediary is responsible for receiving produce from the Farmer and capturing the relevant
data onto FoodPrint.

- Consumer

The consumer is the final actor in a food supply chain. They purchase fresh produce from an
intermediary. The consumer can scan a barcode associated with produce and view the verified produce
information and supply chain stories i.e. view information on the produce they are buying, it's
source and journey, hence from farm-to-fork. Android versions 8 & 9 and iOS versions 11 & 12 can
automatically scan QR codes using the camera app.

## Documentation

TODO

## IDE Setup

IDE of choice is VS Code

Code Formatter is Prettier

Make sure prettier is installed i.e. `npm install --save-dev --save-exact prettier`

Project specific Prettier config file is `.prettierrc.json` which is in the project root

Make sure Prettier extension is installed in VS Code (run following command in VS Code
`ext install esbenp.prettier-vscode`)

Project specific VS Code config file is `.vscode/settings.json`

To run Prettier CLI `npm run format` (which is defined in package.json)

To run Prettier manually for specific file formats `prettier --write 'src/**/*.{ts,tsx}'`

Credit - https://glebbahmutov.com/blog/configure-prettier-in-vscode/

## Installation (Development Environment)

In order to run FoodPrint, an environment with the following is required:

- Node.js
- Algosdk
- Bootstrap
- MySQL

1. Install node dependencies.

```
$npm install
```

2. Create a blank MySQL database

3. Create a database configuration file in the root folder - `dbconfig.json` and populate with
   updated json config as below

```json
{
  "db_pool": {
        "host"      : <HOSTNAME>,
        "user"      : <USERNAME>,
        "password"  : <PASSWORD>,
        "database"  : <DATABASENAME>
    },
  "development": {
    "username": <USERNAME>,
    "password": <PASSWORD>,
    "database": <DATABASENAME>,
    "host": <HOSTNAME>,
    "dialect": "mysql"
  },
  "test": {
    "username": <USERNAME>,
    "password": <PASSWORD>,
    "database": <DATABASENAME>,
    "host": <HOSTNAME>,
    "dialect": "mysql"
  },
  "production": {
    "username": <USERNAME>,
    "password": <PASSWORD>,
    "database": <DATABASENAME>,
    "host": <HOSTNAME>,
    "dialect": "mysql"
  }
}
```

4. Create a .env file in the root directory of your project. Add environment-specific variables on
   new lines in the form of NAME=VALUE. For example

```
NODE_ENV=staging
PORT=3000
APP_NAME=REPLACE_ME
SESSION_SECRET=REPLACE_ME
EMAIL_ADDRESS=GMAIL_EMAIL_ADDRESS
EMAIL_PASSWORD=GMAIL_EMAIL_PASSWORD
EMAIL_OVERRIDE=OVERRIDE_EMAIL_ADDRESS
BLOCKCHAINENV=TESTNET
DEV_ALGOD_API_KEY=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
DEV_ALGOD_SERVER=http://localhost
DEV_ALGOD_PORT=4001
DEV_ALGOINDEXER_PORT=8980
TESTNET_ALGOD_API_KEY=REPLACE_ME
TESTNET_ALGOD_SERVER=https://testnet-algorand.api.purestake.io/ps2
TESTNET_ALGOINDEXER_SERVER=https://testnet-algorand.api.purestake.io/idx2
TESTNET_ALGOD_PORT=
MAINNET_ALGOD_API_KEY=REPLACE_ME
MAINNET_ALGOD_SERVER=https:https://mainnet-algorand.api.purestake.io/ps2
MAINNET_ALGOINDEXER_SERVER=https://mainnet-algorand.api.purestake.io/idx2
MAINNET_ALGOD_PORT=
ACCOUNT1_ADDRESS=REPLACE_ME
ACCOUNT1_MNEMONIC=REPLACE_ME
ACCOUNT2_ADDRESS=REPLACE_ME
ACCOUNT2_MNEMONIC=REPLACE_ME
```

You can then access the variables in your code using process.env e.g.
`console.log(process.env.NODE_ENV)`

5. Start the web server (Express) and navigate to http://localhost:3000/ in your browser.

```
$npm run dev
```

## Production Deployment

1. To deploy to a production server, first bundle and uglify then deploy

```
$npm run build
$npm run start
```

## Other

- Generating Sequelize Models from an existing database using Sequelize Auto. For convenience
  Sequelize Auto provides a programmatic api that can be used in the generation of models in
  addition to their [cli](https://github.com/sequelize/sequelize-auto). You can use the convenience
  script `src/js/sequelise_auto_export.js` to generate required models by supplying the table names
  in the `tables` section of the `options` object. The script establishes a connection to the
  database using the config data specified in step `3`. Execute the command below within `src/js` to
  generate the models for the specified tables:

```bash
node sequelise_auto_export.js
```

The generated models can be found in `./models`

- Generate test UUID's from command line (i.e. server side).

```
$node
>const uuidv4 = require('uuid/v4')
>uuidv4()
```

- Generate test QRCode's from command line (i.e. server side).

```
$node
>var QRCode = require('qrcode');
>let produceUrl = "http://www.google.com";
>let supplier = "supplier";
>let produce = "Storage";
>var res2 = await QRCode.toDataURL(produceUrl);
>res2
```

## Previous contract details

Initial contract was deployed at Ethereum Testnet (rinkeby) at address
https://rinkeby.etherscan.io/address/0xfC4d26073650887069dFa7Da686A491535ab8Fd4.

This was followed by a deployment to the Matic Testnet (mumbai) at address
https://mumbai.polygonscan.com/address/0x650168110ADa1f089D443904c6759b7349576A0d,

Latest version of FoodPrint is integrated with the Algorand TestNet via the `algosdk` and
`PureStake` service.

## Supported Browsers

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/samsung-internet/samsung-internet_48x48.png" alt="Samsung" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Samsung | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE11, Edge                                                                                                                                                                                                      | Supported                                                                                                                                                                                                         | Supported                                                                                                                                                                                                     | Supported                                                                                                                                                                                                     | Supported                                                                                                                                                                                                                     | Supported                                                                                                                                                                                                                           | Supported                                                                                                                                                                                                 |
