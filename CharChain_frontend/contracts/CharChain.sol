pragma solidity ^0.8.19;

contract CharChain {
    struct Donation {
        address donor;
        uint amount;
        uint timestamp;
        string message;
    }

    address public owner;
    mapping(address => Donation[]) public donations;
    uint public totalDonations;

    event DonationReceived(address indexed donor, uint amount, string message);
    event Withdrawal(address indexed admin, uint amount);
    event DonationRefunded(address indexed donor, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function donate(string memory message) public payable {
        require(msg.value > 0, "Donation must be greater than 0");

        donations[msg.sender].push(Donation(msg.sender, msg.value, block.timestamp, message));
        totalDonations += msg.value;

        emit DonationReceived(msg.sender, msg.value, message);
    }

    function getDonations(address donor) public view returns (Donation[] memory) {
        return donations[donor];
    }

    function withdraw(uint amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");

        payable(owner).transfer(amount);
        emit Withdrawal(owner, amount);
    }

    function refund(address donor, uint index) public onlyOwner {
        require(index < donations[donor].length, "Invalid donation index");

        Donation memory donation = donations[donor][index];
        require(donation.amount > 0, "Donation already refunded");

        payable(donor).transfer(donation.amount);
        donations[donor][index].amount = 0;

        emit DonationRefunded(donor, donation.amount);
    }

    function contractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
