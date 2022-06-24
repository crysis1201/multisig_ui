import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";
import SetOwnerModal from "./setOwnerandThresholdModal.tsx";

const Multisig = ({transactionData, multiSigAccount}) => {

    const {programID, provider, program} = transactionData
    const [multisigAccount, setMultisigAccount] = useState(null)
    const publicKey  = new PublicKey(multiSigAccount)
    const [balance, setBalance] = useState(0)
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, "processed");
    const [txAccount, setTxAccount] = useState<null | any>(null)
    const [isOpen, setIsOpen] = useState(false)

    const getbalance = async () => {
        setBalance(await connection.getBalance(publicKey)/LAMPORTS_PER_SOL)
    }
    
    useEffect(() => {
        getbalance()
    }, [multiSigAccount, connection])

    useEffect(() => {
      program.account
        .multisig.fetch(publicKey)
        .then((account: any) => {

          console.log({account})
          setMultisigAccount(account);
        })
        .catch((err: any) => {
          console.error(err);
          setMultisigAccount(null);
        });
    }, [multiSigAccount, program.account]);

    useEffect(() => {
      program.account.transaction.all(publicKey).then((txs) => {
        console.log({txs})
        let tx: any = []
        for (let x in txs) {
          if (txs[x].account.multisig.toBase58() === publicKey.toBase58()) {
            console.log(txs[x].publicKey)
            let t = txs[x]
            tx.push(t)
          }
        }
        setTxAccount(tx)
        console.log(tx)
      });
    }, [program.account.transaction, multiSigAccount]);
    
    return (
        <div className="text-white p-5 mt-10 max-w-screen-lg mx-auto bg-main-00 border border-main-03 rounded-md gap-10 ">
          <SetOwnerModal programID={programID} program={program} provider={provider} isOpen={isOpen} publicKey={publicKey} />
            {
                multisigAccount === undefined ? (<div className="text-white">Loading...</div>) : null
            }
            {multisigAccount && (
                <div>
                    <div className="text-left flex justify-between items-start font-medium">
                      <div>
                        <div>
                          <h1 className="text-xl">Multisig Account</h1>
                          <p className="text-sides-03" >{multiSigAccount}</p>
                        </div>
                        <div className="mt-2">
                          <h1 className="text-xl">Balance</h1>
                          <p className="text-sides-03" >{balance}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsOpen(true)} className="bg-main-03 p-2 rounded-md text-black">Change Owner</button>
                    </div> 
                {txAccount === null ? (
                    <div style={{ padding: "16px" }}>
                    Loading....
                    </div>
                ) : txAccount.length === 0 ? (
                    <div>
                        No transaction found
                    </div>
                ) : (
                  <div>
                    <h1 className="font-medium text-xl text-left mt-4">Transactions</h1>
                    <table className="w-full mt-2 text-left border-collapse">
                      <tr>
                          <th align="left" colSpan={2}>Tranaction Account</th>
                          <th align="left">Approve</th>
                          <th align="left">Execute</th>
                          <th align="left">Reject</th>
                          <th align="left"></th>                         
                      </tr>
                        {txAccount.map((tx: any) => (
                            txAccount !== null ? <Txdata tx={tx} program={program} programId={programID} provider={provider} publicKey={publicKey} />: null
                        ))}
                    </table>
                  </div>
                )}
                </div>
                )}
        </div>
    )
}

export default Multisig

export const Txdata = ({tx, program, provider, publicKey, programId}) => {
    const [txAccount, setTxAccount] = useState(tx.account);
    useEffect(() => {
      program.account.transaction
        .subscribe(tx.publicKey)
        .on("change", (account) => {
          setTxAccount(account);
        });
          const setThresholdSighash = program.coder
            console.log({setThresholdSighash})
    }, [program, publicKey, tx.publicKey]);

    const approve = async () => {
      toast.loading('approving...')
        await program.rpc.approve({
          accounts: {
            multisig: publicKey,
            transaction: tx.publicKey,
            owner: provider.wallet.publicKey,
          }
        })
        toast.success('approved')
      };

    const reject = async () => {
      toast.loading('rejecting...')
      await program.rpc.reject({
        accounts: {
          multisig: publicKey,
          transaction: tx.publicKey,
          owner: provider.wallet.publicKey,
        },
      });
      toast.success('rejected')
    };

    const execute = async () => {
      const [multisigSigner] = await PublicKey.findProgramAddress(
        [publicKey.toBuffer()],
        program.programId
      );
      await program.rpc.executeTransaction({
        accounts: {
          multisig: publicKey,
          multisigSigner,
          transaction: tx.publicKey,
        },
        remainingAccounts: txAccount.accounts
          .map((t: any) => {
            if (t.pubkey.equals(multisigSigner)) {
              return { ...t, isSigner: false };
            }
            return t;
          })
          .concat({
            pubkey: txAccount.programId,
            isWritable: false,
            isSigner: false,
          }),
      });
        toast.success("executed")
    }

    return(
        <tr>
            <td colSpan={2}>{tx.publicKey.toBase58()}</td>
            <td onClick={() => approve().catch((err) => {
                  let errStr = "";
                  if (err) {
                    errStr = err.toString()
                    console.log(err)
                    }})}> <button onClick={() => approve().catch((err) => toast.error(err.toString()) )} className="bg-main-03 p-2 rounded-md text-black">Approve</button>
                    </td>
            <td height={70} onClick={() => execute().catch((err) => {
              let errStr = "";
              if (err) {
                errStr = err.toString()
                console.log(err)
                }})}><button onClick={() => execute().catch((err) => toast.error(err.toString()) )} className="bg-main-03 p-2 rounded-md text-black">Execute</button>

             </td>
             <td onClick={() => execute().catch((err) => {
              let errStr = "";
              if (err) {
                errStr = err.toString()
                console.log(err)
                }})}><button onClick={() => reject().catch((err) => toast.error(err.toString()) )} className="bg-main-03 p-2 rounded-md text-black">Reject</button>
             </td>
             <td>{txAccount.didExecute ? <div className="bg-main-02 rounded-md w-5 h-5"></div> : null}{txAccount.didReject ? <div className="bg-red-500 rounded-md h-5 w-5"></div> : null}</td>
        </tr>
    )
}