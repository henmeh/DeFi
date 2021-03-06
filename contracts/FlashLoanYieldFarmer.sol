pragma solidity 0.5.12;

import "@studydefi/money-legos/compound/contracts/IComptroller.sol";
import "@studydefi/money-legos/compound/contracts/ICompoundPriceOracle.sol";
import "@studydefi/money-legos/compound/contracts/ICEther.sol";
import "@studydefi/money-legos/compound/contracts/ICToken.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract FlashLoanYieldFarmer {
    using SafeMath for uint;
    event MyLog(string, uint);
    
    address owner;
    IComptroller comptroller;
    ICompoundPriceOracle priceOracle;


    constructor(address _comptroller, address _priceOracle) public {
        owner = msg.sender;
        comptroller = IComptroller(_comptroller);
        priceOracle = ICompoundPriceOracle(_priceOracle);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function() external payable {}

    function lendEth(address _cEtherAddress) public payable onlyOwner {
            ICEther(_cEtherAddress).mint.value(msg.value)();
    }

    function redeemEth(address _cEtherAddress) public onlyOwner returns(bool){
            uint _amount = ICEther(_cEtherAddress).balanceOf(address(this));
            uint _redeemResult = ICEther(_cEtherAddress).redeem(_amount);
            require(_redeemResult == 0, "redeemResult error");
            emit MyLog("If this is not 0, there was an error", _redeemResult);
            return true;
    }

    function sendEth() public onlyOwner {
        uint _balance = address(this).balance;
        msg.sender.transfer(_balance);
    }

    function sendFunds(address _tokenAddress) public onlyOwner {
        uint _balance = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).approve(address(this), _balance);
        ICToken(_tokenAddress).transfer(msg.sender, _balance);
    }

    function borrowTokenSimple(address _cEtherAddress, address _cTokenAddress) public onlyOwner returns(uint){        
        // Enter markets to use the token as collateral
        address[] memory _markets = new address[](1);
        _markets[0] = _cEtherAddress;
        uint[] memory _enterMarkets = comptroller.enterMarkets(_markets);
        
        // Get my account's total liquidity value in Compound
        (uint _error, uint _liquidity, uint _shortfall) = comptroller
            .getAccountLiquidity(address(this));
        if (_error != 0) {
            revert("Comptroller.getAccountLiquidity failed.");
        }
        require(_shortfall == 0, "account underwater");
        require(_liquidity > 0, "account has excess collateral");

        uint underlyingPrice = priceOracle.getUnderlyingPrice(_cTokenAddress);
        uint maxBorrow = _liquidity / underlyingPrice;
        uint toBorrow = (maxBorrow * 5) / 10;

        uint _borrowResult = ICToken(_cTokenAddress).borrow(toBorrow * 1000000000000000000);
        return _borrowResult; 
    }

    function borrowEthSimple(uint _amount, address _cEtherAddress) public onlyOwner returns(uint){        
        // Enter markets to use the token as collateral
        address[] memory _markets = new address[](1);
        _markets[0] = _cEtherAddress;
        uint[] memory _enterMarkets = comptroller.enterMarkets(_markets);
        
        // Get my account's total liquidity value in Compound
        (uint _error, uint _liquidity, uint _shortfall) = comptroller
            .getAccountLiquidity(address(this));
        if (_error != 0) {
            revert("Comptroller.getAccountLiquidity failed.");
        }
        require(_shortfall == 0, "account underwater");
        require(_liquidity > 0, "account has excess collateral");
        
        uint underlyingPrice = priceOracle.getUnderlyingPrice(_cEtherAddress);
        uint maxBorrow = (_liquidity / underlyingPrice) * 1000000000000000000;
        uint toBorrow = (maxBorrow * 5) / 10;
        
        uint _borrowResult = ICEther(_cEtherAddress).borrow(_amount);
        return _borrowResult; 
    }


    function repayToken(address _cTokenAddress, address _tokenAddress) public onlyOwner returns(bool) {
        uint borrow_amount = ICToken(_cTokenAddress).borrowBalanceCurrent(address(this));
        IERC20(_tokenAddress).approve(_cTokenAddress, borrow_amount);
        ICToken(_cTokenAddress).repayBorrow(borrow_amount);    

        return true;         
    }

    function repayEther(address _cEtherAddress) public payable onlyOwner returns(bool) {
        uint256 borrow_amount = ICEther(_cEtherAddress).borrowBalanceCurrent(address(this));
        ICEther(_cEtherAddress).repayBorrow.value(borrow_amount)();    

        return true;         
    }
}