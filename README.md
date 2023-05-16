# FoodPrint

FoodPrint is a digital, blockchain-enabled, farm-to-fork (fresh produce) supply chain platform for
smallholder farmers. FoodPrint is designed to:

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

3. Create a .env file in the root directory of your project. Add environment-specific variables on
   new lines in the form of NAME=VALUE. For example

```
NODE_ENV=staging
PORT=3000
APP_NAME=REPLACE_ME
SESSION_SECRET=REPLACE_ME
EMAIL_ADDRESS=GMAIL_EMAIL_ADDRESS
EMAIL_PASSWORD=GMAIL_EMAIL_PASSWORD
WEBAPP_PASSWORD=WEBAPP_PASSWORD
EMAIL_HOST=EMAIL_HOST
EMAIL_PORT=EMAIL_PORT
TEST_EMAIL_ADDRESS=TEST_EMAIL_ADDRESS
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
DB_DIALECT=REPLACE_ME
DB_URL=REPLACE_ME
USER1_PASSWORD=REPLACE_ME
USER2_PASSWORD=REPLACE_ME
USER3_PASSWORD=REPLACE_ME
USER4_PASSWORD=REPLACE_ME
USER5_PASSWORD=REPLACE_ME
USER6_PASSWORD=REPLACE_ME
USER7_PASSWORD=REPLACE_ME
DO_BUCKET_NAME=REPLACE_ME
DO_KEY_ID=REPLACE_ME
DO_SECRET=REPLACE_ME
DO_ENDPOINT=REPLACE_ME
TWILIO_ACCOUNT_SID=REPLACE_ME
TWILIO_AUTH_TOKEN=REPLACE_ME
```

You can then access the variables in your code using process.env e.g.
`console.log(process.env.NODE_ENV)`

4. Start the web server (Express) and navigate to http://localhost:3000/ in your browser.

```
$npm run dev
```

## Production Deployment

1. To deploy to a production server e.g. heroku, first bundle and uglify then deploy

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

- Creating sequelize migration (which creates a js file in migrations folder and will need to be commited)
```bash
npx sequelize migration:create --name name_of_new_db_column
```

Run the migration
```bash
npx sequelize db:migrate --url ‘mysql://username:password@localhost:3306/databasename'
```

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

## Deploy to Heroku

Summary

```
Create app on Heroku

login to Heroku via command line i.e. heroku login

add heroku remote to your local repo i.e. heroku git:remote -a app name

Link to Git Repo

Update env variables

Create database addon Postgres (natively supported by Heroku) or ClearDB which is MySQL -
https://devcenter.heroku.com/articles/cleardb


$ heroku addons:create cleardb:ignite
$ heroku config | findstr CLEARDB_DATABASE_URL
$ heroku config | set DATABASE_URL= # MySQL database url retrieved from above line
```

Deploy repo to Heroku

```
$ git push heroku main
```

Install Heroku releases retry plugin (if you deploy to heroku and it fails, you no longer have to
commit a dummy txt file in order to bump up the latest commit hash so that your next push up to
heroku will trigger a deploy.)

```
$ heroku plugins:install heroku-releases-retry
```

Then to retry failed deploy

```
$ heroku releases:retry
```

Login to Heroku bash

```
$ heroku run bash
```

If everything went well, you’ve successfully deployed your Node.js app to Heroku. To open your app,
run:

```
$ heroku open
```

If you ever need to restart/stop the Heroku app

```
$ heroku ps:restart web -a nameofapp
$ heroku ps:stop web -a nameofapp
```

If you need to run sequelize migrations in Heroku (although this is included in the build step in
`package.json`)

```
$ heroku run npx sequelize-cli db:migrate --url 'mysql://root:password@mysql_host.com/database_name' --app nameofapp
```

Alternatively
```
$ heroku run npm run build -a name-of-app
```

Tail Heroku logs

```
$ heroku logs --tail
```

Migrate data from MySQL to local Postgres using `pgloader`

```
$ pgloader mysql://username:password@localhost/mysqldbname postgresql:///pgdbname
```

Push local Postgres to Heroku (v1)

```
$ heroku pg:psql heroku-db-name --app nameofapp
```

Push local Postgres to Heroku (v2)

```
$ PGUSER=postgres PGPASSWORD=password123  heroku pg:push postgres://localhost/example <heroku-db-name>
```

Reset Heroku Postgres database (i.e. truncate)

```
$ heroku pg:reset
```

Backup Heroku Postgres database

```
$ heroku pg:backups:capture
$ heroku pg:backups:download
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
