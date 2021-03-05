const yieldFarmerABI = require("./build/contracts/YieldFarmer.json");
const IERC20ABI = require("./build/contracts/IERC20.json");
const address = require("./addresses");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3'); 

// Connecting to the Ethereum Blockchain 
const web3 = new Web3(new HDWalletProvider(address.key, address.https));

// Connecting to my SmartContract for CompoundTrading
const yieldFarmer = new web3.eth.Contract(yieldFarmerABI.abi, address.yieldFarmer);

const settings = {
    gasLimit: 8000000, 
    gasPrice: web3.utils.toWei('50', 'Gwei'),
    from: address.myAddress
}

module.exports = {
    getBalance: async function(_tokenAddress, _accountAddress) {
        
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

    compLending: async function(_amount, _tokenAddress, _cTokenAddress) {
        try{
            const lendingAmount = web3.utils.toWei(_amount, "ether");
            const lending = await yieldFarmer.methods.lend(lendingAmount, _tokenAddress, _cTokenAddress).send(settings);
            return lending;
        } catch(error) {console.log(error);}
    },

    compRedeeming: async function(_cTokenAddress) {
        try{
            const redeeming = await yieldFarmer.methods.redeemFunds(_cTokenAddress).send(settings);
            return redeeming;
        }catch(error) {console.log(error);}
    },

    compBorrowSimple: async function(_cTokenAddress) {
        try{
            const borrow = await yieldFarmer.methods.borrowSimple(_cTokenAddress).send(settings);
            return borrow;
        }catch(error) {console.log(error);}
    },

    compBorrowMaxComp: async function(_amount, _tokenAddress, _cTokenAddress, _loops) {
        try{
            const initialAmount = web3.utils.toWei(_amount, "ether");
            const maxcomp = await yieldFarmer.methods.borrowMaxComp(initialAmount, _tokenAddress, _cTokenAddress, _loops).send(settings);
            return maxcomp;
        }catch(error) {console.log(error);}
    },

    compRepay: async function(_tokenAddress, _cTokenAddress) {
        try{
            const repay = await yieldFarmer.methods.repay(_tokenAddress, _cTokenAddress).send(settings);
            return repay;
        }catch(error){console.log(error);}
    },

    getMyFundsBack: async function(_tokenAddress) {
        try{
            const sending = await yieldFarmer.methods.sendFunds(_tokenAddress).send(settings);
            return sending;
        }catch(error) {console.log(error);}
    }
}