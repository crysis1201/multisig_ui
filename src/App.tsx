import './App.css';
import Header from './components/header/header.tsx';
import { useState, useEffect } from "react";
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import Main from './components/main.tsx';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ImportWallet from './components/importwallet.tsx';
import { AnchorProvider, Program } from '@project-serum/anchor';
import idl from './idl.json'
import { Connection } from '@solana/web3.js';
import Multisig from './components/multisig.tsx';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod = 
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

const getWallet = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    const anyWindow: any = window;
    const wallet = anyWindow.solana;
    if (wallet.isPhantom) {
      return wallet;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

function App() {
  const wallet = getWallet()
  console.log({wallet})
  const [, setConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [provider, setProvider] = useState<AnchorProvider | undefined>(undefined)
  const [transactionData, setTransactionData] = useState({})

  useEffect(() => {
    if (!wallet) return;
    // try to eagerly connect
    wallet.connect({ onlyIfTrusted: true }).catch(() => {
      // fail silently
    });
    wallet.on("connect", (publicKey: PublicKey) => {
      setPublicKey(publicKey);
      setConnected(true);
    });
    wallet.on("disconnect", () => {
      setPublicKey(null);
      setConnected(false);
    });
    wallet.on("accountChanged", (publicKey: PublicKey | null) => {
      setPublicKey(publicKey);
      if (publicKey) {
      } else {
        wallet
          .connect()
          .then(() => {})
          .catch((err) => {
          });
      }
    });
    return () => {
      wallet.disconnect();
    };
  }, [wallet]);

    async function getProvider() {
      if(typeof wallet !== 'undefined') {
      /* create the provider and return it to the caller */
      /* network set to local network for now */
      const network = "http://127.0.0.1:8899";
      const connection = new Connection(network, "processed");

      const provider = new AnchorProvider(
        connection, wallet, { "preflightCommitment" : "processed" },
      );
      console.log({provider})
      setProvider(provider)
      }
    }
    const multiSigAccount = useSelector((state: any) => state.multiSigWallet)

    useEffect(() => {
      getProvider() 
    }, [wallet])

    useEffect(() => {
      if (typeof provider !== 'undefined') {
        const programID = new PublicKey(idl.metadata.address);
        const a = JSON.stringify (idl) ;          
        const b = JSON.parse ( a ) ;
        const program = new Program ( b , programID , provider) ;
        setTransactionData({programID, program, provider})
      }
    }, [wallet, provider])

    const navigate = useNavigate()
  
  return (
    <div className="App h-screen p-2 pt-4 bg-gray-900">
      <Header provider={wallet} publicKey={publicKey}></Header>
      <Routes>
        <Route path='/'
        element={
          <div className='flex gap-10 mx-auto justify-center items-center'>
            <button onClick={() => navigate('importWallet')} className='h-32 w-32 p-4 text-white bg-gray-800 font-medium border border-main-03 rounded-md'>import Wallet</button>
            <button onClick={() => navigate('createWallet')} className='h-32 w-32 p-4 text-white bg-gray-800 font-medium border border-main-03 rounded-md'>Create Wallet</button>
          </div>} 
        />
        <Route path='createWallet' element={publicKey !== null ? <Main multiSigAccount={multiSigAccount} transactionData={transactionData} wallet={wallet} publicKey={publicKey} /> : null} />
        <Route path='importWallet' element={<ImportWallet multiSigAccount={multiSigAccount} publicKey={publicKey} />} />
        <Route path='multisig' element={multiSigAccount && publicKey ? <Multisig transactionData={transactionData} multiSigAccount={multiSigAccount}  /> : <div>No multiSig account</div>} />
      </Routes>
      <Toaster
          toastOptions={{
              success: { duration: 3000 },
              error: { duration: 3000 },
              loading: { duration: 3000 },
              className: "font-medium",
              style: {
                border: '5px solid #003b4a',
                borderRadius: '10px',
                background: '#003340',
                color: '#fff',
              },
          }}
      />
    </div>
  );
}

export default App
