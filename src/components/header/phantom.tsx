import { useState, useEffect } from "react";
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";

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

const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    const anyWindow: any = window;
    const provider = anyWindow.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

export default function Phantom() {
  const provider = getProvider();
  console.log('2', provider)
  const [, setConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  useEffect(() => {
    if (!provider) return;
    // try to eagerly connect
    provider.connect({ onlyIfTrusted: true }).catch(() => {
      // fail silently
    });
    provider.on("connect", (publicKey: PublicKey) => {
      setPublicKey(publicKey);
      setConnected(true);
    });
    provider.on("disconnect", () => {
      setPublicKey(null);
      setConnected(false);
    });
    provider.on("accountChanged", (publicKey: PublicKey | null) => {
      setPublicKey(publicKey);
      if (publicKey) {
      } else {
        provider
          .connect()
          .then(() => {})
          .catch((err) => {
          });
      }
    });
    return () => {
      provider.disconnect();
    };
  }, [provider]);
  if (!provider) {
    return <h2>Could not find a provider</h2>;
  }

  return (
    <div className="App">
      <main>
        <h1>Phantom Sandbox</h1>
        {provider && publicKey ? (
          <>
            <div>
              <pre>Connected as</pre>
              <br />
              <pre>{publicKey.toBase58()}</pre>
              <br />
            </div>
            <button
              onClick={async () => {
                try {
                  await provider.disconnect();
                } catch (err) {
                  console.warn(err);
                }
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <button
              onClick={async () => {
                try {
                  await provider.connect();
                } catch (err) {
                  console.warn(err);
                }
              }}
            >
              Connect to Phantom
            </button>
          </>
        )}
      </main>
    </div>
  );
}