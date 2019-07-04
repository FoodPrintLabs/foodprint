# FoodPrint
Small scale farmer food supply chain on Blockchain. 

## Installation
1. Install Truffle globally. Truffle is the most popular smart contract development, testing, and deployment framework. 
```
$npm install -g truffle 
```

2. Install node dependencies.
```
$npm install
```

3. Start Ganache and Create a Workspace (or open an existing one). 

4. Confirm FoodPrint smart contract compiles successfully.
```
$truffle compile
```

5. Run tests for FoodPrint smart contract.
```
$truffe test
$truffle test --network development
```

4. Deploy FoodPrint smart contract to Ganache (assumes Ganache is running).

`truffle migrate` will run all migrations located within your project's migrations directory. If your migrations were previously run successfully, truffle migrate will start execution from the last migration that was run, running only newly created migrations. If no new migrations exists, `truffle migrate` won't perform any action at all. 
```
$truffle migrate
```

The --reset flag will force to run all your migrations scripts again. Compiling if some of the contracts have changed. You have to pay gas for the whole migration again. 
```
$truffle migrate --reset
```

The --all flag will force to recompile all your contracts. Even if they didn't change. It is more time compiling all your contracts, and after that it will have to run all your deploying scripts again.
```
$truffle migrate --compile-all --reset
```

If for some reason truffle fails to acknowledge a contract was modified and will not compile it again, delete the build/ directory. This will force a recompilation of all your contracts and running all your deploy scripts again.

5. Update `truffle-config.js` development network with NetworkID, Host and Port values from your local Blockchain in Ganache.

6. Start the development web server (liteserver). This will open your default web browser and serve the index page.
```
$npm run dev
```

## Other
1. Access deployed contract from CLI
```
$ truffle console
$ TheProduct.deployed().then(function(instance) { app = instance })
$ app.noHarvests()
```

2. Add a new migration
```
$touch 2_deploy_contract.js
```

3. Create infura project  at https://infura.io (Infura gives you access to test network).
This project will give you an ID that you will use in `truffle-config.js`
infura means you do not have to sync an ether node or rinkeby node to deploy directly.

4. Get test ether from https://faucet.rinkeby.io/ (you will need to create an Ethereum rinkeby wallet on MetaMask then use the address on twitter).
e.g. 0x4B67D20a4F27d248aF0462C23F8C193f073517FB

5. Update `truffle-config.js` with rinkeby. This will deploy from the metamask accounts, by default account 0 so specify which one you want.

6. Deploy to rinkeby. 
```
$truffle migrate --network rinkeby --compile-all --reset
```

7. Check contract on rinkeby etherscan https://rinkeby.etherscan.io

