import React, { useEffect, useState } from "react";
import Web3 from "web3";
import CharChain from ".src/contracts/CharCh.json";

const App = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [charChainContract, setCharChainContract] = useState(null);
  const [donationMessage, setDonationMessage] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donations, setDonations] = useState([]);
  const [contractBalance, setContractBalance] = useState(0);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }
      } else {
        alert("Please install MetaMask to interact with this DApp.");
      }
    };

    const loadContract = async () => {
      if (web3) {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = CharChain.networks[networkId];
        const contract = new web3.eth.Contract(
          CharChain.abi,
          deployedNetwork && deployedNetwork.address
        );
        setCharChainContract(contract);

        const userDonations = await contract.methods.getDonations(account).call();
        setDonations(userDonations);

        const balance = await contract.methods.contractBalance().call();
        setContractBalance(balance);
      }
    };

    loadWeb3();
    if (web3) loadContract();
  }, [web3, account]);

  const donate = async () => {
    if (charChainContract && account && donationAmount > 0) {
      await charChainContract.methods
        .donate(donationMessage)
        .send({ from: account, value: web3.utils.toWei(donationAmount, "ether") });
      
      const userDonations = await charChainContract.methods.getDonations(account).call();
      setDonations(userDonations);
      
      const balance = await charChainContract.methods.contractBalance().call();
      setContractBalance(balance);

      setDonationMessage("");
      setDonationAmount("");
    }
  };

  return (
    <div>
      <h1>Welcome to CharChain - Donate to a Cause</h1>

      {account ? (
        <div>
          <p>Connected Account: {account}</p>
        </div>
      ) : (
        <p>Please connect your wallet</p>
      )}

      <div>
        <h2>Make a Donation</h2>
        <input
          type="number"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          placeholder="Amount in ETH"
        />
        <input
          type="text"
          value={donationMessage}
          onChange={(e) => setDonationMessage(e.target.value)}
          placeholder="Message (optional)"
        />
        <button onClick={donate}>Donate</button>
      </div>

      <div>
        <h2>Your Donations</h2>
        <ul>
          {donations.map((donation, index) => (
            <li key={index}>
              <p>{donation.amount / 1e18} ETH - {donation.message}</p>
              <p>Timestamp: {new Date(donation.timestamp * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Contract Balance</h2>
        <p>{web3.utils.fromWei(contractBalance, "ether")} ETH</p>
      </div>
    </div>
  );
};

export default App;