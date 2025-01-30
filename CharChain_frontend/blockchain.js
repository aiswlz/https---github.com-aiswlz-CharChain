import { ethers } from "ethers";
import CharChainABI from "./CharChainABI.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getEthereumContract = () => {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CharChainABI, signer);

    return contract;
};

export const connectWallet = async () => {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }
    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        return accounts[0];
    } catch (error) {
        console.error("Error connecting wallet:", error);
    }
};

export const donate = async (amount, message) => {
    try {
        const contract = getEthereumContract();
        if (!contract) return;

        const tx = await contract.donate(message, { value: ethers.parseEther(amount) });
        await tx.wait();

        alert("Donation successful!");
    } catch (error) {
        console.error("Error making donation:", error);
    }
};
