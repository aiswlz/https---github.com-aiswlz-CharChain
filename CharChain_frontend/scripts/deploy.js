const hre = require("hardhat");

async function main() {
    const CharChain = await hre.ethers.getContractFactory("CharChain");

    const charChain = await CharChain.deploy();

    await charChain.waitForDeployment();  

    console.log("CharChain deployed to:", await charChain.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
