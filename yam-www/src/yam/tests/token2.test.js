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
  let new_user;
  let user = "0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84";
  beforeAll(async () => {
    const accounts = await velo.web3.eth.getAccounts();
    velo.addAccount(accounts[0]);
    new_user = accounts[1];
    snapshotId = await velo.testing.snapshot();
  });

  beforeEach(async () => {
    await velo.testing.resetEVM("0x2");
  });

  describe("expected fail", () => {
    test("cant transfer from a 0 balance", async () => {
      await velo.testing.expectThrow(velo.contracts.veloV2.methods.transfer(user, "100").send({from: new_user}), "ERC20: transfer amount exceeds balance");
    });
    test("cant transferFrom without allowance", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      await velo.testing.expectThrow(velo.contracts.veloV2.methods.transferFrom(user, new_user, "100").send({from: new_user}), "ERC20: transfer amount exceeds allowance");
    });
    test("!minter", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      await velo.testing.expectThrow(velo.contracts.veloV2.methods.mint(user, "100").send({from: user}), "!minter");
    });
    test("decreaseAllowance from 0", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      await velo.testing.expectThrow(velo.contracts.veloV2.methods.decreaseAllowance(new_user, "100").send({from: user}), "ERC20: decreased allowance below zero");
    });
  });

  describe("non-failing", () => {
    test("name", async () => {
      let name = await velo.contracts.veloV2.methods.name().call();
      expect(name).toBe("VELOv2");
    });
    test("symbol", async () => {
      let symbol = await velo.contracts.veloV2.methods.symbol().call();
      expect(symbol).toBe("VELOv2");
    });
    test("decimals", async () => {
      let decimals = await velo.contracts.veloV2.methods.decimals().call();
      expect(decimals).toBe("24");
    });
    test("totalSupply", async () => {
      let ts = await velo.contracts.veloV2.methods.totalSupply().call();
      expect(ts).toBe("0");
    });
    test("transfer to self doesnt inflate", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      let bal0 = await velo.contracts.veloV2.methods.balanceOf(user).call();
      await velo.contracts.veloV2.methods.transfer(user, "100").send({from: user});
      let bal1 = await velo.contracts.veloV2.methods.balanceOf(user).call();
      expect(bal0).toBe(bal1);
    });
    test("transferFrom works", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      let bal00 = await velo.contracts.veloV2.methods.balanceOf(user).call();
      let bal01 = await velo.contracts.veloV2.methods.balanceOf(new_user).call();
      await velo.contracts.veloV2.methods.approve(new_user, "100").send({from: user});
      await velo.contracts.veloV2.methods.transferFrom(user, new_user, "100").send({from: new_user});
      let bal10 = await velo.contracts.veloV2.methods.balanceOf(user).call();
      let bal11 = await velo.contracts.veloV2.methods.balanceOf(new_user).call();
      expect((velo.toBigN(bal01).plus(velo.toBigN(100))).toString()).toBe(bal11);
      expect((velo.toBigN(bal00).minus(velo.toBigN(100))).toString()).toBe(bal10);
    });
    test("approve", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      await velo.contracts.veloV2.methods.approve(new_user, "100").send({from: user});
      let allowance = await velo.contracts.veloV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("increaseAllowance", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      await velo.contracts.veloV2.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await velo.contracts.veloV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("decreaseAllowance", async () => {
      await velo.contracts.velo.methods.approve(velo.contracts.veloV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await velo.contracts.veloV2migration.methods.migrate().send({from: user});
      await velo.contracts.veloV2.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await velo.contracts.veloV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
      await velo.contracts.veloV2.methods.decreaseAllowance(new_user, "100").send({from: user});
      allowance = await velo.contracts.veloV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0")
    });
  });
});
