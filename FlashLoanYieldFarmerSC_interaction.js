const flashLoanYieldFarmerABI = require("./build/contracts/FlashLoanYieldFarmer.json");
const ICEtherABI = require("./build/contracts/ICEther.json");
const IERC20ABI = require("./build/contracts/IERC20.json");
const address = require("./addresses");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3'); 

// Connecting to the Ethereum Blockchain 
const web3 = new Web3(new HDWalletProvider(address.key, address.https));

// Connecting to my SmartContract for CompoundTrading
const flashLoanYieldFarmer = new web3.eth.Contract(flashLoanYieldFarmerABI.abi, address.flashLoanYieldFarmer);

const settings = {
    gasLimit: 8000000, 
    gasPrice: web3.utils.toWei('50', 'Gwei'),
    from: address.myAddress,
}

module.exports = {
    getBalance: async function(_accountAddress) {
        
        try{
            const balance = await web3.eth.getBalance(_accountAddress);         
            return balance / 1000000000000000000;
        } catch(error) {console.log(error);}
    },

    getcEtherBalance: async function(_accountAddress) {
        try{
            const cEth = new web3.eth.Contract(ICEtherABI.abi, address.cEth);
            const balance = await cEth.methods.balanceOf(_accountAddress).call();         
            return balance / 1000000000000000000;
        } catch(error) {console.log(error);}
    },

    getTokenBalance: async function(_tokenAddress, _accountAddress) {
        try{
            const token = new web3.eth.Contract(IERC20ABI.abi, _tokenAddress);
            const balance = await token.methods.balanceOf(_accountAddress).call();         
            return balance / 1000000000000000000;
        } catch(error) {console.log(error);}
    },

    sendFunds: async function(_amount, _tokenAddress, _recipient) {
        try{
            const sendingAmount = web3.utils.toWei(_amount, "ether");
            const token = new web3.eth.Contract(IERC20ABI.abi, _tokenAddress);
            const sending = await token.methods.transfer(_recipient, sendingAmount).send(settings);
            return sending;
        }catch(error) {console.log(error);}
    },

    sendEth: async function(_accountAddress, _contractAddress, _amount) {
        try{
            const sending = await web3.eth.sendTransaction({
                from: _accountAddress,
                to: _contractAddress,
                value: web3.utils.toWei(_amount, "ether")
            })
            return sending;
        } catch(error) {console.log(error);}
    },

    lending: async function(_amount, _cEtherAddress) {
        try{
            const lendingAmount = web3.utils.toWei(_amount, "ether");
            const lending = await flashLoanYieldFarmer.methods.lendEth(_cEtherAddress).send({gasLimit: 8000000, gasPrice: web3.utils.toWei('50', 'Gwei'), from: address.myAddress, value: lendingAmount});
            return lending;
        }catch(error) {console.log(error);}
    },

    redeeming: async function(_cEtherAddress) {
        try{
            const redeeming = await flashLoanYieldFarmer.methods.redeemEth(_cEtherAddress).send(settings);
            return redeeming;
        }catch(error) {console.log(error);}
    },

    compBorrowTokenSimple: async function(_cEtherAddress, _cTokenAddress) {
        try{
            const borrow = await flashLoanYieldFarmer.methods.borrowTokenSimple(_cEtherAddress, _cTokenAddress).send(settings);
            return borrow;
        }catch(error) {console.log(error);}
    },

    compBorrowEthSimple: async function(_amount,_cEtherAddress) {
        try{
            const borrowAmount = web3.utils.toWei(_amount, "ether");
            const borrow = await flashLoanYieldFarmer.methods.borrowEthSimple(borrowAmount, _cEtherAddress).send(settings);
            return borrow;
        }catch(error) {console.log(error);}
    },

    compTokenRepay: async function(_cTokenAddress, _tokenAddress) {
        try{
            const repay = await flashLoanYieldFarmer.methods.repayToken(_cTokenAddress, _tokenAddress).send(settings);
            return repay;
        }catch(error){console.log(error);}
    },

    compEthRepay: async function(_cEtherAddress) {
        try{
            const interestAmount = web3.utils.toWei("0.3", "ether");
            const repay = await flashLoanYieldFarmer.methods.repayEther(_cEtherAddress).send({gasLimit: 8000000, gasPrice: web3.utils.toWei('50', 'Gwei'), from: address.myAddress, value: interestAmount});;
            return repay;
        }catch(error){console.log(error);}
    },

    getMyEthBack: async function() {
        try{
            const sending = await flashLoanYieldFarmer.methods.sendEth().send(settings);
            return sending;
        }catch(error) {console.log(error);}
    },

    getMyFundsBack: async function(_tokenAddress) {
        try{
            const sending = await flashLoanYieldFarmer.methods.sendFunds(_tokenAddress).send(settings);
            return sending;
        }catch(error) {console.log(error);}
    }
}