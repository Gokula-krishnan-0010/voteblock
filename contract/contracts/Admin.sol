// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import { Election } from "./Election.sol";

contract Admin {
  address public immutable SUPER_ADMIN;

  address[] public listOfElection;

  event ElectionCreated(
    address indexed electionAddress, 
    string electionName, 
    address admin
  );

  constructor() {
    SUPER_ADMIN = msg.sender; 
  }

  modifier onlySuperAdmin() {
    require(msg.sender == SUPER_ADMIN, "Only SUPER_ADMIN can create elections.");
    _;
  }

  function createElection(address _admin, string memory _electionName, uint256 _startTime, uint256 _endTime) public onlySuperAdmin returns(address) {
    Election _newElection = new Election(_admin, _electionName, _startTime, _endTime);
    listOfElection.push(address(_newElection));

    emit ElectionCreated(address(_newElection), _electionName, _admin);
    return address(_newElection);
  }

  function getElections() public view returns(address[] memory) {
    return listOfElection; // high gas
  }
}
