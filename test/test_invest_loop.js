function invest(_amount, _tokenAddress, _ctokenAddres ,_loops){
    _nextCollateralAmount = _amount;
    console.log("Erster _nextCollateralAmount " + _nextCollateralAmount);

    console.log("Enter Markets");

    for(var i = 0; i < _loops; i++)
    {
        console.log("require für " + _nextCollateralAmount);
        console.log("Mint für " + _nextCollateralAmount);
        var _amount_to_borrow = (_nextCollateralAmount * 70) / 100;
        console.log("Borrow für " + _amount_to_borrow);
        _nextCollateralAmount = _amount_to_borrow;
    }
}

invest(10, 12, 123, 3)