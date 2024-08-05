// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContractManager {
    address private owner;

    // Mapping from contract address to its description
    mapping(address => string) private contracts;
    
    // Array to keep track of all added contract addresses
    address[] private addressList;

    // Event declarations
    event ContractAdded(address indexed contractAddress, string description);
    event ContractUpdated(address indexed contractAddress, string newDescription);
    event ContractRemoved(address indexed contractAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addContract(address _contractAddress, string memory _description) external onlyOwner {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(contracts[_contractAddress]).length == 0, "Contract already exists");

        contracts[_contractAddress] = _description;
        addressList.push(_contractAddress);
        emit ContractAdded(_contractAddress, _description);
    }

    function updateContract(address _contractAddress, string memory _newDescription) external onlyOwner {
        require(bytes(_newDescription).length > 0, "Description cannot be empty");
        require(bytes(contracts[_contractAddress]).length > 0, "Contract does not exist");

        contracts[_contractAddress] = _newDescription;
        emit ContractUpdated(_contractAddress, _newDescription);
    }

    function removeContract(address _contractAddress) external onlyOwner {
        require(bytes(contracts[_contractAddress]).length > 0, "Contract does not exist");

        delete contracts[_contractAddress];
        
        // Remove the address from addressList
        for (uint256 i = 0; i < addressList.length; i++) {
            if (addressList[i] == _contractAddress) {
                addressList[i] = addressList[addressList.length - 1];
                addressList.pop();
                break;
            }
        }

        emit ContractRemoved(_contractAddress);
    }

    function getContractDescription(address _contractAddress) external view returns (string memory) {
        return contracts[_contractAddress];
    }

    function getAllContracts() external view returns (address[] memory, string[] memory) {
        uint256 contractCount = addressList.length;
        address[] memory addresses = new address[](contractCount);
        string[] memory descriptions = new string[](contractCount);

        for (uint256 i = 0; i < contractCount; i++) {
            addresses[i] = addressList[i];
            descriptions[i] = contracts[addressList[i]];
        }

        return (addresses, descriptions);
    }
}
