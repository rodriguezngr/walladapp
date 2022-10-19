// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BuenosDiasToken is ERC20 {
    constructor() ERC20("BuenosDiasToken", "BDT"){
        _mint(msg.sender, 50000 * 10**18);
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }
}