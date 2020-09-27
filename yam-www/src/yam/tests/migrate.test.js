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
    defaultGasPrice: "1000000000000",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("token_tests", () => {
  let snapshotId;
  let user = "0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84";
  let new_user;
  beforeAll(async () => {
    const accounts = await velo.web3.eth.getAccounts();
    velo.addAccount(accounts[0]);
    new_user = accounts[1];
    snapshotId = await velo.testing.snapshot();
  });

  beforeEach(async () => {
    await velo.testing.resetEVM("0x2");
  });

  // describe("expected fail", () => {
  //   test("before start", async () => {
  //     await velo.testing.resetEVM("0x2");
  //     let startTime = await velo.contracts.veloV2migration.methods.startTime().call();
  //     let timeNow = velo.toBigN((await velo.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = velo.toBigN(startTime).minus(timeNow);
  //     if (waitTime <= 0) {
  //       // this test is hard to run on ganache as there is no easy way to
  //       // ensure that another test hasnt increased the time already
  //       console.log("WARNING: TEST CANNOT OCCUR DUE TO GANACHE TIMING");
  //     } else {
  //       await velo.testing.expectThrow(velo.contracts.veloV2migration.methods.migrate().send({from: user}), "!started");
  //     }
  //   });
  //   test("user 0 balance", async () => {
  //     // fast forward to startTime
  //     let startTime = await velo.contracts.veloV2migration.methods.startTime().call();
  //     let timeNow = velo.toBigN((await velo.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = velo.toBigN(startTime).minus(timeNow);
  //     if (waitTime.toNumber() > 0) {
  //       await velo.testing.increaseTime(waitTime.toNumber());
  //     }
  //     await velo.testing.expectThrow(velo.contracts.veloV2migration.methods.migrate().send({from: new_user}), "No velos");
  //   });
  //   test("after end", async () => {
  //     // increase time
  //     let startTime = await velo.contracts.veloV2migration.methods.startTime().call();
  //     let migrationDuration = await velo.contracts.veloV2migration.methods.migrationDuration().call();
  //     let timeNow = velo.toBigN((await velo.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = velo.toBigN(startTime).plus(velo.toBigN(migrationDuration)).minus(timeNow);
  //     if (waitTime.toNumber() > 0) {
  //       await velo.testing.increaseTime(waitTime.toNumber());
  //     }
  //     // expect fail
  //     await velo.testing.expectThrow(velo.contracts.veloV2migration.methods.migrate().send({from: user}), "migration ended");
  //   });
  //   test("double migrate", async () => {
  //     await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
  //     await velo.contracts.veloV2migration.methods.migrate().send({from: user, gas: 1000000});
  //     let velo_bal = velo.toBigN(await velo.contracts.velo.methods.balanceOfUnderlying(user).call()).toNumber();
  //     await velo.testing.expectThrow(velo.contracts.veloV2migration.methods.migrate().send({from: user, gas: 1000000}), "No velos");
  //   });
  // });

  describe("non-failing", () => {
    test("zeros balance", async () => {
      let startTime = await velo.contracts.veloV2migration.methods.startTime().call();
      let timeNow = velo.toBigN((await velo.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = velo.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await velo.testing.increaseTime(waitTime.toNumber());
      }
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user, gas: 1000000});
      let velo_bal = velo.toBigN(await velo.contracts.velo.methods.balanceOf(user).call()).toNumber();
      expect(velo_bal).toBe(0);
    });
    test("v2 balance equal to v1 underlying balance", async () => {
      let startTime = await velo.contracts.veloV2migration.methods.startTime().call();
      let timeNow = velo.toBigN((await velo.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = velo.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await velo.testing.increaseTime(waitTime.toNumber());
      }
      let velo_bal = velo.toBigN(await velo.contracts.velo.methods.balanceOfUnderlying(user).call());
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user, gas: 1000000});
      let veloV2_bal = velo.toBigN(await velo.contracts.veloV2.methods.balanceOf(user).call());
      expect(velo_bal.toString()).toBe(veloV2_bal.toString());
    });
    test("totalSupply increase equal to velo_underlying_bal", async () => {
      let startTime = await velo.contracts.veloV2migration.methods.startTime().call();
      let timeNow = velo.toBigN((await velo.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = velo.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await velo.testing.increaseTime(waitTime.toNumber());
      }
      let velo_underlying_bal = velo.toBigN(await velo.contracts.velo.methods.balanceOfUnderlying(user).call());
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user, gas: 1000000});
      let veloV2_ts = velo.toBigN(await velo.contracts.veloV2.methods.totalSupply().call());
      expect(veloV2_ts.toString()).toBe(velo_underlying_bal.toString());
    });
  });
});
