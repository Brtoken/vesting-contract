const TestERC20 = artifacts.require("../contracts/TestERC20.sol");
const Vesting = artifacts.require("./Vesting.sol");

const toBN = web3.utils.toBN;

module.exports = async function (deployer, accounts) {
  const advisor = "0x2Ca91f02747d139b228DfF8e35B8D02aa276C93a";
  const brToken = "0x03476207EF6791CB0D021C5F9225bB9d70BC5fb5";
  await deployer.deploy(Vesting, brToken, advisor, {gas: 5000000});  

  console.log("Vesting: ", Vesting.address)
};
