export const SAMPLE_VULNERABLE_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrowdfundingVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // VULNERABLE: External call before state update (Reentrancy)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
    }

    function emergencyWithdraw(address target) public {
        // VULNERABLE: tx.origin authorization flaw
        require(tx.origin == owner, "Not authorized");
        payable(target).transfer(address(this).balance);
    }
}`;

export const SAMPLE_CLEAN_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract SecureCrowdfundingVault is ReentrancyGuard {
    mapping(address => uint256) public balances;
    address public owner;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed sender, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized caller");
        _;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Checks-Effects-Interactions Pattern
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }
}`;
