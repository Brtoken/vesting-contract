// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./interfaces/IBEP20.sol";
import "./utils/Context.sol";
import "./utils/SafeMath.sol";
import "./utils/Ownable.sol";

contract Vesting is Context, Ownable {
    using SafeMath for uint256;

    address public advisor;
    address public bRTK;
    
    // uint256 public SECONDS_IN_A_DAY = 28800;
    uint256 public SECONDS_IN_A_DAY = 1;
    
    uint256 constant public VESTING_RELEASE_START = 180;
    uint256 constant public VESTING_PERIOD_STEP = 90;
    
    uint256 constant public VESTING_RELEASE_STEP = 25;

    uint256 public vestingStart;
    uint256 public vestingAmount;
    uint256 public releasedAmount;

    event Lock(address indexed sender, uint amount, uint time);
    event Withdraw(address indexed sender, uint amount, uint time);


    constructor(address _bRTK, address _advisor) public {
        advisor = _advisor;
        bRTK = _bRTK;
    }

    function lock(uint256 _amount) public {
        require(msg.sender == advisor, 'Vesting: INSUFFICIENT_PERMISSION');

        IBEP20(bRTK).transferFrom(msg.sender, address(this), _amount);
        vestingStart = block.number;
        vestingAmount = _amount;

        emit Lock(msg.sender, _amount, vestingStart);
    }  

    function withdraw() external {
        require(msg.sender == advisor, 'Vesting: INSUFFICIENT_PERMISSION');

        uint256 amountUnlocked = unlockedAmount();
        uint256 amountToWithdraw = amountUnlocked.sub(releasedAmount);
        IBEP20(bRTK).transfer(msg.sender, amountToWithdraw);
        releasedAmount = releasedAmount.add(amountToWithdraw);

        emit Lock(msg.sender, amountToWithdraw, block.number);
    }

    function unlockedAmount() public view returns (uint256 amount) {
        amount = 0;
        if ((block.number).sub(vestingStart) >= VESTING_RELEASE_START.mul(SECONDS_IN_A_DAY)) {
            amount = vestingAmount.mul(VESTING_RELEASE_STEP).div(100);
            uint256 datePassed = (block.number.sub(vestingStart)).sub(VESTING_RELEASE_START.mul(SECONDS_IN_A_DAY));
            uint256 stepPassed = datePassed.div(VESTING_PERIOD_STEP.mul(SECONDS_IN_A_DAY));
            amount = amount.add(stepPassed.mul(amount));
        }
    }
}
