const  AsciiTable = require('ascii-table')
const humanizeDuration = require("humanize-duration");
const utils = require("util");

const n18 = (bn) => { 
  return ethers.FixedNumber.fromValue(bn.toString(), 18).toUnsafeFloat() 
};

const n0 = (bn) => { 
  return ethers.FixedNumber.fromValue(bn.toString(), 0).toUnsafeFloat() 
};

function ts2date(ts) {
  return new Date(ts * 1000).toISOString().
    replace(/T/, ' '). 
    replace(/^.*?-/, ''). 
    replace(/:00\..+/, '');
}
function dur2str(d) {
  return humanizeDuration(d*1000);
}
function rate(r) {
  return (r * 60 * 60 * 24 * 7).toFixed(0);
}

async function velo_pool_info(hre) {
  const reg = require("../deploy/registry")(hre);

  let stakingPools = await reg.fetch("pool"); 

  let vToken = 
    await reg.getContract("VELODelegator");

  let TABLE = new AsciiTable("VELO Pools");
  TABLE.setHeading(
    "Label",
    "Start",
    "End",
    "Duration",
    "r(VL/week)",
    "Balance",
    "Staked",
    "ERC20"
  );
  for(label in stakingPools) {
    let vsPool = 
      await reg.getPoolContract(label);

    let startTime = n0(await vsPool.starttime());
    let duration = n0(await vsPool.duration());
    let rewardRate = n18(await vsPool.rewardRate());
    let balance = n18(await vToken.balanceOf(vsPool.address));
    let staked = n18(await vsPool.totalSupply());
    let erc20 = await vsPool.erc20_token();

    TABLE.addRow(label,
      ts2date(startTime),
      ts2date(startTime+duration),
      dur2str(duration),
      rate(rewardRate),
      balance.toFixed(0),
      staked.toFixed(2),
      erc20.substring(1,6) 
    );

  }

  return TABLE.toString();
}


async function velo_rebaser_info(hre) {
  const reg = require("../deploy/registry")(hre);


  let vRebaser = 
    await reg.getContract("VELORebaser");

  let TABLE = new AsciiTable("VELO Rebaser");
  TABLE.setHeading(
    "Label",
    "Value",
  );

  let add_row = async (label, afn) => {
    TABLE.addRow(
      label,
      afn(await vRebaser[label]())  
    );
  };

  await add_row("REBASE_INTERVAL", dur2str);
  await add_row("START_REBASE_AT", ts2date);

  await add_row("sEMA", n18);
  await add_row("fEMA", n18);

  await add_row("velocity", n18);

  await add_row("getRelativeVelocity", n18);

  return TABLE.toString();
}


async function velo_feecharger_info(hre) {
  const reg = require("../deploy/registry")(hre);


  let vRebaser = 
    await reg.getContract("VELOFeeCharger");

  let TABLE = new AsciiTable("VELO FeeCharger");
  TABLE.setHeading(
    "Label",
    "Value",
  );

  let add_row = async (label, afn) => {
    TABLE.addRow(
      label,
      afn(await vRebaser[label]())  
    );
  };

  await add_row("beneficiary", (v) => v);
  await add_row("max_gas_block", (v) => v);
  await add_row("min_gas_tx", (v) => v);
  await add_row("gov_fee_factor", n18);

  return TABLE.toString();
}

module.exports = {
  velo_pool_info,
  velo_rebaser_info,
  velo_feecharger_info};
