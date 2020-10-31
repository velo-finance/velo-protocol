require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

require("@nomiclabs/hardhat-truffle5");

require('dotenv').config();

// create all individual tasks
require('./tasks');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    test: {
      url: 'http://0.0.0.0:8545',
      accounts: [process.env.LOCAL_PRIVATE_KEY],
      gasLimit: 10000000,
      gasPrice: 100000000000, // 100 gwei
      timeout: 20000
    },
    hardhat: {
      gas: 10000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.TESTNET_PRIVATE_KEY],
      gasPrice: 30000000000, // 22 gwei
      timeout: 20000
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gasPrice: 35000000000, 
      timeout: 14400000
    }
  },
  etherscan: {
    // url: "https://api-mainnet.etherscan.io/api",
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    compilers: [{
      version: "0.5.17",
      optimizer: {
	enabled: true,
	runs: 10000
      }},
      {
	version: "0.5.12",
	optimizer: {
	  enabled: true,
	  runs: 10000
	},
	evmVersion: "byzantium"
      },
    ]}
  ,
  paths: {
    sources: './contracts',
    tests: './test',
  },
  mocha: {
    enableTimeouts: false,
  },
};

