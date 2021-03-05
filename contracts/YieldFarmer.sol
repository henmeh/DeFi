pragma solidity 0.5.12;

import "@studydefi/money-legos/compound/contracts/IComptroller.sol";
import "@studydefi/money-legos/compound/contracts/ICEther.sol";
import "@studydefi/money-legos/compound/contracts/ICToken.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract YieldFarmer {
    using SafeMath for uint;
    event MyLog(string, uint);
    
    address owner;
    IComptroller comptroller;


    constructor(address _comptroller) public {
        owner = msg.sender;
        comptroller = IComptroller(_comptroller);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function lend(uint _amount, address _tokenAddress, address _cTokenAddress) public onlyOwner returns(uint) {
            // Approve transfer on the ERC20 contract
            IERC20(_tokenAddress).approve(_cTokenAddress, _amount);
            // Mint cTokens
            uint _mintResult = ICToken(_cTokenAddress).mint(_amount);
            require(_mintResult == 0, "cERC20.mint Error");

            return _mintResult;
    }

    function borrowSimple (address _cTokenAddress) public returns(uint) {
       // Enter markets to use the token as collateral
        address[] memory _markets = new address[](1);
        _markets[0] = _cTokenAddress;
        uint[] memory _enterMarkets = comptroller.enterMarkets(_markets);

        // Get my account's total liquidity value in Compound
        (uint _error, uint _liquidity, uint _shortfall) = comptroller
            .getAccountLiquidity(address(this));
        if (_error != 0) {
            revert("Comptroller.getAccountLiquidity failed.");
        }
        require(_shortfall == 0, "account underwater");
        require(_liquidity > 0, "account has excess collateral");

        uint _borrowResult = ICToken(_cTokenAddress).borrow(_liquidity * 6 / 10);
        return _borrowResult;      
    }

    function borrowMaxComp(uint _initialAmount, address _tokenAddress, address _cTokenAddress, uint _loops) public returns(uint) {
       // Enter markets to use the token as collateral
        address[] memory _markets = new address[](1);
        _markets[0] = _cTokenAddress;
        uint[] memory _enterMarkets = comptroller.enterMarkets(_markets);
        
        uint _nextCollateralAmount = _initialAmount;
        uint _borrowResult;
                
        for(uint i = 0; i < _loops; i++)
        {
            uint _mintResult = lend(_nextCollateralAmount, _tokenAddress, _cTokenAddress);
            uint _borrowAmount = (_nextCollateralAmount * 6) / 10;
            _borrowResult = ICToken(_cTokenAddress).borrow(_borrowAmount);
            _nextCollateralAmount = _borrowAmount;
        }
        return _borrowResult;
    }

    function repay(address _tokenAddress, address _ctokenAddress) public returns(bool) {
        uint256 borrow_amount = ICToken(_ctokenAddress).borrowBalanceCurrent(address(this));
        IERC20(_tokenAddress).approve(_ctokenAddress, borrow_amount);
        ICToken(_ctokenAddress).repayBorrow(borrow_amount);    

        return true;
    }

    function redeemFunds(address _ctokenAddress) public onlyOwner returns(uint){
            uint _amount = ICToken(_ctokenAddress).balanceOf(address(this));
            uint _redeemResult = ICToken(_ctokenAddress).redeem(_amount);
            require(_redeemResult == 0, "redeemResult error");
            emit MyLog("If this is not 0, there was an error", _redeemResult);
            return _redeemResult;
    }

    function sendFunds(address _tokenAddress) public onlyOwner {
        uint _balance = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).approve(address(this), _balance);
        ICToken(_tokenAddress).transfer(msg.sender, _balance);
    }

    function getBorrowBalance(address _ctokenAddress) public onlyOwner returns(uint){
        uint _borrowAmount = ICToken(_ctokenAddress).borrowBalanceCurrent(address(this));
        return _borrowAmount;
    }
}