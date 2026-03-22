// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;
 
contract Election {
  address public immutable ADMIN;
  string public ELECTION_NAME;
  uint256 public immutable ELECTION_START_TIME;
  uint256 public immutable ELECTION_END_TIME;
  string public WINNER;
  bool public winnerDeclared = false;

  struct Voter {
    string voterId;
    address walletAddress;
    bool hasVoted;
    string[] encryptedVoteVector;
  }

  address[] voterList;
  address[] votedVoters;

  mapping(address => Voter) voterMap;

  struct Candidate {
    string candidateId;
    string candidateName;
    string candidateParty;
  }

  string[] candidateList;

  mapping(string => Candidate) candidateMap;

  event VoterAdded(address indexed walletAddress);
  event CandidateAdded(string candidateId);
  event VoteCasted(address indexed walletAddress);
  event WinnerAnnounced(string winnerId);
  event ElectionEnded(uint256 timestamp);



  constructor(address _admin, string memory _electionName, uint256 _startTime, uint256 _endTime) {
    require(_admin != address(0), "Invalid wallet address");
    require(bytes(_electionName).length != 0, "Invalid election name"); // optional
    require(block.timestamp < _startTime, "Start time must be in future");
    require(_startTime < _endTime, "End time must be after Start time");

    ADMIN = _admin;
    ELECTION_NAME = _electionName;
    ELECTION_START_TIME = _startTime;
    ELECTION_END_TIME = _endTime;
  }

  modifier onlyAdmin() {
    require(msg.sender == ADMIN, "Not the ADMIN");
    _;
  }

  modifier onlyVoter() {
    require(bytes(voterMap[msg.sender].voterId).length != 0, "Not registered");
    _;
  }

  modifier onlyBeforeElection() {
    require(block.timestamp < ELECTION_START_TIME, "Election started");
    _;
  }

  modifier onlyDuringElection() {
    require(block.timestamp >= ELECTION_START_TIME, "Election not started");
    require(block.timestamp <= ELECTION_END_TIME, "Election ended");
    _;
  }

  modifier onlyAfterElection() {
    require(block.timestamp > ELECTION_END_TIME, "Election not ended");
    _;
  }



  function addVoter(string memory _voterId, address _walletAddress) public onlyAdmin onlyBeforeElection {
    require(bytes(_voterId).length != 0, "Invalid voter ID");
    require(_walletAddress != address(0), "Invalid wallet address");
    require(bytes(voterMap[_walletAddress].voterId).length == 0, "Voter is already registered");

    Voter memory _newVoter = Voter(_voterId, _walletAddress, false, new string[](0));
    voterList.push(_walletAddress);
    voterMap[_walletAddress] = _newVoter;

    emit VoterAdded(_walletAddress);
  }

  function addCandidate(string memory _candidateId, string memory _candidateName, string memory _candidateParty) public onlyAdmin onlyBeforeElection {
    require(bytes(_candidateId).length != 0, "Invalid candidate ID");
    require(bytes(candidateMap[_candidateId].candidateId).length == 0, "Candidate already exists");

    Candidate memory _newCandidate = Candidate(_candidateId, _candidateName, _candidateParty);
    candidateList.push(_candidateId);
    candidateMap[_candidateId] = _newCandidate;

    emit CandidateAdded(_candidateId);
  }

  // vote casting - homomorphic encryption
  function castVote(string[] memory _encryptedVoteVector) public onlyVoter onlyDuringElection {
    require(voterMap[msg.sender].walletAddress != address(0), "Not registered voter");
    require(voterMap[msg.sender].hasVoted == false, "Already voted");
    require(_encryptedVoteVector.length == candidateList.length, "Vote vector length mismatch");

    voterMap[msg.sender].hasVoted = true;
    voterMap[msg.sender].encryptedVoteVector = _encryptedVoteVector;
    votedVoters.push(msg.sender);

    emit VoteCasted(msg.sender);
  }

  // decryption of tally votes and count max votes (trigger)
  function announceWinner(string memory _winnerId) public onlyAdmin onlyAfterElection {
    require(!winnerDeclared, "Winner already declared");
    require(bytes(candidateMap[_winnerId].candidateId).length != 0, "Invalid candidate");

    WINNER = _winnerId;
    winnerDeclared = true;

    emit WinnerAnnounced(_winnerId);
  }



  function isRegisteredVoter(address _walletAddress) public view returns(bool) {
    return bytes(voterMap[_walletAddress].voterId).length > 0;
  }

  function getEncryptedVote(address _walletAddress) public view returns(bool, string[] memory) {
    return (
      voterMap[_walletAddress].hasVoted,
      voterMap[_walletAddress].encryptedVoteVector
    );
  }

  function getVoterInfo(address _walletAddress) public view returns(string memory, address, bool, string[] memory) {
    require(msg.sender == _walletAddress || msg.sender == ADMIN, "Unauthorized");
    return (
      voterMap[_walletAddress].voterId,
      voterMap[_walletAddress].walletAddress,
      voterMap[_walletAddress].hasVoted,
      voterMap[_walletAddress].encryptedVoteVector
    );
  }

  function getCandidateInfo(string memory _candidateId) public view returns(string memory, string memory, string memory) {
    return (
      candidateMap[_candidateId].candidateId,
      candidateMap[_candidateId].candidateName, 
      candidateMap[_candidateId].candidateParty
    );
  }
 
  function getElectionName() public view returns(string memory) {
    return ELECTION_NAME;
  }

  function getElectionAdmin() public view returns(address) {
    return ADMIN;
  }

  function getStartTime() public view returns(uint256) {
    return ELECTION_START_TIME;
  }

  function getEndTime() public view returns(uint256) {
    return ELECTION_END_TIME;
  }

  function getWinnerId() public view returns(string memory) {
    return WINNER;
  }

  function getRegisteredVoterCount() public view returns(uint256) {
    return voterList.length;
  }

  function getVotedVoterCount() public view returns(uint256) {
    return votedVoters.length;
  }

  function getCandidateCount() public view returns(uint256) {
    return candidateList.length;
  }

  function getVoterList() public view returns(address[] memory) {
    return voterList;
  }

  function getVotedVoterList() public view returns(address[] memory) {
    return votedVoters;
  }

  function getCandidateList() public view returns(string[] memory) {
    return candidateList;
  }
}