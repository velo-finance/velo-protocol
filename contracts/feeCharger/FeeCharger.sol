pragma solidity 0.5.17;

import "../lib/ICHI.sol";
import "../token/VELOTokenInterface.sol";

contract FeeCharger {

    ICHI public constant chi = ICHI(0x0000000000004946c0e9F43F4Dee607b0eF1fA1c);
    VELOTokenInterface public velo;

    uint256 public govFactor;
    address public gov;
    address public beneficiary;

    modifier onlyGov() {
        require(msg.sender == gov, "!gov");
        _;
    }

    constructor(address velo_) public {
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
        chi.mint(1);
        chi.transfer(beneficiary, chi.balanceOf(address(this)));
    }

}