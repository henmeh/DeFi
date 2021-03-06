const yieldFarmer = require("./YieldFarmerSC_interaction.js");
const address = require("./addresses");

async function logBalances(_event)
{
    return new Promise(async (resolve, reject) => {
      let myWalletDaiBalance = await yieldFarmer.getBalance(address.dai, address.myAddress);
      let myContractDaiBalance = await yieldFarmer.getBalance(address.dai, address.yieldFarmer);
      let myContractcDaiBalance = await yieldFarmer.getBalance(address.cDai, address.yieldFarmer);
      
      console.log(_event);
      console.log("My Wallet's   DAI Balance:", myWalletDaiBalance);
      console.log("MyContract's  DAI Balance:", myContractDaiBalance);
      console.log("MyContract's  cDAI Balance:", myContractcDaiBalance);
       
      resolve();
    });
  };

async function main() {

    await logBalances("Initial Balances");

    await yieldFarmer.sendFunds("5", address.dai, address.yieldFarmer);
    await logBalances("After first sending to YieldFarmer");

    //await yieldFarmer.compBorrowMaxComp("5", address.dai, address.cDai, "3");
    //await logBalances("After Maximazing for CompTokens");
    
    await yieldFarmer.compLending("5", address.dai, address.cDai);
    await logBalances("After Lending");

    await yieldFarmer.compBorrowSimple(address.cDai);
    await logBalances("After Borrow");

    await yieldFarmer.sendFunds("5", address.dai, address.yieldFarmer);
    await logBalances("After second sending to YieldFarmer");
    
    await yieldFarmer.compRepay(address.dai, address.cDai);
    await logBalances("After Repay");

    await yieldFarmer.compRedeeming(address.cDai);
    await logBalances("After Redeeming");

    await yieldFarmer.getMyFundsBack(address.dai);
    await logBalances("Final Balances");

}

main();


