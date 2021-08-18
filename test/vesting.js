/* Contracts in this test */

const TestERC20 = artifacts.require("../contracts/TestERC20.sol");
const Vesting = artifacts.require("./Vesting.sol");

const toBN = web3.utils.toBN;

contract("Vesting Test", (accounts) => {
  const OVERFLOW_NUMBER = toBN(2, 10).pow(toBN(256, 10)).sub(toBN(1, 10));

  const owner = accounts[0];
  const advisor = accounts[1];

  let vesting;
  let bRTK;

  before(async () => {
    bRTK = await TestERC20.new();

    vesting = await Vesting.new(bRTK.address, advisor, {gas: 5000000});

    await bRTK.transfer(advisor, toBN(100 * (10 ** 18)));
  });

  describe('BRtk lock', () => {
    it('vesting addresses', async () => {
      assert.equal(await vesting.bRTK(), bRTK.address);
      assert.equal(await vesting.advisor(), advisor);
    })

    it('lock brtk success', async () => {
      const depositAmount = 10 * (10 ** 18);
      await bRTK.approve(vesting.address, toBN(depositAmount), {from: advisor});
      await vesting.lock(toBN(depositAmount), {from: advisor});

      assert.equal(Number(await vesting.vestingAmount()), Number(toBN(depositAmount)));
    })

    it('check unlocked', async () => {
      assert.equal(Number(await vesting.unlockedAmount({from: advisor})), Number(toBN(0)));
      for (let i = 0; i < 100; i ++) {
        await web3.eth.sendTransaction({from: owner, to: advisor, value: 1});
      }

      assert.equal(Number(await vesting.unlockedAmount({from: advisor})), Number(toBN(0)));

      for (let i = 0; i < 80; i ++) {
        await web3.eth.sendTransaction({from: owner, to: advisor, value: 1});
      }

      assert.equal(Number(await vesting.unlockedAmount({from: advisor})), Number(toBN(25 * (10 ** 17))));

      await vesting.withdraw({from: advisor});
      const releasedAmount = await vesting.releasedAmount();

      assert.equal(Number(releasedAmount), Number(toBN(25 * (10 ** 17))));
      assert.equal(Number(await bRTK.balanceOf(advisor)), Number(toBN(925 * (10 ** 17))));

      for (let i = 0; i < 90; i ++) {
        await web3.eth.sendTransaction({from: owner, to: advisor, value: 1});
      }
      assert.equal(Number(await vesting.unlockedAmount({from: advisor})), Number(toBN(50 * (10 ** 17))));

      for (let i = 0; i < 90; i ++) {
        await web3.eth.sendTransaction({from: owner, to: advisor, value: 1});
      }
      assert.equal(Number(await vesting.unlockedAmount({from: advisor})), Number(toBN(75 * (10 ** 17))));

      try {
        await vesting.withdraw();
      } catch (e) {
        assert.equal(e.reason, "Vesting: INSUFFICIENT_PERMISSION");
      }
      
      await vesting.withdraw({from: advisor});

      assert.equal(Number(await vesting.releasedAmount()), Number(toBN(75 * (10 ** 17))));
      assert.equal(Number(await bRTK.balanceOf(advisor)), Number(toBN(975 * (10 ** 17))));

      for (let i = 0; i < 90; i ++) {
        await web3.eth.sendTransaction({from: owner, to: advisor, value: 1});
      }
      assert.equal(Number(await vesting.unlockedAmount({from: advisor})), Number(toBN(100 * (10 ** 17))));

      await vesting.withdraw({from: advisor});

      assert.equal(Number(await vesting.releasedAmount()), Number(toBN(100 * (10 ** 17))));
      assert.equal(Number(await bRTK.balanceOf(advisor)), Number(toBN(1000 * (10 ** 17))));
    })
  });
});