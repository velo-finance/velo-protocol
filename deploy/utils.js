
// Create WETH9 contract
async function deploy_WETH9() {
  const WETH = artifacts.require('WETH9');
  return await WETH.new();
}

// Deploys the token contract
async function deploy_Token(name) {
  let TestToken = artifacts.require('Token');

  return await TestToken.new(name, name + "Token", 18);
}


async function deploy(name, ...args) {
  let contractFactory = await ethers.getContractFactory(name);
  if(!contractFactory) { throw "Artifact not found for " + name };
  let contract = await contractFactory.deploy(...args);
  await contract.deployed();

  return contract;
}

async function getContractOrDeploy(reg, contract_name, ...args) {
    let contract_instance = await reg.getContractOrCall(contract_name, async () => {
      let contract = await deploy(contract_name, ...args);

      await reg.store(contract_name, contract.address);  
      console.log("%s deployed to: %s", contract_name, contract.address);

      return contract;
    });

  return contract_instance;
}

module.exports = {deploy_Token, deploy_WETH9, deploy, getContractOrDeploy};
