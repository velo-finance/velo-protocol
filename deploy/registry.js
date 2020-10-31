const jsonfile = require("jsonfile");
const tempy = require('tempy');

let hre;

function network() {
  if(!hre.network.name) { throw "network name must be set" };
  return hre.network.name;
}

let registry_file_tmp;
function registry_file() {
  // on hardhat, we have no memory
  if (hre.network.name == "hardhat") {
    if(!registry_file_tmp) {
      registry_file_tmp = tempy.file({extension: 'json'});
      console.log("hardhat registry file: %s", registry_file_tmp);
    } 
    return registry_file_tmp;
  } else {
    return `registry/${network()}.json`;
  }

}

async function read() {
  try {
    let reg = await jsonfile.readFile(registry_file());
    reg["pool"] = reg["pool"] || {};
    return reg;
  } catch (e) {
    if(e.errno != -2) { console.log(e);}
    return {"pool": {}};
  }
}

async function write(reg) {
  await jsonfile.writeFile(registry_file(), reg);
}

async function store(key,value) {
  let reg = await read();
  reg[key] = value;
  await write(reg);
  return reg;
}

async function fetch(key) {
  let reg = await read();
  return reg[key];
}

async function pool(label) {
  let reg = await read();
  return reg["pool"][label];
}


async function registerPoolEvent(label, ev) {
  let reg = await read();
  reg["pool"][label][ev] = true;
  await write(reg);
}

async function getContract(key) {
  let reg = await read();
  if ( !reg[key] ) { throw { message: "cannot find contract " + key, type: "MISS" } }
  return await hre.ethers.getContractAt(key, reg[key]);
}

async function getContractOrCall(contract_name, ifn) {
  try {
    let contract = await getContract(contract_name);
    console.log("%s already deployed @ %s", contract_name, contract.address);
    return contract;
  } catch (e) {
    // otherwise retrun install
    if ( e.type == "MISS" ) {
      console.log("%s not in registry, calling install function", contract_name);
      let rv = await ifn(); 
      if(!rv) { throw "Installer function should return a value. Check return statement" }
      return rv;
    } else {
      throw e;
    }
  }
};


async function getPoolContract(key) {
  let reg = await read();
  if ( !reg["pool"][key] ) { throw "cannot find pool " + key }
  return await hre.ethers.getContractAt("VELOStakingPool", reg["pool"][key]["address"]);
}

async function store_pool(key,info) {
  let reg = await read();
  reg["pool"][key] = info;
  await write(reg);
  return reg;
}

module.exports = function (_hre) { 
  hre = _hre;
  return {read,pool,write,store,getContract,getContractOrCall,getPoolContract,fetch,store_pool,registerPoolEvent}; 
};

