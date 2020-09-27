import {
  Yam
} from "../index.js";
import * as Types from "../lib/types.js";
import {
  addressMap
} from "../lib/constants.js";
import {
  decimalToString,
  stringToDecimal
} from "../lib/Helpers.js"


export const velo = new Yam(
  "http://localhost:8545/",
  // "http://127.0.0.1:9545/",
  "1001",
  true, {
    defaultAccount: "",
    defaultConfirmations: 1,
    autoGasMultiplier: 1.5,
    testing: false,
    defaultGas: "6000000",
    defaultGasPrice: "1",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("Distribution", () => {
  let snapshotId;
  let user;
  let user2;
  let ycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let uni_ampl_account = "0x8c545be506a335e24145edd6e01d2754296ff018";
  let comp_account = "0xc89b6f0146642688bb254bf93c28fccf1e182c81";
  let lend_account = "0x3b08aa814bea604917418a9f0907e7fc430e742c";
  let link_account = "0xbe6977e08d4479c0a6777539ae0e8fa27be4e9d6";
  let mkr_account = "0xf37216a8ac034d08b4663108d7532dfcb44583ed";
  let snx_account = "0xb696d629cd0a00560151a434f6b4478ad6c228d7"
  let yfi_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  beforeAll(async () => {
    const accounts = await velo.web3.eth.getAccounts();
    velo.addAccount(accounts[0]);
    user = accounts[0];
    velo.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await velo.testing.snapshot();
  });

  beforeEach(async () => {
    await velo.testing.resetEVM("0x2");
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await velo.testing.resetEVM("0x2");
      let a = await velo.web3.eth.getBlock('latest');

      let starttime = await velo.contracts.eth_pool.methods.starttime().call();

      expect(velo.toBigN(a["timestamp"]).toNumber()).toBeLessThan(velo.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
      await velo.contracts.weth.methods.approve(velo.contracts.eth_pool.options.address, -1).send({from: user});

      await velo.testing.expectThrow(
        velo.contracts.eth_pool.methods.stake(
          velo.toBigN(200).times(velo.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await velo.web3.eth.getBlock('latest');

      starttime = await velo.contracts.ampl_pool.methods.starttime().call();

      expect(velo.toBigN(a["timestamp"]).toNumber()).toBeLessThan(velo.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);

      await velo.contracts.UNIAmpl.methods.approve(velo.contracts.ampl_pool.options.address, -1).send({from: user});

      await velo.testing.expectThrow(velo.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      await velo.testing.resetEVM("0x2");
      let a = await velo.web3.eth.getBlock('latest');

      await velo.contracts.weth.methods.transfer(user, velo.toBigN(2000).times(velo.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await velo.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
        from: uni_ampl_account
      });

      let starttime = await velo.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await velo.testing.increaseTime(waittime);
      }

      await velo.contracts.weth.methods.approve(velo.contracts.eth_pool.options.address, -1).send({from: user});

      await velo.contracts.eth_pool.methods.stake(
        velo.toBigN(200).times(velo.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await velo.contracts.UNIAmpl.methods.approve(velo.contracts.ampl_pool.options.address, -1).send({from: user});

      await velo.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await velo.testing.expectThrow(velo.contracts.ampl_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await velo.testing.expectThrow(velo.contracts.eth_pool.methods.withdraw(
        velo.toBigN(201).times(velo.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await velo.testing.resetEVM("0x2");

      await velo.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: ycrv_account
      });

      await velo.contracts.weth.methods.transfer(user, velo.toBigN(2000).times(velo.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await velo.web3.eth.getBlock('latest');

      let starttime = await velo.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await velo.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
      }

      await velo.contracts.weth.methods.approve(velo.contracts.eth_pool.options.address, -1).send({from: user});

      await velo.contracts.eth_pool.methods.stake(
        "2000000000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      let earned = await velo.contracts.eth_pool.methods.earned(user).call();

      let rr = await velo.contracts.eth_pool.methods.rewardRate().call();

      let rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();
      //console.log(earned, rr, rpt);
      await velo.testing.increaseTime(86400);
      // await velo.testing.mineBlock();

      earned = await velo.contracts.eth_pool.methods.earned(user).call();

      rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await velo.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

      console.log("velo bal", velo_bal)
      // start rebasing
        //console.log("approve velo")
        await velo.contracts.velo.methods.approve(
          velo.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve ycrv")
        await velo.contracts.ycrv.methods.approve(
          velo.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let ycrv_bal = await velo.contracts.ycrv.methods.balanceOf(user).call()

        console.log("ycrv_bal bal", ycrv_bal)

        console.log("add liq/ create pool")
        await velo.contracts.uni_router.methods.addLiquidity(
          velo.contracts.velo.options.address,
          velo.contracts.ycrv.options.address,
          velo_bal,
          velo_bal,
          velo_bal,
          velo_bal,
          user,
          1596740361 + 10000000
        ).send({
          from: user,
          gas: 8000000
        });

        let pair = await velo.contracts.uni_fact.methods.getPair(
          velo.contracts.velo.options.address,
          velo.contracts.ycrv.options.address
        ).call();

        velo.contracts.uni_pair.options.address = pair;
        let bal = await velo.contracts.uni_pair.methods.balanceOf(user).call();

        await velo.contracts.uni_pair.methods.approve(
          velo.contracts.ycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await velo.contracts.ycrv_pool.methods.starttime().call();

        a = await velo.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime)
        }

        await velo.contracts.ycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await velo.contracts.ampl_pool.methods.earned(user).call();

        rr = await velo.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await velo.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await velo.testing.increaseTime(625000 + 1000);

        earned = await velo.contracts.ampl_pool.methods.earned(user).call();

        rr = await velo.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await velo.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await velo.contracts.ycrv_pool.methods.exit().send({from: user, gas: 400000});

        velo_bal = await velo.contracts.velo.methods.balanceOf(user).call();


        expect(velo.toBigN(velo_bal).toNumber()).toBeGreaterThan(0)
        console.log("velo bal after staking in pool 2", velo_bal);
    });
  });

  describe("ampl", () => {
    test("rewards from pool 1s ampl", async () => {
        await velo.testing.resetEVM("0x2");

        await velo.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
          from: uni_ampl_account
        });
        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          //console.log("missed entry");
        }

        await velo.contracts.UNIAmpl.methods.approve(velo.contracts.ampl_pool.options.address, -1).send({from: user});

        await velo.contracts.ampl_pool.methods.stake(
          "5000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.ampl_pool.methods.earned(user).call();

        let rr = await velo.contracts.ampl_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.ampl_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.ampl_pool.methods.earned(user).call();

        rpt = await velo.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        // let k = await velo.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // //console.log(k.events)

        // weth_bal = await velo.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(velo.toBigN(2000).times(velo.toBigN(10**18)).toString())

        let ampl_bal = await velo.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await velo.testing.resetEVM("0x2");

        await velo.contracts.weth.methods.transfer(user, velo.toBigN(2000).times(velo.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.weth.methods.approve(velo.contracts.eth_pool.options.address, -1).send({from: user});

        await velo.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.eth_pool.methods.earned(user).call();

        let rr = await velo.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.eth_pool.methods.earned(user).call();

        rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await velo.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await velo.testing.resetEVM("0x2");

        await velo.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await velo.contracts.weth.methods.transfer(user, velo.toBigN(2000).times(velo.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.weth.methods.approve(velo.contracts.eth_pool.options.address, -1).send({from: user});

        await velo.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.eth_pool.methods.earned(user).call();

        let rr = await velo.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(125000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.eth_pool.methods.earned(user).call();

        rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await velo.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        console.log("velo bal", velo_bal)
        // start rebasing
          //console.log("approve velo")
          await velo.contracts.velo.methods.approve(
            velo.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await velo.contracts.ycrv.methods.approve(
            velo.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await velo.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          console.log("add liq/ create pool")
          await velo.contracts.uni_router.methods.addLiquidity(
            velo.contracts.velo.options.address,
            velo.contracts.ycrv.options.address,
            velo_bal,
            velo_bal,
            velo_bal,
            velo_bal,
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await velo.contracts.uni_fact.methods.getPair(
            velo.contracts.velo.options.address,
            velo.contracts.ycrv.options.address
          ).call();

          velo.contracts.uni_pair.options.address = pair;
          let bal = await velo.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000000000000",
            100000,
            [
              velo.contracts.ycrv.options.address,
              velo.contracts.velo.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
            100000,
            [
              velo.contracts.ycrv.options.address,
              velo.contracts.velo.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await velo.testing.increaseTime(43200);

          //console.log("init twap")
          await velo.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              velo.contracts.ycrv.options.address,
              velo.contracts.velo.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await velo.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await velo.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000000",
            100000,
            [
              velo.contracts.ycrv.options.address,
              velo.contracts.velo.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await velo.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await velo.contracts.velo.methods.balanceOf(user).call();

          a = await velo.web3.eth.getBlock('latest');

          let offset = await velo.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = velo.toBigN(offset).toNumber();
          let interval = await velo.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = velo.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await velo.testing.increaseTime(i);

          let r = await velo.contracts.uni_pair.methods.getReserves().call();
          let q = await velo.contracts.uni_router.methods.quote(velo.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await velo.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await velo.contracts.velo.methods.balanceOf(user).call();

          let resVELO = await velo.contracts.velo.methods.balanceOf(velo.contracts.reserves.options.address).call();

          let resycrv = await velo.contracts.ycrv.methods.balanceOf(velo.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(velo.toBigN(bal).toNumber()).toBeLessThan(velo.toBigN(bal1).toNumber());
          // increases reserves
          expect(velo.toBigN(resycrv).toNumber()).toBeGreaterThan(0);

          r = await velo.contracts.uni_pair.methods.getReserves().call();
          q = await velo.contracts.uni_router.methods.quote(velo.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(velo.toBigN(q).toNumber()).toBeGreaterThan(velo.toBigN(10**18).toNumber());


        await velo.testing.increaseTime(525000 + 100);


        j = await velo.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await velo.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(
          velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await velo.testing.resetEVM("0x2");

        await velo.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await velo.contracts.weth.methods.transfer(user, velo.toBigN(2000).times(velo.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.weth.methods.approve(velo.contracts.eth_pool.options.address, -1).send({from: user});

        await velo.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.eth_pool.methods.earned(user).call();

        let rr = await velo.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(125000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.eth_pool.methods.earned(user).call();

        rpt = await velo.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await velo.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        console.log("velo bal", velo_bal)
        // start rebasing
          //console.log("approve velo")
          await velo.contracts.velo.methods.approve(
            velo.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await velo.contracts.ycrv.methods.approve(
            velo.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await velo.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          velo_bal = velo.toBigN(velo_bal);
          console.log("add liq/ create pool")
          await velo.contracts.uni_router.methods.addLiquidity(
            velo.contracts.velo.options.address,
            velo.contracts.ycrv.options.address,
            velo_bal.times(.1).toString(),
            velo_bal.times(.1).toString(),
            velo_bal.times(.1).toString(),
            velo_bal.times(.1).toString(),
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await velo.contracts.uni_fact.methods.getPair(
            velo.contracts.velo.options.address,
            velo.contracts.ycrv.options.address
          ).call();

          velo.contracts.uni_pair.options.address = pair;
          let bal = await velo.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              velo.contracts.velo.options.address,
              velo.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              velo.contracts.velo.options.address,
              velo.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await velo.testing.increaseTime(43200);

          //console.log("init twap")
          await velo.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              velo.contracts.velo.options.address,
              velo.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await velo.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await velo.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await velo.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
            100000,
            [
              velo.contracts.velo.options.address,
              velo.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await velo.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await velo.contracts.velo.methods.balanceOf(user).call();

          a = await velo.web3.eth.getBlock('latest');

          let offset = await velo.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = velo.toBigN(offset).toNumber();
          let interval = await velo.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = velo.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await velo.testing.increaseTime(i);

          let r = await velo.contracts.uni_pair.methods.getReserves().call();
          let q = await velo.contracts.uni_router.methods.quote(velo.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await velo.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await velo.contracts.velo.methods.balanceOf(user).call();

          let resVELO = await velo.contracts.velo.methods.balanceOf(velo.contracts.reserves.options.address).call();

          let resycrv = await velo.contracts.ycrv.methods.balanceOf(velo.contracts.reserves.options.address).call();

          expect(velo.toBigN(bal1).toNumber()).toBeLessThan(velo.toBigN(bal).toNumber());
          expect(velo.toBigN(resycrv).toNumber()).toBe(0);

          r = await velo.contracts.uni_pair.methods.getReserves().call();
          q = await velo.contracts.uni_router.methods.quote(velo.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(velo.toBigN(q).toNumber()).toBeLessThan(velo.toBigN(10**18).toNumber());


        await velo.testing.increaseTime(525000 + 100);


        j = await velo.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await velo.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(
          velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await velo.testing.resetEVM("0x2");
        await velo.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.yfi.methods.approve(velo.contracts.yfi_pool.options.address, -1).send({from: user});

        await velo.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.yfi_pool.methods.earned(user).call();

        let rr = await velo.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.yfi_pool.methods.earned(user).call();

        rpt = await velo.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await velo.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("comp", () => {
    test("rewards from pool 1s comp", async () => {
        await velo.testing.resetEVM("0x2");
        await velo.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
          from: comp_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.comp_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.comp.methods.approve(velo.contracts.comp_pool.options.address, -1).send({from: user});

        await velo.contracts.comp_pool.methods.stake(
          "50000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.comp_pool.methods.earned(user).call();

        let rr = await velo.contracts.comp_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.comp_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.comp_pool.methods.earned(user).call();

        rpt = await velo.contracts.comp_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.comp_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await velo.contracts.comp.methods.balanceOf(user).call()

        expect(weth_bal).toBe("50000000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await velo.testing.resetEVM("0x2");
        await velo.web3.eth.sendTransaction({from: user2, to: lend_account, value : velo.toBigN(100000*10**18).toString()});

        await velo.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.lend.methods.approve(velo.contracts.lend_pool.options.address, -1).send({from: user});

        await velo.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.lend_pool.methods.earned(user).call();

        let rr = await velo.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.lend_pool.methods.earned(user).call();

        rpt = await velo.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await velo.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await velo.testing.resetEVM("0x2");

        await velo.web3.eth.sendTransaction({from: user2, to: link_account, value : velo.toBigN(100000*10**18).toString()});

        await velo.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.link.methods.approve(velo.contracts.link_pool.options.address, -1).send({from: user});

        await velo.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.link_pool.methods.earned(user).call();

        let rr = await velo.contracts.link_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.link_pool.methods.earned(user).call();

        rpt = await velo.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await velo.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("mkr", () => {
    test("rewards from pool 1s mkr", async () => {
        await velo.testing.resetEVM("0x2");
        await velo.web3.eth.sendTransaction({from: user2, to: mkr_account, value : velo.toBigN(100000*10**18).toString()});
        let eth_bal = await velo.web3.eth.getBalance(mkr_account);

        await velo.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
          from: mkr_account
        });

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.mkr_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.mkr.methods.approve(velo.contracts.mkr_pool.options.address, -1).send({from: user});

        await velo.contracts.mkr_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.mkr_pool.methods.earned(user).call();

        let rr = await velo.contracts.mkr_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.mkr_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.mkr_pool.methods.earned(user).call();

        rpt = await velo.contracts.mkr_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.mkr_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await velo.contracts.mkr.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await velo.testing.resetEVM("0x2");

        await velo.web3.eth.sendTransaction({from: user2, to: snx_account, value : velo.toBigN(100000*10**18).toString()});

        let snx_bal = await velo.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await velo.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await velo.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await velo.web3.eth.getBlock('latest');

        let starttime = await velo.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await velo.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await velo.contracts.snx.methods.approve(velo.contracts.snx_pool.options.address, -1).send({from: user});

        await velo.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await velo.contracts.snx_pool.methods.earned(user).call();

        let rr = await velo.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await velo.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await velo.testing.increaseTime(625000 + 100);
        // await velo.testing.mineBlock();

        earned = await velo.contracts.snx_pool.methods.earned(user).call();

        rpt = await velo.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await velo.contracts.velo.methods.velosScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let velo_bal = await velo.contracts.velo.methods.balanceOf(user).call()

        let j = await velo.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await velo.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let velo_bal2 = await velo.contracts.velo.methods.balanceOf(user).call()

        let two_fity = velo.toBigN(250).times(velo.toBigN(10**3)).times(velo.toBigN(10**18))
        expect(velo.toBigN(velo_bal2).minus(velo.toBigN(velo_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
