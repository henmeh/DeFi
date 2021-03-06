const FlashLoanYieldFarmer = artifacts.require("FlashLoanYieldFarmer");

module.exports = function (deployer) {
  deployer.deploy(FlashLoanYieldFarmer, "0x5eae89dc1c671724a672ff0630122ee834098657", "0xbBdE93962Ca9fe39537eeA7380550ca6845F8db7");
};