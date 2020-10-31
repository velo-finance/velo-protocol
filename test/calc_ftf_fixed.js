const VELORebaser = artifacts.require("VELORebaser");

const dtoken = require('./utils/token');

// helpers
let to_bn = (v) => web3.utils.toBN(v * 10**18);
let to_bns = (e) => e.map(to_bn);

let to_float = (bn) => bn.div(web3.utils.toBN(10**10)).toNumber() / 10**8;

contract('calcFTFixed', ([governance]) => {
  it('calculates correct values', async () => {

    const [veloToken,] = await dtoken.deploy(governance);

    const veloRebaser = await VELORebaser.new(veloToken.address, 0, 0, {from: governance});

    // lets feed some values validating
    // correct implementation of the VELO functionality
    // [v1t,v2t,expected_return]
    let params = [
      // from live test
      [7.61300,6.44100,1.03158953],
      [7.03342,6.02614,1.02715354],
      [6.49797,5.63799,1.02318482],
      [6.00328,5.27485,1.01963985],
      [5.54625,4.93510,1.01647881],
      [5.12401,4.61723,1.01366531],
      [4.73392,4.31983,1.01116616],
      [4.37353,4.04159,1.00895107],
      [4.04057,3.78127,1.00699242],
      [3.73296,3.53772,1.00526508],
      [3.44877,3.30986,1.00374617],
      [3.18622,3.09667,1.00241489],
      [2.94365,2.89721,1.00125233],
      [2.71955,2.71060,1.00024131],
      [2.51251,2.53601,0.99936624],
      [2.32123,2.37267,0.99861297],
      [2.14452,2.21984,0.99796867],
      [1.98126,2.07686,0.99742172],

    ];
    let rs = params.map(to_bns).map(
      async ([v1t,v2t,e]) => {
	let r = await veloRebaser.calcFTFixed(v1t,v2t,to_bn(1.6180339887),to_bn(15));

	// let do some float comparison
	let rf = to_float(r);
	let ef = to_float(e);

	console.log("v1 = %s v2 = %s e = %s r = %s ",
	  to_float(v1t),to_float(v2t),ef,rf);

	expect(rf).to.be.closeTo(ef, 0.00005)
      });
    await Promise.all(rs);
	
  });

});

