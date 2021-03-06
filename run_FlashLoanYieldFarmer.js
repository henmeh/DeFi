const flashLoanYieldFarmer = require("./FlashLoanYieldFarmerSC_interaction.js");
const address = require("./addresses");

async function logBalances(_event)
{
    return new Promise(async (resolve, reject) => {
      let myWalletBalance = await flashLoanYieldFarmer.getBalance(address.myAddress);
      let myContractEthBalance = await flashLoanYieldFarmer.getBalance(address.flashLoanYieldFarmer);
      let myContractDaiBalance = await flashLoanYieldFarmer.getTokenBalance(address.dai, address.flashLoanYieldFarmer);
      let myWalletDaiBalance = await flashLoanYieldFarmer.getTokenBalance(address.dai, address.myAddress);
      let myContractcEthBalance = await flashLoanYieldFarmer.getcEtherBalance(address.flashLoanYieldFarmer);
      let myContractcDaiBalance = await flashLoanYieldFarmer.getTokenBalance(address.cDai, address.flashLoanYieldFarmer);
      
      console.log(_event);
      console.log("My Wallet's   Eth Balance:", myWalletBalance);
      console.log("My Wallet's   Dai Balance:", myWalletDaiBalance);
      console.log("MyContract's  Eth Balance:", myContractEthBalance);
      console.log("MyContract's  cEth Balance:", myContractcEthBalance);
      console.log("MyContract's  Dai Balance:", myContractDaiBalance);
      console.log("MyContract's  cDai Balance:", myContractcDaiBalance); 

      resolve();
    });
  };

async function main() {

    await logBalances("Initial Balances");

    await flashLoanYieldFarmer.lending("0.1", address.cEth);
    await logBalances("After Lending");
      
    //await flashLoanYieldFarmer.compBorrowTokenSimple(address.cEth, address.cDai);
    //await logBalances("After Borrow");

    await flashLoanYieldFarmer.compBorrowEthSimple("0.05", address.cEth);
    await logBalances("After Borrow");

    //await flashLoanYieldFarmer.sendFunds("1", address.dai, address.flashLoanYieldFarmer);
    //await logBalances("After second sending to YieldFarmer");
    
    //await flashLoanYieldFarmer.compTokenRepay(address.cDai, address.dai);
    //await logBalances("After Repay");

    await flashLoanYieldFarmer.compEthRepay(address.cEth);
    await logBalances("After Repay");

    await flashLoanYieldFarmer.redeeming(address.cEth);
    await logBalances("After Redeeming");

    await flashLoanYieldFarmer.getMyEthBack();
    //await flashLoanYieldFarmer.getMyFundsBack(address.dai);
    await logBalances("Final Balances");

}

main();