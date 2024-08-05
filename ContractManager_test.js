const { expect } = require("chai");

describe("ContractManager", function () {
    let ContractManager;
    let contractManager;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        ContractManager = await ethers.getContractFactory("ContractManager");
        [owner, addr1, addr2] = await ethers.getSigners();

        contractManager = await ContractManager.deploy();
        await contractManager.deployed();
    });

    describe("Access Control", function () {
        it("should only allow the owner to add a contract", async function () {
            await contractManager.connect(owner).addContract(addr1.address, "Contract 1 Description");
            await expect(contractManager.connect(addr1).addContract(addr2.address, "Contract 2 Description"))
                .to.be.revertedWith("Not authorized");
        });

        it("should only allow the owner to update a contract", async function () {
            await contractManager.connect(owner).addContract(addr1.address, "Contract 1 Description");
            await expect(contractManager.connect(addr1).updateContract(addr1.address, "Updated Description"))
                .to.be.revertedWith("Not authorized");
        });

        it("should only allow the owner to remove a contract", async function () {
            await contractManager.connect(owner).addContract(addr1.address, "Contract 1 Description");
            await expect(contractManager.connect(addr1).removeContract(addr1.address))
                .to.be.revertedWith("Not authorized");
        });
    });

    describe("Functionality Tests", function () {
        it("should add a contract", async function () {
            await contractManager.connect(owner).addContract(addr1.address, "Contract 1 Description");
            expect(await contractManager.getContractDescription(addr1.address)).to.equal("Contract 1 Description");
        });

        it("should not allow adding a contract with an empty description", async function () {
            await expect(contractManager.connect(owner).addContract(addr1.address, ""))
                .to.be.revertedWith("Description cannot be empty");
        });

        it("should update a contract description", async function () {
            await contractManager.connect(owner).addContract(addr1.address, "Contract 1 Description");
            await contractManager.connect(owner).updateContract(addr1.address, "Updated Description");
            expect(await contractManager.getContractDescription(addr1.address)).to.equal("Updated Description");
        });

        it("should not allow updating a non-existent contract", async function () {
            await expect(contractManager.connect(owner).updateContract(addr1.address, "Updated Description"))
                .to.be.revertedWith("Contract does not exist");
        });

        it("should remove a contract", async function () {
            await contractManager.connect(owner).addContract(addr1.address, "Contract 1 Description");
            await contractManager.connect(owner).removeContract(addr1.address);
            expect(await contractManager.getContractDescription(addr1.address)).to.equal("");
        });

        it("should not allow removing a non-existent contract", async function () {
            await expect(contractManager.connect(owner).removeContract(addr1.address))
                .to.be.revertedWith("Contract does not exist");
        });

        it("should retrieve all contracts", async function () {
            await contractManager.connect(owner).addContract(addr1.address, "Contract 1 Description");
            await contractManager.connect(owner).addContract(addr2.address, "Contract 2 Description");

            const [addresses, descriptions] = await contractManager.getAllContracts();

            expect(addresses.length).to.equal(2);
            expect(descriptions.length).to.equal(2);
            expect(descriptions[0]).to.equal("Contract 1 Description");
            expect(descriptions[1]).to.equal("Contract 2 Description");
        });
    });
});
