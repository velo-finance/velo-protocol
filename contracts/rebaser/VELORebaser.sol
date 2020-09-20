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

    /// @notice Governance address
    address public gov;

    // Stable ordering is not guaranteed.
    Transaction[] public transactions;

    // TODO rebase events

    struct Transaction {
        address destination;
        bytes data;
    }

    modifier onlyGov() {
        require(msg.sender == gov, "!gov");
        _;
    }

    constructor(
        address _VELO
    ) public {
        VELO = _VELO;
        gov = msg.sender;
    }

    function setGov(address newGov) external onlyGov {
        gov = newGov;
    }

    function addTransaction(address destination, bytes memory data) external onlyGov {
        transactions.push(Transaction({
            destination: destination,
            data: data
        }));
    }

    function removeTransaction(uint256 index) external onlyGov {
        transactions[index] = transactions[transactions.length];
        transactions.pop();
    }

    function rebase() external {
        require(block.timestamp - lastRebase > REBASE_INTERVAL, "Too soon");
        require(msg.sender == tx.origin, "EOA Only");

        IVELO velo = IVELO(VELO);

        // TODO first rebase with no historic data
        uint256 TWV =  velo.TWV();
        uint256 velocity = velo.TWV() - previousTWV;

        // If velocitiy is zero do nothing
        if(velocity == 0) {
            return;
        }

        // If no velocity was tracked before, save velocity but skip rebase
        if(previousVelocity == 0) {
            previousVelocity = velocity;
            return;
        }

        uint256 oldScalingFactor = velo.yamsScalingFactor();
        uint256 newScalingFactor = oldScalingFactor.mul(previousVelocity).div(velocity);
        
        // Limit rebase to x2 or /2
        if(newScalingFactor > oldScalingFactor * 2) {
            newScalingFactor = oldScalingFactor * 2;
        } else if(newScalingFactor < oldScalingFactor / 2) {
            newScalingFactor = oldScalingFactor / 2;
        }

        velo.rebase(newScalingFactor);

        previousTWV = TWV;
        previousVelocity = velocity;

        lastRebase = block.timestamp;

        _afterRebase();
    }

    function _afterRebase() internal {
        for(uint256 i = 0; i < transactions.length; i ++) {
            Transaction memory transaction = transactions[i];            
            // Failed transactions should be ignored
            transaction.destination.call(transaction.data);
        }
    }

}