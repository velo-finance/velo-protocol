pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "../lib/SafeERC20.sol";
import "../lib/SafeMath.sol";
import {YAMTokenInterface as IVELO} from "../token/YAMTokenInterface.sol";

contract VELORebaser {
    using SafeMath for uint256;

    uint256 public previousTWV;
    uint256 public previousVelocity;
    uint256 public lastRebase;
    uint256 public constant REBASE_INTERVAL = 12 hours;

    address public VELO;

    // TODO rebase events


    constructor(
        address _VELO
    ) public {
        VELO = _VELO;
    }

    function rebase() external {
        require(block.timestamp - lastRebase > REBASE_INTERVAL, "Too soon");
        require(msg.sender == tx.origin, "EOA Only");

        IVELO velo = IVELO(VELO);

        // TODO first rebase with no historic data
        uint256 TWV =  velo.TWV();
        uint256 velocity = velo.TWV() - previousTWV;

        uint256 newScalingFactor = velo.yamsScalingFactor().mul(velocity).div(previousVelocity);

        velo.rebase(newScalingFactor);

        previousTWV = TWV;
        previousVelocity = velocity;

        lastRebase = block.timestamp;

        // TODO sync Uniswap pool
        // TODO sync Sushiswap pool
        // TODO possibly sync balancer pools
    }

}