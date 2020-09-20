pragma solidity 0.5.17;

import "../lib/ICHI.sol";
import "../token/YAMTokenInterface.sol";

contract FeeCharger {

    ICHI public chi;
    YAMTokenInterface public velo;

    uint256 public govFactor;
    address public gov;

    modifier onlyGov() {
        require(msg.sender == gov, "!gov");
        _;
    }

    constructor(address chi_, address velo_) public {
        chi = ICHI(chi_);
        velo = YAMTokenInterface(velo_);
        gov = msg.sender;
    }

    function setGov(address newGov) external onlyGov {
        gov = newGov;
    }

    function setGovFactor(uint256 factor) external onlyGov {
        govFactor = factor;
    }

    function chargeFee(uint256 amount) public {
        chi.mint(amount * govFactor);
        chi.transfer(gov, chi.balanceOf(address(this)));
    }

}