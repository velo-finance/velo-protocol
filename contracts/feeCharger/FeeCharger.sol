pragma solidity 0.5.17;

import "../lib/ICHI.sol";
import "../token/VELOTokenInterface.sol";

contract FeeCharger {

    ICHI public chi;
    VELOTokenInterface public velo;

    uint256 public govFactor;
    address public gov;
    address public beneficiary;

    modifier onlyGov() {
        require(msg.sender == gov, "!gov");
        _;
    }

    constructor(address chi_, address velo_) public {
        chi = ICHI(chi_);
        velo = VELOTokenInterface(velo_);
        gov = msg.sender;
    }

    function setGov(address newGov) external onlyGov {
        gov = newGov;
    }

    function setGovFactor(uint256 factor) external onlyGov {
        govFactor = factor;
    }

    function setBeneficiary(address beneficiary_) external onlyGov {
        beneficiary = beneficiary_;
    }

    function chargeFee(uint256 amount) public {
        uint256 mintAmount = amount * govFactor / 10**18;
        if(mintAmount > 0) {
            chi.mint(mintAmount);
            chi.transfer(beneficiary, chi.balanceOf(address(this)));
        }
    }

}