let {BN_18} = require('../utils');

const VELOImplementation = artifacts.require("VELODelegate");
const VELOProxy = artifacts.require("VELODelegator");

async function deploy(owner) {
    const veloImplementation = await VELOImplementation.new({from: owner});
    const veloProxy = await VELOProxy.new(
      "VELO Token",
      "VLO",
      18,
      BN_18(100000000),
      veloImplementation.address,
      "0x",
      {from: owner});

    return [veloProxy, veloImplementation];
};

module.exports = {
  deploy
};


