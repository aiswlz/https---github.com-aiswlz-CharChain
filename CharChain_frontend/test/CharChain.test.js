const { expect } = require("chai");

describe("CharChain Contract", function () {
    let CharChain, charChain, owner, donor;

    beforeEach(async function () {
        [owner, donor] = await ethers.getSigners();
        CharChain = await ethers.getContractFactory("CharChain");
        charChain = await CharChain.deploy();
        await charChain.deployed();
    });

    it("Should accept donations", async function () {
        await charChain.connect(donor).donate("For education", { value: ethers.utils.parseEther("1") });

        const donations = await charChain.getDonations(donor.address);
        expect(donations.length).to.equal(1);
        expect(donations[0].amount).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should allow owner to withdraw", async function () {
        await charChain.connect(donor).donate("For healthcare", { value: ethers.utils.parseEther("2") });

        const balanceBefore = await ethers.provider.getBalance(owner.address);
        await charChain.withdraw(ethers.utils.parseEther("2"));
        const balanceAfter = await ethers.provider.getBalance(owner.address);

        expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should refund a donation", async function () {
        await charChain.connect(donor).donate("For environment", { value: ethers.utils.parseEther("0.5") });

        await charChain.refund(donor.address, 0);
        const donations = await charChain.getDonations(donor.address);
        expect(donations[0].amount).to.equal(0);
    });
});
