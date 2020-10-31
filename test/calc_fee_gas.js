const dtoken = require('./utils/token');

const VELORebaser = artifacts.require("VELORebaser");
const VELOFeeCharger = artifacts.require("VELOFeeCharger");

// helpers
let precision = web3.utils.toBN(10**18);

let to_bn = (v) => web3.utils.toBN(v).mul(precision);
let to_bns = (e) => e.map(to_bn);

let to_number = (bn) => bn.div(precision).toNumber();

contract('calc_fee_gas', ([governance]) => {
  
  before('init tokens and pools', async () => {
    [this.veloToken,] = await dtoken.deploy(governance);
    this.veloRebaser = await VELORebaser.new(this.veloToken.address, 0, 0, {from: governance});
    this.veloFeeCharger = await VELOFeeCharger.new(this.veloToken.address, {from: governance});

    // configure the token
    await this.veloToken.setRebaser(this.veloRebaser.address, {from: governance});
    await this.veloToken.setFeeCharger(this.veloFeeCharger.address, {from: governance});

  });

  it('calculates correct values', async () => {

    // lets feed some values validating
    // correct implementation of the VELO functionality
    // [
    // uint256 max_gas_block,
    // uint256 min_gas_tx,
    // uint256 ema_long,
    // uint256 tx_size,
    // uint256 gov_fee_factor,
    // ]
    //
    let params = [
      [135, 8, 0, 0, 1, 8],
      [135, 8, 0, 10, 1, 8],
      [135, 10, 0, 10, 1, 10],
      [135, 8, 100, 10, 1, 8],
      [135, 8, 100, 10000, 1, 8],
      [135, 8, 100, 1000000, 1, 49],
      [135, 8, 10, 1000000, 1, 8],
      [135, 8, 20, 1000000, 1, 9],
      [135, 8, 50, 1000000, 1, 24],
      [135, 8, 50, 10000000, 1, 66],
      [135, 8, 100, 10000000, 1, 133],
      [135, 8, 100, 10000000, 1, 133],
      [135, 8, 100, 20000000, 1, 135],
      [135, 8, 100, 100000000, 1, 135],
      [135, 8, 100, 200000000, 1, 135],
    ];

    let rs = params.map(to_bns).map(
      async (params) => {

        let [max_gas_block, min_gas_tx, ema_long, tx_size,
             gov_fee_factor, e] = params;

        let r = await this.veloFeeCharger.calc_fee_gas(
          max_gas_block,
          min_gas_tx,
          ema_long,
          tx_size,
          to_bn(100000000),
          gov_fee_factor,
        );

        // transform down a notch (10**18)
	// and round down, which will happen
	// with the conversion to chi tokens
        e = to_number(e);
	r = r.div(precision);
        console.log("expected = %d result = %d", e, r);
        assert.equal(r,e);

      });
    await Promise.all(rs);

  });

  it('handles max_gas_block correctly', async () => {
    let toWei = web3.utils.toWei;

    // let currentBlock = await getCurrentBlock();
    // console.log(currentBlock);

    let charge = async (amount) => { 
      await this.veloFeeCharger
      .chargeFee(
	toWei('100'), // fEMA
	toWei('100'), // sEMA
	toWei('100000000'), // totalSyppy
	toWei(amount.toString()) // amount
      );
    };

    for(i=0;i<100;i++) {
      await charge(i * 1000000);
    }

  });

});

