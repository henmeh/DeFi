const YieldFarmer = artifacts.require("YieldFarmer");

module.exports = function (deployer) {
  deployer.deploy(YieldFarmer, "0x5eae89dc1c671724a672ff0630122ee834098657");
};