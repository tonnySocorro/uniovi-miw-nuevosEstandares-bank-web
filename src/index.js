
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import {Contract, ethers} from "ethers";
import { useState, useEffect, useRef } from 'react';
import bankManifest from "./contracts/Bank.json";

function App(){
  const bank = useRef(null);
  const [bnbBalance, setBNBBalance] = useState(0);
  const [interestGenerated, setInterestGenerated] = useState(0);
  const [bmiwBalance, setBMIWBalance] = useState(0);
  
  useEffect( () => {
      initContracts();
      updateBalances();
  }, [])
  let clickWithdrawWithFee = async () => {
    const feeAmount = 0.05;
    try {
    // Realizar el retiro con la tarifa
    const tx = await bank.current.withdrawWithFee({
      value: ethers.utils.parseEther(String(feeAmount)),
   
    });
  
    await tx.wait();
    updateBalances();
  } catch (error) {
    console.error("Error withdrawing with fee:", error);
   
    alert("Error withdrawing with fee. Review the amount");
}
  }
  
  let updateBalances = async () => {
    if (bank.current) {
      try {
      const bnbBalance = await bank.current.getBNBBalance();
      const interestGenerated = await bank.current.getInterestGenerated();
      const bmiwBalance = await bank.current.getBMIWBalance();
  
      setBNBBalance(bnbBalance.toString());
      setInterestGenerated(interestGenerated.toString());
      setBMIWBalance(bmiwBalance.toString());
    } catch (error) {
      console.error("Error updating balances:", error);
    }
    }
  };
  let initContracts = async () => {
      await getBlockchain();
  }
  
let onSubmitDeposit = async (e) => {
  e.preventDefault();

  const BNBamount = parseFloat(e.target.elements[0].value);

  // Wei to BNB se pasa con ethers.utils recibe un String!!!
  const tx = await bank.current.deposit({
      value: ethers.utils.parseEther(String(BNBamount)),
      gasLimit: 6721975,
      gasPrice: 20000000000,
  });

  await tx.wait();
  updateBalances();
}
let clickWithdraw = async (e) => {
  try {
  await await bank.current.withdraw();
  updateBalances();
  
} catch (error) {
  console.error("Error making  Withdraw", error);

  alert("Error making  Withdraw ");
}
}



  let getBlockchain = async () => {
      let provider = await detectEthereumProvider();
      if(provider) {
          await provider.request({ method: 'eth_requestAccounts' });
          const networkId = await provider.request({ method: 'net_version' })

          provider = new ethers.providers.Web3Provider(provider);
          const signer = provider.getSigner();

          bank.current = new Contract(
              bankManifest.networks[networkId].address,
              bankManifest.abi,
              signer
          );

      }
      return null;
  }
  let onSubmitDoubleInterestDeposit = async (e) => {
    e.preventDefault();

    const BNBamount = parseFloat(e.target.elements[0].value);
    try {
    // Wei to BNB se pasa con ethers.utils recibe un String!!!
    const tx = await bank.current.doubleInterestDeposit({
        value: ethers.utils.parseEther(String(BNBamount)),
        gasLimit: 6721975,
        gasPrice: 20000000000,
    });

    await tx.wait();
    updateBalances();
  } catch (error) {
    console.error("Error making double interest deposit:", error);

    alert("Error making double interest deposit. Please try again.");
}
}

let clickWithdrawWithLock = async () => {
    // Realizar retiro con bloqueo de 10 minutos
    try {
    await await bank.current.withdrawWithLock();
    updateBalances();
  } catch (error) {
    console.error("Error making double Withdraw with doible deposit", error);

    alert("Error making double Withdraw with doible deposit");
}
}




  return (
      <div>
          <h1>Bank</h1>
          <button onClick={updateBalances}>BNB Balance</button><p>: {bnbBalance} BNB</p>
            <button onClick={updateBalances}>Interest Generated</button> <p>: {interestGenerated} BNB</p>
            <button onClick={updateBalances}>BMIW Balance</button> <p>: {bmiwBalance} BMIW</p>
           
          
         
       
        <div>
        <h2>Depósito con Interés Normal</h2>
          <form onSubmit= { (e) => onSubmitDeposit(e) } >
                <input type="number" step="0.01" />
                <button type="submit">Deposit</button>
            </form>
            <button onClick= { () => clickWithdraw() } > Withdraw </button>
         <button onClick={() => clickWithdrawWithFee()}>Withdraw with Fee</button>
         </div>
         <div>
                <h2>Depósito con Doble Interés y Bloqueo</h2>
                <form onSubmit={(e) => onSubmitDoubleInterestDeposit(e)}>
                    <input type="number" step="0.01" />
                    <button type="submit">Double Interest Deposit</button>
                </form>
                <button onClick={() => clickWithdrawWithLock()}>Withdraw with Lock</button>
            </div>
        
      </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
